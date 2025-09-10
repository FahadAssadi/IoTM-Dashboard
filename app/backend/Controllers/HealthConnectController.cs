using IoTM.Data;
using IoTM.Config;
using IoTM.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthConnectController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly HealthSegmenter _segmenter;

        public HealthConnectController (ApplicationDbContext context, HealthSegmenter segmenter)
        {
            _context = context;
            _segmenter = segmenter; // DI provides this automatically
        }

        // POST: api/healthconnect
        [HttpPost]
        public async Task<IActionResult> PostHealthData([FromBody] HealthDataDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || !dataDto.Points.Any())
            {
                return BadRequest("Data is required");
            }

            // Example: Assume UserId is passed in header or token
            // Guid userId = GetCurrentUserId(); // Replace with actual user logic
            // Guid userId = Guid.NewGuid(); // This is just to test
            Guid userId = Guid.Parse("60ac6d83-872d-46dc-a29b-537acc84853c");

            var segments = _segmenter.SegmentData(dataDto.Points, userId);

            // Save to DB (if needed)
            await _context.HealthSegmentBPMs.AddRangeAsync(segments);
            await _context.SaveChangesAsync();

            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.Points,
                s.AverageBpm,
                s.StandardDeviation,
                s.DurationHours
            }));
        }
        
        // GET: api/healthconnect/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserHealthSegments(Guid userId)
        {
            var segments = await _context.HealthSegmentBPMs
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.Start) // optional: sort latest first
                .ToListAsync();

            if (segments == null || segments.Count == 0)
            {
                return NotFound($"No health segments found for user {userId}");
            }

            return Ok(segments.Select(s => new {
                s.Id,
                s.Start,
                s.End,
                s.Points,
                s.AverageBpm,
                s.StandardDeviation,
                s.DurationHours
            }));
        }
    }
}
