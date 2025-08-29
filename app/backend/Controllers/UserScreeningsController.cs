using Microsoft.AspNetCore.Mvc;
using IoTM.Models;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserScreeningsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserScreeningsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all user screenings for a user
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<UserScreening>>> GetUserScreenings(Guid userId)
        {
            var screenings = await _context.UserScreenings
                .Where(us => us.UserId == userId)
                .ToListAsync();
            return Ok(screenings);
        }

        // Schedule (add) a new screening for a user
        [HttpPost("{userId}/schedule")]
        public async Task<ActionResult<UserScreening>> ScheduleScreening(Guid userId, [FromBody] UserScreening screening)
        {
            screening.UserId = userId;
            _context.UserScreenings.Add(screening);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUserScreenings), new { userId = userId }, screening);
        }

        // Edit a scheduled screening
        [HttpPut("{userId}/schedule/{screeningId}")]
        public async Task<IActionResult> EditScheduledScreening(Guid userId, Guid screeningId, [FromBody] UserScreening updated)
        {
            var screening = await _context.UserScreenings
                .FirstOrDefaultAsync(us => us.UserId == userId && us.ScreeningId == screeningId);
            if (screening == null) return NotFound();

            screening.LastScheduledDate = updated.LastScheduledDate;
            screening.Status = updated.Status;
            screening.ProviderName = updated.ProviderName;
            screening.Notes = updated.Notes;
            screening.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Remove a scheduled screening
        [HttpDelete("{userId}/schedule/{screeningId}")]
        public async Task<IActionResult> RemoveScheduledScreening(Guid userId, Guid screeningId)
        {
            var screening = await _context.UserScreenings
                .FirstOrDefaultAsync(us => us.UserId == userId && us.ScreeningId == screeningId);
            if (screening == null) return NotFound();

            _context.UserScreenings.Remove(screening);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}