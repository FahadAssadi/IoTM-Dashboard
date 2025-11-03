using IoTM.Data;
using IoTM.Dtos.HealthConnect;
using IoTM.Dtos.HealthPoints;
using IoTM.Services.HealthConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Controllers.HealthConnect
{
    [ApiController]
    [Route("api/healthconnect/sleep")]
    [Authorize]
    public class SleepController(ApplicationDbContext context, SleepService service) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly SleepService _service = service;

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> PostSleepDataTest([FromBody] SleepDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || !dataDto.Points.Any())
            {
                return BadRequest("Data is required");
            }
            Guid userId = Guid.NewGuid();
            // Retrieve the most recent segment for the user (by End time)
            var lastSegment = await _context.HealthSegmentSleeps
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            // Create new segments using the new data
            var filteredPoints = dataDto.Points
                .OfType<SleepSegmentDto>()
                .ToList();
            var segments = _service.SegmentData(filteredPoints, userId, lastSegment);
            // Does NOT save to DB
            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.DurationHours,
                s.Category
            }));
        }

        [HttpPost("{userId}")]
        public async Task<IActionResult> PostSleepData(Guid userId, [FromBody] SleepDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || dataDto.Points.Count == 0)
            {
                return BadRequest("Data is required");
            }
            // Retrieve the most recent segment for the user (by End time)
            var lastSegment = await _context.HealthSegmentSleeps
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            // Remove the last segment if it exists
            if (lastSegment != null)
            {
                _context.HealthSegmentSleeps.Remove(lastSegment);
                await _context.SaveChangesAsync(); // Save immediately to persist deletion
            }
            // Create new segments using the new data
            var filteredPoints = dataDto.Points
                .OfType<SleepSegmentDto>()
                .ToList();
            var segments = _service.SegmentData(filteredPoints, userId, lastSegment);
            // Save to DB
            await _context.HealthSegmentSleeps.AddRangeAsync(segments);
            await _context.SaveChangesAsync();
            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.DurationHours,
                s.Category
            }));
        }
        
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserSleepData(Guid userId)
        {
            var segments = await _context.HealthSegmentSleeps
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.Start)
                .ToListAsync();

            if (segments == null || segments.Count == 0)
            {
                return NotFound($"No health segments found for user {userId}");
            }

            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.DurationHours,
                s.Category
            }));
        }
    }
}