using Microsoft.AspNetCore.Mvc;
using IoTM.Config;
using IoTM.Data;
using IoTM.Services.HealthConnect;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace IoTM.Controllers.HealthConnect
{
    [ApiController]
    [Route("api/healthconnect/bpm")]
    [Authorize]
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
        [AllowAnonymous]
        public IActionResult PostBpmDataTest([FromBody] HealthDataDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || !dataDto.Points.Any())
            {
                return BadRequest("Data is required");
            }
            Guid userId = Guid.NewGuid(); // Random UID This is just to test
            var segments = _segmenter.SegmentData(dataDto.Points, userId);
            // Doesn't save to DB
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
        public async Task<IActionResult> PostBpmData(Guid userId, [FromBody] HealthDataDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || !dataDto.Points.Any())
            {
                return BadRequest("Data is required");
            }
            var segments = _segmenter.SegmentData(dataDto.Points, userId);
            // Save to DB
            await _context.HealthSegmentBPMs.AddRangeAsync(segments);
            await _context.SaveChangesAsync();
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