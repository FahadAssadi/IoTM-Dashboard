using IoTM.Models;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using IoTM.Dtos;

namespace IoTM.Services
{
    public interface IUserScreeningsService
    {
        Task<List<UserScreening>> GetExistingScreeningsForUserAsync(Guid userId, int? page = null, int? pageSize = null);
        Task<List<UserScreening>> GetNewScreeningsForUserAsync(Guid userId);
        List<UserScreeningDto> MapToDto(List<UserScreening> screenings);
        Task<List<ScheduledScreeningDto>> GetScheduledScreenings(Guid userId);
        Task ScheduleScreening(Guid userId, Guid guidelineId, DateOnly scheduledDate);
        Task EditScheduledScreening(Guid screeningId, DateOnly newDate);
        Task CancelScheduledScreening(Guid screeningId);
        Task ArchiveScheduledScreening(Guid screeningId);
        Task HideScreening(Guid userId, Guid guidelineId);
        Task UnhideScreening(Guid userId, Guid guidelineId);
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
        /// Get all existing screenings for a specific user, with pagination.
        /// </summary>
        public async Task<List<UserScreening>> GetExistingScreeningsForUserAsync(Guid userId, int? page = null, int? pageSize = null)
        {
            try
            {
                var query = _context.UserScreenings
                    .Include(us => us.Guideline)
                    .Include(us => us.ScheduledScreenings)
                    .Where(us => us.UserId == userId);

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

        public List<UserScreeningDto> MapToDto(List<UserScreening> screenings)
        {
            return screenings.Select(us => new UserScreeningDto
            {
                ScreeningId = us.ScreeningId,
                GuidelineId = us.GuidelineId,
                Guideline = us.Guideline != null ? _screeningGuidelineService.MapToDto(us.Guideline) : null!,
                LastScheduledDate = us.LastScheduledDate,
                Status = us.Status,
                CompletedDate = us.CompletedDate,
                NextDueDate = us.NextDueDate,
                ReminderSent = us.ReminderSent,
                ScheduledScreenings = us.ScheduledScreenings?
                    .Select(ss => new ScheduledScreeningDto
                    {
                        ScheduledScreeningId = ss.ScheduledScreeningId,
                        ScheduledDate = ss.ScheduledDate,
                        IsActive = ss.IsActive
                    }).ToList() ?? new List<ScheduledScreeningDto>()
            }).ToList();
        }

        public async Task<List<ScheduledScreeningDto>> GetScheduledScreenings(Guid userId)
        {
            try
            {
                var scheduledScreenings = await _context.ScheduledScreenings
                    .Include(ss => ss.UserScreening)
                    .ThenInclude(us => us.Guideline)
                    .Where(ss => ss.UserScreening.UserId == userId && ss.IsActive == true)
                    .ToListAsync();

                return scheduledScreenings.Select(ss => new ScheduledScreeningDto
                {
                    ScheduledScreeningId = ss.ScheduledScreeningId,
                    ScheduledDate = ss.ScheduledDate,
                    IsActive = ss.IsActive,
                    ScreeningId = ss.ScreeningId,
                    GuidelineId = ss.UserScreening.Guideline.GuidelineId,
                    GuidelineName = ss.UserScreening.Guideline.Name,
                    ScreeningType = ss.UserScreening.Guideline.ScreeningType,
                    DefaultFrequencyMonths = ss.UserScreening.Guideline.DefaultFrequencyMonths
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching scheduled screenings for {UserId}", userId);
                return new List<ScheduledScreeningDto>();
            }
        }

        public async Task ScheduleScreening(Guid userId, Guid guidelineId, DateOnly scheduledDate)
        {
            try
            {
                // Find or create UserScreening for this guideline/user
                var userScreening = await _context.UserScreenings
                    .FirstOrDefaultAsync(us => us.UserId == userId && us.GuidelineId == guidelineId);

                if (userScreening == null)
                {
                    userScreening = new UserScreening
                    {
                        ScreeningId = Guid.NewGuid(),
                        UserId = userId,
                        GuidelineId = guidelineId,
                        Status = ScreeningStatus.pending,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.UserScreenings.Add(userScreening);
                    await _context.SaveChangesAsync();
                }

                // Add scheduled screening
                var scheduledScreening = new ScheduledScreening
                {
                    ScheduledScreeningId = Guid.NewGuid(),
                    ScreeningId = userScreening.ScreeningId,
                    ScheduledDate = scheduledDate,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ScheduledScreenings.Add(scheduledScreening);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling screening for user {UserId}", userId);
                throw;
            }
        }

        public async Task EditScheduledScreening(Guid screeningId, DateOnly newDate)
        {
            try
            {
                var scheduledScreening = await _context.ScheduledScreenings
                    .FirstOrDefaultAsync(ss => ss.ScheduledScreeningId == screeningId);

                if (scheduledScreening != null)
                {
                    scheduledScreening.ScheduledDate = newDate;
                    scheduledScreening.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing scheduled screening {ScreeningId}", screeningId);
                throw;
            }
        }

        public async Task CancelScheduledScreening(Guid screeningId)
        {
            try
            {
                var scheduledScreening = await _context.ScheduledScreenings
                    .FirstOrDefaultAsync(ss => ss.ScheduledScreeningId == screeningId);

                if (scheduledScreening != null)
                {
                    _context.ScheduledScreenings.Remove(scheduledScreening);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling scheduled screening {ScreeningId}", screeningId);
                throw;
            }
        }

        public async Task ArchiveScheduledScreening(Guid screeningId)
        {
            try
            {
                var scheduledScreening = await _context.ScheduledScreenings
                    .FirstOrDefaultAsync(ss => ss.ScheduledScreeningId == screeningId);

                if (scheduledScreening != null)
                {
                    scheduledScreening.IsActive = false;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving scheduled screening {ScreeningId}", screeningId);
                throw;
            }
        }

        public async Task HideScreening(Guid userId, Guid guidelineId)
        {
            var screening = await _context.UserScreenings
                .FirstOrDefaultAsync(us => us.UserId == userId && us.GuidelineId == guidelineId);

            if (screening != null)
            {
                screening.Status = ScreeningStatus.skipped;
                screening.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task UnhideScreening(Guid userId, Guid guidelineId)
        {
            var screening = await _context.UserScreenings
                .FirstOrDefaultAsync(us => us.UserId == userId && us.GuidelineId == guidelineId);

            if (screening != null)
            {
                screening.Status = ScreeningStatus.pending;
                screening.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}