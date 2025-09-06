using IoTM.Data;
using IoTM.Config;
using Microsoft.AspNetCore.Mvc;


namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthConnectController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly HealthThresholds _thresholds;

        public HealthConnectController(ApplicationDbContext context)
        {
            _context = context;
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
            Guid userId = Guid.NewGuid(); // This is just to test

            var segmenter = new HealthSegmenter();
            var segments = segmenter.SegmentData(dataDto.Points, userId);

            // Save to DB (if needed)
            // await _context.HealthSegments.AddRangeAsync(segments);
            // await _context.SaveChangesAsync();

            return Ok(segments.Select(s => new {
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
