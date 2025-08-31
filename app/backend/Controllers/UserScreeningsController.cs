using Microsoft.AspNetCore.Mvc;
using IoTM.Models;
using IoTM.Services;
using Microsoft.AspNetCore.Authorization;

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
        public async Task<ActionResult<IEnumerable<UserScreening>>> GetUserScreenings()
        {
            // // Get userId from authentication context (claims)
            // var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("userId");
            // if (userIdClaim == null)
            //     return Unauthorized();

            // Guid userId = Guid.Parse(userIdClaim.Value);

            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

            var screenings = await _userScreeningsService.GetExistingScreeningsForUserAsync(userId);
            return Ok(screenings);
        }

        // Schedule a screening
        [Authorize]
        [HttpPost("schedule")]
        public ActionResult<UserScreening> ScheduleScreening([FromBody] UserScreening screening)
        {
            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

            // You should add a method in the service layer for adding a screening
            // For now, you can use the db context if you haven't implemented it in the service
            // _context.UserScreenings.Add(screening);
            // await _context.SaveChangesAsync();
            // return CreatedAtAction(nameof(GetUserScreenings), new { }, screening);

            // Or, if you add a method in the service:
            // var createdScreening = await _userScreeningsService.AddScreeningForUserAsync(screening);
            // return CreatedAtAction(nameof(GetUserScreenings), new { }, createdScreening);

            return BadRequest("Not implemented in service layer yet.");
        }

        // Edit a scheduled screening
        [Authorize]
        [HttpPut("schedule/{screeningId}")]
        public IActionResult EditScheduledScreening(Guid screeningId, [FromBody] UserScreening updated)
        {
            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

            return BadRequest("Not implemented in service layer yet.");
        }

        // Remove a scheduled screening
        [Authorize]
        [HttpDelete("schedule/{screeningId}")]
        public IActionResult RemoveScheduledScreening(Guid screeningId)
        {
            // TODO: Replace with authenticated user ID when available
            Guid userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

            return BadRequest("Not implemented in service layer yet.");
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
            return Ok(newScreenings);
        }
    }
}