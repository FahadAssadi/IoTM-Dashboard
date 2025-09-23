using Microsoft.AspNetCore.Mvc;
using IoTM.Config;
using IoTM.Data;
using IoTM.Services.HealthConnect;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace IoTM.Controllers.HealthConnect
{
    [ApiController]
    [Route("api/healthconnect/spo2")]
    [Authorize]
    public class SpO2Controller(ApplicationDbContext context, SpO2Service service) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly SpO2Service _service = service;

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> PostSpO2DataTest([FromBody] HealthDataDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || !dataDto.Points.Any())
            {
                return BadRequest("Data is required");
            }
            Guid userId = Guid.NewGuid();
            // Retrieve the most recent segment for the user (by End time)
            var lastSegment = await _context.HealthSegmentSpO2s
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            // Create new segments using the new data
            var segments = _service.SegmentData(dataDto.Points, userId, null); //, lastSegment);
            // Does NOT save to DB
            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.Points,
                s.AverageSpO2,
                s.StandardDeviation,
                s.DurationHours,
                s.Category
            }));
        }

        [HttpPost("{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> PostSpO2Data(Guid userId, [FromBody] HealthDataDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || !dataDto.Points.Any())
            {
                return BadRequest("Data is required");
            }

            // Retrieve the most recent segment for the user (by End time)
            var lastSegment = await _context.HealthSegmentSpO2s
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            // Remove the last segment if it exists
            if (lastSegment != null)
            {
                _context.HealthSegmentSpO2s.Remove(lastSegment);
                await _context.SaveChangesAsync(); // Save immediately to persist deletion
            }
            // Create new segments using the new data
            var segments = _service.SegmentData(dataDto.Points, userId, lastSegment);
            // Save to DB
            await _context.HealthSegmentSpO2s.AddRangeAsync(segments);
            await _context.SaveChangesAsync();
            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.Points,
                s.AverageSpO2,
                s.StandardDeviation,
                s.DurationHours,
                s.Category
            }));
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserSpO2Data(Guid userId)
        {
            var segments = await _context.HealthSegmentSpO2s
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.Start) // optional: sort latest first
                .ToListAsync();

            if (segments == null || segments.Count == 0)
            {
                return NotFound($"No health segments found for user {userId}");
            }

            return Ok(segments.Select(s => new
            {
                s.Id,
                s.Start,
                s.End,
                s.Points,
                s.AverageSpO2,
                s.StandardDeviation,
                s.DurationHours,
                s.Category
            }));
        }
    }
}