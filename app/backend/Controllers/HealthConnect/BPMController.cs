using Microsoft.AspNetCore.Mvc;
using IoTM.Config;
using IoTM.Data;
using IoTM.Services;
using IoTM.Services.HealthConnect;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Controllers.HealthConnect
{
    [ApiController]
    [Route("api/healthconnect/bpm")]
    public class BPMController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly BPMSegmenter _segmenter;

        public BPMController(ApplicationDbContext context, BPMSegmenter segmenter)
        {
            _context = context;
            _segmenter = segmenter;
        }

        [HttpPost]
        public async Task<IActionResult> PostBpmData([FromBody] HealthDataDto dataDto)
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
            // await _context.HealthSegmentBPMs.AddRangeAsync(segments);
            // await _context.SaveChangesAsync();

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