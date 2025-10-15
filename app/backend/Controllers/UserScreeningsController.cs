using Microsoft.AspNetCore.Mvc;
using IoTM.Models;
using IoTM.Services;
using Microsoft.AspNetCore.Authorization;
using IoTM.Dtos;

namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserScreeningsController : ControllerBase
    {
        private readonly IUserScreeningsService _userScreeningsService;

        public UserScreeningsController(IUserScreeningsService userScreeningsService)
        {
            _userScreeningsService = userScreeningsService;
        }

        /// <summary>
        /// Get existing user screenings.
        /// </summary>
        /// <returns></returns>
        //[Authorize]
        [HttpGet]
        public async Task<ActionResult<PagedResult<UserScreeningDto>>> GetUserScreenings([FromQuery] int page = 1, [FromQuery] int pageSize = 4)
        {
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // TODO: replace with auth user
            var (items, total) = await _userScreeningsService.GetVisibleScreeningsForUserPagedAsync(userId, page, pageSize);
            var itemDtos = _userScreeningsService.MapToDto(items);

            var result = new PagedResult<UserScreeningDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = total,
                Items = itemDtos
            };

            return Ok(result);
        }

        // Schedule a screening
        // [Authorize]
        [HttpPost("schedule")]
        public async Task<IActionResult> ScheduleScreening(Guid guidelineId, DateOnly scheduledDate)
        {
            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var scheduled = await _userScreeningsService.ScheduleScreening(userId, guidelineId, scheduledDate);
            if (!scheduled)
            {
                return Conflict("You’ve already scheduled this screening for that date.");
            }
            return Ok("Screening scheduled.");
        }

        // Edit a scheduled screening
        //[Authorize]
        [HttpPut("schedule/{scheduledScreeningId}")]
        public async Task<IActionResult> EditScheduledScreening(Guid scheduledScreeningId, DateOnly newDate)
        {
            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            await _userScreeningsService.EditScheduledScreening(scheduledScreeningId, newDate);
            try
            {
                var updated = await _userScreeningsService.EditScheduledScreening(scheduledScreeningId, newDate);
                if (!updated)
                {
                    return Conflict("A screening is already scheduled for that date.");
                }
                return Ok("Scheduled screening updated.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // Remove a scheduled screening
        //[Authorize]
        [HttpDelete("schedule/{scheduledScreeningId}")]
        public async Task<IActionResult> RemoveScheduledScreening(Guid scheduledScreeningId)
        {
            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

            await _userScreeningsService.CancelScheduledScreening(scheduledScreeningId);
            return Ok("Scheduled screening removed.");
        }

        /// <summary>
        /// Get new screenings that the user is eligible for.
        /// This is called when the user creates an account and when they request to fetch new screenings,
        /// such as when a new screening program is introduced.
        /// </summary>
        //[Authorize]
        [HttpPost("new-screenings")]
        public async Task<ActionResult<IEnumerable<UserScreening>>> GetNewScreeningsForUser()
        {
            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

            var newScreenings = await _userScreeningsService.GetNewScreeningsForUserAsync(userId);
            var dto = _userScreeningsService.MapToDto(newScreenings);
            return Ok(dto);
        }

        // Get all scheduled screenings for the user
        [HttpGet("scheduled")]
        public async Task<ActionResult<IEnumerable<ScheduledScreeningDto>>> GetScheduledScreenings()
        {
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // Replace with authenticated user
            var scheduledScreenings = await _userScreeningsService.GetScheduledScreenings(userId);
            return Ok(scheduledScreenings);
        }

        // Archive a scheduled screening
        [HttpPut("schedule/{scheduledScreeningId:guid}/archive")]
        public async Task<IActionResult> ArchiveScheduledScreening(Guid scheduledScreeningId)
        {
            await _userScreeningsService.ArchiveScheduledScreening(scheduledScreeningId);
            return Ok("Scheduled screening archived.");
        }

        [HttpPut("hide/{guidelineId}")]
        public async Task<IActionResult> HideScreening(Guid guidelineId)
        {
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            await _userScreeningsService.HideScreening(userId, guidelineId);
            return Ok("Screening hidden.");
        }

        [HttpPut("unhide/{guidelineId}")]
        public async Task<IActionResult> UnhideScreening(Guid guidelineId)
        {
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            await _userScreeningsService.UnhideScreening(userId, guidelineId);
            return Ok("Screening unhidden.");
        }

        [HttpGet("hidden")]
        public async Task<ActionResult<IEnumerable<UserScreeningDto>>> GetHiddenScreenings()
        {
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // Replace with authenticated user
            var screenings = await _userScreeningsService.GetHiddenScreeningsForUserAsync(userId);
            var dto = _userScreeningsService.MapToDto(screenings);
            return Ok(dto);
        }

        [HttpGet("archived")]
        public async Task<ActionResult<Dictionary<Guid, List<ScheduledScreeningDto>>>> GetArchivedScreenings()
        {
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // Replace with authenticated user
            var archived = await _userScreeningsService.GetArchivedScreeningsForUserAsync(userId);
            return Ok(archived);
        }
    }
}