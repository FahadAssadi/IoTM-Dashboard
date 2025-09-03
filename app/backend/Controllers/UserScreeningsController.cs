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
        public async Task<ActionResult<IEnumerable<UserScreeningDto>>> GetUserScreenings([FromQuery] int page = 1, [FromQuery] int pageSize = 4)
        {
            // // Get userId from authentication context (claims)
            // var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("userId");
            // if (userIdClaim == null)
            //     return Unauthorized();

            // Guid userId = Guid.Parse(userIdClaim.Value);

            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

            var screenings = await _userScreeningsService.GetExistingScreeningsForUserAsync(userId, page, pageSize);
            var dto = _userScreeningsService.MapToDto(screenings);
            return Ok(dto);
        }

        // Schedule a screening
        // [Authorize]
        [HttpPost("schedule")]
        public async Task<IActionResult> ScheduleScreening(Guid guidelineId, DateOnly scheduledDate)
        {
            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            await _userScreeningsService.ScheduleScreening(userId, guidelineId, scheduledDate);
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
            return Ok("Scheduled screening updated.");
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

        // Archive a scheduled screening (mark as inactive)
        [HttpPut("archive/{scheduledScreeningId}")]
        public async Task<IActionResult> ArchiveScheduledScreening(Guid scheduledScreeningId)
        {
            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

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
    }
}