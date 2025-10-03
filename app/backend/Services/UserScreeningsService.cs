using IoTM.Models;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using IoTM.Dtos;

namespace IoTM.Services
{
    public interface IUserScreeningsService
    {
        Task<(List<UserScreening> Items, int TotalCount)> GetVisibleScreeningsForUserPagedAsync(Guid userId, int page, int pageSize);
        Task<List<UserScreening>> GetNewScreeningsForUserAsync(Guid userId);
        List<UserScreeningDto> MapToDto(List<UserScreening> screenings);
        Task<List<ScheduledScreeningDto>> GetScheduledScreenings(Guid userId);
        Task ScheduleScreening(Guid userId, Guid guidelineId, DateOnly scheduledDate);
        Task EditScheduledScreening(Guid screeningId, DateOnly newDate);
        Task CancelScheduledScreening(Guid screeningId);
        Task ArchiveScheduledScreening(Guid scheduledScreeningId);
        Task HideScreening(Guid userId, Guid guidelineId);
        Task UnhideScreening(Guid userId, Guid guidelineId);
        Task<List<UserScreening>> GetHiddenScreeningsForUserAsync(Guid userId);
        Task<Dictionary<Guid, List<ScheduledScreeningDto>>> GetArchivedScreeningsForUserAsync(Guid userId);
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
        public async Task<(List<UserScreening> Items, int TotalCount)> GetVisibleScreeningsForUserPagedAsync(Guid userId, int page, int pageSize)
        {
            try
            {
                var query = _context.UserScreenings
                    .Include(us => us.Guideline)
                    .Include(us => us.ScheduledScreenings)
                    .Where(us => us.UserId == userId && us.Status != ScreeningStatus.skipped && us.Status != ScreeningStatus.completed && us.Status != ScreeningStatus.scheduled)
                    .OrderBy(us => us.Guideline.Name);

                var total = await query.CountAsync();

                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return (items, total);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching paged visible screenings for {UserId}", userId);
                return (new List<UserScreening>(), 0);
            }
        }

