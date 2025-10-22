using IoTM.Data;
using IoTM.Services.HealthConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Controllers.HealthConnect
{
    [ApiController]
    [Route("api/healthconnect/healthSummary")]
    [Authorize]
    public class HealthSummaryController(ApplicationDbContext context, HealthSummaryService service) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly HealthSummaryService _service = service;

        [HttpGet("recent/{userId}")]
        public async Task<IActionResult> GetRecentValues(Guid userId)
        {
            // Retrieve the most recent segments for the user (by End time)
            var recentBpmSegment = await _context.HealthSegmentBPMs
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            var recentSpO2Segment = await _context.HealthSegmentSpO2s
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            var recentBloodPressureSegment = await _context.HealthSegmentBloodPressures
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();

            var result = new
            {
                BPM = recentBpmSegment?.AverageBpm,
                SpO2 = recentSpO2Segment?.AverageSpO2,
                SystolicBloodPressure = recentBloodPressureSegment?.AverageSystolic,
                DiastolicBloodPressure = recentBloodPressureSegment?.AverageDiastolic
            };
            return Ok(result);
        }

        [HttpGet("{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetHealthSummary(Guid userId)
        {
            var segments = await _context.HealthSegmentSummarys
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
                s.AverageBpm,
                s.AverageDiastolic,
                s.AverageSystolic,
                s.DurationHours,
            }));
        }
    }
}