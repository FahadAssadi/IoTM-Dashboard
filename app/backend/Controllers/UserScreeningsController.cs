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
        private static readonly Guid MockUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        public UserScreeningsController(IUserScreeningsService userScreeningsService)
        {
            _userScreeningsService = userScreeningsService;
        }

        private static Guid EffectiveUserId(Guid? userId)
        {
            return userId ?? MockUserId;
        }

        /// <summary>
        /// Get existing user screenings.
        /// </summary>
        /// <returns></returns>
        //[Authorize]
        [HttpGet]
        public async Task<ActionResult<PagedResult<UserScreeningDto>>> GetUserScreenings([FromQuery] int page = 1, [FromQuery] int pageSize = 4, [FromQuery] Guid? userId = null)
        {
            var (items, total) = await _userScreeningsService.GetVisibleScreeningsForUserPagedAsync(EffectiveUserId(userId), page, pageSize);
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
        public async Task<IActionResult> ScheduleScreening(Guid guidelineId, DateOnly scheduledDate, [FromQuery] Guid? userId = null)
        {
            var scheduled = await _userScreeningsService.ScheduleScreening(EffectiveUserId(userId), guidelineId, scheduledDate);
            if (!scheduled)
            {
                return Conflict("You’ve already scheduled this screening for that date.");
            }
            return Ok("Screening scheduled.");
        }

        // Edit a scheduled screening
        //[Authorize]
        [HttpPut("schedule/{scheduledScreeningId}")]
        public async Task<IActionResult> EditScheduledScreening(Guid scheduledScreeningId, DateOnly newDate, [FromQuery] Guid? userId = null)
        {
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
        public async Task<IActionResult> RemoveScheduledScreening(Guid scheduledScreeningId, [FromQuery] Guid? userId = null)
        {
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
        public async Task<ActionResult<IEnumerable<UserScreening>>> GetNewScreeningsForUser([FromQuery] Guid? userId = null)
        {
            var newScreenings = await _userScreeningsService.GetNewScreeningsForUserAsync(EffectiveUserId(userId));
            var dto = _userScreeningsService.MapToDto(newScreenings);
            return Ok(dto);
        }

        // Get all scheduled screenings for the user
        [HttpGet("scheduled")]
        public async Task<ActionResult<IEnumerable<ScheduledScreeningDto>>> GetScheduledScreenings([FromQuery] Guid? userId = null)
        {
            var scheduledScreenings = await _userScreeningsService.GetScheduledScreenings(EffectiveUserId(userId));
            return Ok(scheduledScreenings);
        }

        // Archive a scheduled screening
        [HttpPut("schedule/{scheduledScreeningId:guid}/archive")]
        public async Task<IActionResult> ArchiveScheduledScreening(Guid scheduledScreeningId, [FromQuery] Guid? userId = null)
        {
            await _userScreeningsService.ArchiveScheduledScreening(scheduledScreeningId);
            return Ok("Scheduled screening archived.");
        }

        [HttpPut("hide/{guidelineId}")]
        public async Task<IActionResult> HideScreening(Guid guidelineId, [FromQuery] Guid? userId = null)
        {
            await _userScreeningsService.HideScreening(EffectiveUserId(userId), guidelineId);
            return Ok("Screening hidden.");
        }

        [HttpPut("unhide/{guidelineId}")]
        public async Task<IActionResult> UnhideScreening(Guid guidelineId, [FromQuery] Guid? userId = null)
        {
            await _userScreeningsService.UnhideScreening(EffectiveUserId(userId), guidelineId);
            return Ok("Screening unhidden.");
        }

        [HttpGet("hidden")]
        public async Task<ActionResult<IEnumerable<UserScreeningDto>>> GetHiddenScreenings([FromQuery] Guid? userId = null)
        {
            var screenings = await _userScreeningsService.GetHiddenScreeningsForUserAsync(EffectiveUserId(userId));
            var dto = _userScreeningsService.MapToDto(screenings);
            return Ok(dto);
        }

        [HttpGet("archived")]
        public async Task<ActionResult<Dictionary<Guid, List<ScheduledScreeningDto>>>> GetArchivedScreenings([FromQuery] Guid? userId = null)
        {
            var archived = await _userScreeningsService.GetArchivedScreeningsForUserAsync(EffectiveUserId(userId));
            return Ok(archived);
        }
    }
}