        /// <summary>
        /// Ensure the user's screenings match current recommendations:
        /// - Adds new UserScreenings for newly recommended guidelines.
        /// - Removes UserScreenings that are no longer recommended (based on updated profile).
        ///   Removes completed screenings.
        /// </summary>
        public async Task<List<UserScreening>> GetNewScreeningsForUserAsync(Guid userId)
        {
            try
            {
                // Get current recommended guidelines for the user profile
                var recommendedGuidelines = await _screeningGuidelineService.GetRecommendedScreeningGuidelines(userId);
                var recommendedIds = recommendedGuidelines.Select(g => g.GuidelineId).ToHashSet();

                // Load existing screenings for user
                var existingScreenings = await _context.UserScreenings
                    .Where(us => us.UserId == userId)
                    .ToListAsync();

                // Determine which to add
                var existingIds = existingScreenings.Select(us => us.GuidelineId).ToHashSet();
                var newGuidelines = recommendedGuidelines
                    .Where(g => !existingIds.Contains(g.GuidelineId))
                    .ToList();

                // Determine which to remove (no longer recommended).
                var screeningsToRemove = existingScreenings
                    .Where(us => !recommendedIds.Contains(us.GuidelineId) && (us.Status == ScreeningStatus.completed || us.Status != ScreeningStatus.scheduled))
                    .ToList();

                // Apply changes transactionally
                using var tx = await _context.Database.BeginTransactionAsync();

                // Add new screenings
                var newUserScreenings = newGuidelines.Select(g => new UserScreening
                {
                    ScreeningId = Guid.NewGuid(),
                    UserId = userId,
                    GuidelineId = g.GuidelineId,
                    Status = ScreeningStatus.pending,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();

                if (newUserScreenings.Any())
                {
                    _context.UserScreenings.AddRange(newUserScreenings);
                }

                // Remove screenings that no longer apply (and their scheduled entries)
                if (screeningsToRemove.Any())
                {
                    var toRemoveIds = screeningsToRemove.Select(us => us.ScreeningId).ToList();

                    // Remove scheduled screenings (active or archived) tied to these UserScreenings
                    var scheduledToRemove = await _context.ScheduledScreenings
                        .Where(ss => toRemoveIds.Contains(ss.ScreeningId))
                        .ToListAsync();
                    if (scheduledToRemove.Any())
                    {
                        _context.ScheduledScreenings.RemoveRange(scheduledToRemove);
                    }

                    _context.UserScreenings.RemoveRange(screeningsToRemove);
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return newUserScreenings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reconciling screenings for user {UserId}", userId);
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

                // If the guideline is not recurring, mark as scheduled
                var guideline = await _context.ScreeningGuidelines.FindAsync(guidelineId);
                if (guideline != null && !guideline.IsRecurring)
                {
                    userScreening.Status = ScreeningStatus.scheduled;
                    userScreening.UpdatedAt = DateTime.UtcNow;
                }

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

                    // if screening is archived and non-recurring, set status to completed
                    if (!scheduledScreening.IsActive && !scheduledScreening.UserScreening.Guideline.IsRecurring)
                    {
                        scheduledScreening.UserScreening.Status = ScreeningStatus.completed;
                        scheduledScreening.UserScreening.UpdatedAt = DateTime.UtcNow;
                    }

                    // if screening is not archived and recurring, set status to pending
                    if (scheduledScreening.IsActive && scheduledScreening.UserScreening.Guideline.IsRecurring)
                    {
                        scheduledScreening.UserScreening.Status = ScreeningStatus.pending;
                        scheduledScreening.UserScreening.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling scheduled screening {ScreeningId}", screeningId);
                throw;
            }
        }

        public async Task ArchiveScheduledScreening(Guid scheduledScreeningId)
        {
            try
            {
                var scheduledScreening = await _context.ScheduledScreenings
                    .FirstOrDefaultAsync(x => x.ScheduledScreeningId == scheduledScreeningId);

                if (scheduledScreening != null)
                {
                    scheduledScreening.IsActive = false;
                    await _context.SaveChangesAsync();

                    var guideline = await _context.ScreeningGuidelines.FindAsync(scheduledScreening.UserScreening.GuidelineId);
                    if (guideline != null && !guideline.IsRecurring)
                    {
                        scheduledScreening.UserScreening.Status = ScreeningStatus.scheduled;
                        scheduledScreening.UserScreening.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving scheduled screening {ScreeningId}", scheduledScreeningId);
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

        public async Task<List<UserScreening>> GetHiddenScreeningsForUserAsync(Guid userId)
        {
            return await _context.UserScreenings
                .Include(us => us.Guideline)
                .Include(us => us.ScheduledScreenings)
                .Where(us => us.UserId == userId && us.Status == ScreeningStatus.skipped)
                .ToListAsync();
        }

        public async Task<Dictionary<Guid, List<ScheduledScreeningDto>>> GetArchivedScreeningsForUserAsync(Guid userId)
        {
            var archived = await _context.ScheduledScreenings
                .Include(ss => ss.UserScreening)
                .ThenInclude(us => us.Guideline)
                .Where(ss => ss.UserScreening.UserId == userId && ss.IsActive == false)
                .ToListAsync();

            // Group by guidelineId and sort dates
            var grouped = archived
                .GroupBy(ss => ss.UserScreening.Guideline.GuidelineId)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderBy(ss => ss.ScheduledDate)
                          .Select(ss => new ScheduledScreeningDto
                          {
                              ScheduledScreeningId = ss.ScheduledScreeningId,
                              ScheduledDate = ss.ScheduledDate,
                              IsActive = ss.IsActive,
                              ScreeningId = ss.ScreeningId,
                              GuidelineId = ss.UserScreening.Guideline.GuidelineId,
                              GuidelineName = ss.UserScreening.Guideline.Name,
                              ScreeningType = ss.UserScreening.Guideline.ScreeningType,
                              DefaultFrequencyMonths = ss.UserScreening.Guideline.DefaultFrequencyMonths
                          }).ToList()
                );

            return grouped;
        }
    }
}