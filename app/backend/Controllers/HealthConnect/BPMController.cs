using Microsoft.AspNetCore.Mvc;
using IoTM.Dtos.HealthData;
using IoTM.Data;
using IoTM.Services.HealthConnect;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Controllers.HealthConnect
{
    [ApiController]
    [Route("api/healthconnect/bpm")]
    [Authorize]
    public class BPMController(ApplicationDbContext context, BPMService service) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly BPMService _service = service;

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> PostBpmDataTest([FromBody] BPMDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || !dataDto.Points.Any())
            {
                return BadRequest("Data is required");
            }
            Guid userId = Guid.NewGuid();
            // Retrieve the most recent segment for the user (by End time)
            var lastSegment = await _context.HealthSegmentBPMs
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            // Create new segments using the new data
            var filteredPoints = dataDto.Points
                .OfType<BPMPointDto>()  
                .ToList();
            var segments = _service.SegmentData(filteredPoints, userId, lastSegment);
            // Does NOT save to DB
            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.Points,
                s.AverageBpm,
                s.StandardDeviation,
                s.DurationHours,
                s.Category
            }));
        }

        [HttpPost("{userId}")]
        public async Task<IActionResult> PostBpmData(Guid userId, [FromBody] BPMDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || !dataDto.Points.Any())
            {
                return BadRequest("Data is required");
            }

            // Retrieve the most recent segment for the user (by End time)
            var lastSegment = await _context.HealthSegmentBPMs
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            // Remove the last segment if it exists
            if (lastSegment != null)
            {
                _context.HealthSegmentBPMs.Remove(lastSegment);
                await _context.SaveChangesAsync(); // Save immediately to persist deletion
            }
            // Create new segments using the new data
            var filteredPoints = dataDto.Points
                .OfType<BPMPointDto>()  
                .ToList();
            var segments = _service.SegmentData(filteredPoints, userId, lastSegment);
            // Save to DB
            await _context.HealthSegmentBPMs.AddRangeAsync(segments);
            await _context.SaveChangesAsync();
            // update the health summary (await not needed because we don't care)
            await _service.UpdateHealthSummary(_context, segments, userId);
            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.Points,
                s.AverageBpm,
                s.StandardDeviation,
                s.DurationHours,
                s.Category
            }));
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserBpmData(Guid userId)
        {
            var segments = await _context.HealthSegmentBPMs
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
                s.AverageBpm,
                s.StandardDeviation,
                s.DurationHours,
                s.Category
            }));
        }
    }
}