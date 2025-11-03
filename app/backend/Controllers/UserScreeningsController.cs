using Microsoft.AspNetCore.Mvc;
using IoTM.Models;
using IoTM.Services;
using Microsoft.AspNetCore.Authorization;
using IoTM.Dtos;

namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    /// <summary>
    /// Endpoints for managing a user's health screenings, including listing, scheduling,
    /// editing, hiding, and archiving.
    /// </summary>
    /// <remarks>
    /// All endpoints require a non-empty <c>userId</c> query parameter. Requests that omit
    /// or provide an empty <c>userId</c> will receive a 400 Bad Request response with the
    /// message "User ID is required.".
    /// </remarks>
    public class UserScreeningsController : ControllerBase
    {
        private readonly IUserScreeningsService _userScreeningsService;

        public UserScreeningsController(IUserScreeningsService userScreeningsService)
        {
            _userScreeningsService = userScreeningsService;
        }

        private static bool TryValidateUserId(Guid? userId, out Guid value, out IActionResult? errorResult)
        {
            if (userId is null || userId == Guid.Empty)
            {
                value = Guid.Empty;
                errorResult = new BadRequestObjectResult("User ID is required.");
                return false;
            }
            value = userId.Value;
            errorResult = null;
            return true;
        }

        /// <summary>
        /// Returns a paginated list of the user's visible screenings.
        /// </summary>
        /// <param name="page">1-based page index. Defaults to 1.</param>
        /// <param name="pageSize">Number of items per page. Defaults to 4.</param>
        /// <param name="userId">The ID of the user to fetch screenings for. Required.</param>
        /// <returns>Paged result containing visible user screenings.</returns>
        //[Authorize]
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<UserScreeningDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PagedResult<UserScreeningDto>>> GetUserScreenings([FromQuery] int page = 1, [FromQuery] int pageSize = 4, [FromQuery] Guid? userId = null)
        {
            if (userId is null || userId == Guid.Empty) return BadRequest("User ID is required.");
            var (items, total) = await _userScreeningsService.GetVisibleScreeningsForUserPagedAsync(userId.Value, page, pageSize);
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
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Schedules a new screening (due date) for the given guideline and user.
        /// </summary>
        /// <param name="guidelineId">The ID of the screening guideline.</param>
        /// <param name="scheduledDate">The date to schedule (YYYY-MM-DD).</param>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>200 when scheduled; 409 when a duplicate exists; 400 when userId is missing.</returns>
        public async Task<IActionResult> ScheduleScreening([FromQuery] Guid guidelineId, [FromQuery] DateOnly scheduledDate, [FromQuery] Guid? userId = null)
        {
            if (!TryValidateUserId(userId, out var uid, out var error)) return error!;
            var scheduled = await _userScreeningsService.ScheduleScreening(uid, guidelineId, scheduledDate);
            if (!scheduled)
            {
                return Conflict("You’ve already scheduled this screening for that date.");
            }
            return Ok("Screening scheduled.");
        }

        // Edit a scheduled screening
        //[Authorize]
        [HttpPut("schedule/{scheduledScreeningId:guid}")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Updates the scheduled date for an existing scheduled screening item.
        /// </summary>
        /// <param name="scheduledScreeningId">The ID of the scheduled screening.</param>
        /// <param name="newDate">The new scheduled date (YYYY-MM-DD).</param>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>200 when updated; 404 if not found; 409 if date conflicts; 400 if userId missing.</returns>
        public async Task<IActionResult> EditScheduledScreening(Guid scheduledScreeningId, [FromQuery] DateOnly newDate, [FromQuery] Guid? userId = null)
        {
            if (!TryValidateUserId(userId, out var _, out var error)) return error!;
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
        [HttpDelete("schedule/{scheduledScreeningId:guid}")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Cancels (removes) a scheduled screening item.
        /// </summary>
        /// <param name="scheduledScreeningId">The ID of the scheduled screening to remove.</param>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>200 when removed; 400 if userId missing.</returns>
        public async Task<IActionResult> RemoveScheduledScreening(Guid scheduledScreeningId, [FromQuery] Guid? userId = null)
        {
            if (!TryValidateUserId(userId, out var _, out var error)) return error!;
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
        [ProducesResponseType(typeof(IEnumerable<UserScreeningDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Gets new screenings that the user is now eligible for (e.g., based on updated rules).
        /// </summary>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>List of newly eligible screenings; 400 if userId missing.</returns>
        public async Task<ActionResult<IEnumerable<UserScreeningDto>>> GetNewScreeningsForUser([FromQuery] Guid? userId = null)
        {
            if (userId is null || userId == Guid.Empty) return BadRequest("User ID is required.");
            var newScreenings = await _userScreeningsService.GetNewScreeningsForUserAsync(userId.Value);
            var dto = _userScreeningsService.MapToDto(newScreenings);
            return Ok(dto);
        }

        // Get all scheduled screenings for the user
        [HttpGet("scheduled")]
        [ProducesResponseType(typeof(IEnumerable<ScheduledScreeningDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Returns all scheduled screening instances for the specified user.
        /// </summary>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>List of scheduled screenings; 400 if userId missing.</returns>
        public async Task<ActionResult<IEnumerable<ScheduledScreeningDto>>> GetScheduledScreenings([FromQuery] Guid? userId = null)
        {
            if (userId is null || userId == Guid.Empty) return BadRequest("User ID is required.");
            var scheduledScreenings = await _userScreeningsService.GetScheduledScreenings(userId.Value);
            return Ok(scheduledScreenings);
        }

        // Archive a scheduled screening
        [HttpPut("schedule/{scheduledScreeningId:guid}/archive")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Archives an existing scheduled screening item.
        /// </summary>
        /// <param name="scheduledScreeningId">The ID of the scheduled screening to archive.</param>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>200 when archived; 400 if userId missing.</returns>
        public async Task<IActionResult> ArchiveScheduledScreening(Guid scheduledScreeningId, [FromQuery] Guid? userId = null)
        {
            if (!TryValidateUserId(userId, out var _, out var error)) return error!;
            await _userScreeningsService.ArchiveScheduledScreening(scheduledScreeningId);
            return Ok("Scheduled screening archived.");
        }

        [HttpPut("hide/{guidelineId:guid}")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Hides a screening guideline from the user's visible list.
        /// </summary>
        /// <param name="guidelineId">The ID of the guideline to hide.</param>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>200 when hidden; 400 if userId missing.</returns>
        public async Task<IActionResult> HideScreening(Guid guidelineId, [FromQuery] Guid? userId = null)
        {
            if (!TryValidateUserId(userId, out var uid, out var error)) return error!;
            await _userScreeningsService.HideScreening(uid, guidelineId);
            return Ok("Screening hidden.");
        }

        [HttpPut("unhide/{guidelineId:guid}")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Unhides a previously hidden screening guideline.
        /// </summary>
        /// <param name="guidelineId">The ID of the guideline to unhide.</param>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>200 when unhidden; 400 if userId missing.</returns>
        public async Task<IActionResult> UnhideScreening(Guid guidelineId, [FromQuery] Guid? userId = null)
        {
            if (!TryValidateUserId(userId, out var uid, out var error)) return error!;
            await _userScreeningsService.UnhideScreening(uid, guidelineId);
            return Ok("Screening unhidden.");
        }

        [HttpGet("hidden")]
        [ProducesResponseType(typeof(IEnumerable<UserScreeningDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Returns all hidden screenings for the specified user.
        /// </summary>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>List of hidden screenings; 400 if userId missing.</returns>
        public async Task<ActionResult<IEnumerable<UserScreeningDto>>> GetHiddenScreenings([FromQuery] Guid? userId = null)
        {
            if (userId is null || userId == Guid.Empty) return BadRequest("User ID is required.");
            var screenings = await _userScreeningsService.GetHiddenScreeningsForUserAsync(userId.Value);
            var dto = _userScreeningsService.MapToDto(screenings);
            return Ok(dto);
        }

        [HttpGet("archived")]
        [ProducesResponseType(typeof(Dictionary<Guid, List<ScheduledScreeningDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        /// <summary>
        /// Returns archived scheduled screenings, grouped by guideline ID.
        /// </summary>
        /// <param name="userId">The ID of the user. Required.</param>
        /// <returns>Dictionary keyed by guideline ID; values are archived scheduled items. 400 if userId missing.</returns>
        public async Task<ActionResult<Dictionary<Guid, List<ScheduledScreeningDto>>>> GetArchivedScreenings([FromQuery] Guid? userId = null)
        {
            if (userId is null || userId == Guid.Empty) return BadRequest("User ID is required.");
            var archived = await _userScreeningsService.GetArchivedScreeningsForUserAsync(userId.Value);
            return Ok(archived);
        }
    }
}