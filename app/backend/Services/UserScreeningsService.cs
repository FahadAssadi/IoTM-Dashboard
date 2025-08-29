using IoTM.Models;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IoTM.Services
{
    public interface IUserScreeningsService
    {
        Task<List<UserScreening>> GetExistingScreeningsForUserAsync(Guid userId, int? page = null, int? pageSize = null);
        Task<List<UserScreening>> GetNewScreeningsForUserAsync(Guid userId);
        Task<List<UserScreening>> GetScreeningsForMockUserAsync(int? page = null, int? pageSize = null);
        User GetMockUser();

    }

    public class UserScreeningsService : IUserScreeningsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserScreeningsService> _logger;
        private readonly IScreeningGuidelineService _screeningGuidelineService;

        public UserScreeningsService(
            ApplicationDbContext context,
            ILogger<UserScreeningsService> logger,
            IScreeningGuidelineService screeningGuidelineService)
        {
            _context = context;
            _logger = logger;
            _screeningGuidelineService = screeningGuidelineService;
        }

        /// <summary>
        /// Get all screenings for a specific user, with pagination.
        /// </summary>
        public async Task<List<UserScreening>> GetExistingScreeningsForUserAsync(Guid userId, int? page = null, int? pageSize = null)
        {
            try
            {
                var query = _context.UserScreenings
                    .Include(us => us.Guideline)
                    .Where(us => us.UserId == userId);

                query = query.Where(us => us.Status != ScreeningStatus.skipped);

                if (page.HasValue && pageSize.HasValue)
                {
                    query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
                }

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user screenings for {UserId}", userId);
                return new List<UserScreening>();
            }
        }

        /// <summary>
        /// Get new screening programs for a specific user.
        /// This is called when the user creates an account and when they request to fetch new screenings,
        /// such as when a new screening program is introduced.
        /// </summary>
        public async Task<List<UserScreening>> GetNewScreeningsForUserAsync(Guid userId)
        {
            try
            {
                // Fetch all recommended screening guidelines for the user
                var recommendedGuidelines = await _screeningGuidelineService.GetRecommendedScreeningGuidelines(userId);

                // Fetch existing screenings for the user
                var existingScreenings = await _context.UserScreenings
                    .Where(us => us.UserId == userId)
                    .ToListAsync();

                var existingGuidelineIds = existingScreenings
                    .Select(us => us.GuidelineId)
                    .ToHashSet();

                // Find guidelines that are not yet in the user's screenings
                var newGuidelines = recommendedGuidelines
                    .Where(g => !existingGuidelineIds.Contains(g.GuidelineId))
                    .ToList();

                // Create new UserScreening entries for missing guidelines
                var newUserScreenings = newGuidelines.Select(g => new UserScreening
                {
                    ScreeningId = Guid.NewGuid(),
                    UserId = userId,
                    GuidelineId = g.GuidelineId,
                    Status = ScreeningStatus.pending,
                    LastScheduledDate = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();

                // Add new screenings to the database
                if (newUserScreenings.Any())
                {
                    _context.UserScreenings.AddRange(newUserScreenings);
                    await _context.SaveChangesAsync();
                }

                return newUserScreenings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching new screenings for user {UserId}", userId);
                return new List<UserScreening>();
            }
        }

        // TODO: remove this mock data once real user data is available
        /// <summary>
        /// Provide screenings for a mock user (for development/testing).
        /// </summary>
        public async Task<List<UserScreening>> GetScreeningsForMockUserAsync(int? page = null, int? pageSize = null)
        {
            var mockUser = GetMockUser();
            // Use the mock user's ID to fetch screenings
            return await GetExistingScreeningsForUserAsync(mockUser.UserId, page, pageSize);
        }

        // TODO: remove this mock data once real user data is available
        /// <summary>
        /// Returns a mock user for development/testing.
        /// </summary>
        public User GetMockUser()
        {
            return new User
            {
                UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Email = "mockuser@example.com",
                FirstName = "Mock",
                LastName = "User",
                DateOfBirth = DateOnly.Parse("2000-01-01"),
                Sex = Sex.female,
                CountryCode = "AUS",
                Timezone = "Australia/Sydney",
                IsActive = true,
                EmailVerified = true,
                PrivacyConsent = true,
                DataSharingConsent = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                MedicalProfile = new UserMedicalProfile
                {
                    ProfileId = Guid.NewGuid(),
                    UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    SmokingStatus = SmokingStatus.current,
                    PregnancyStatus = PregnancyStatus.postpartum
                }
            };
        }
    }
}