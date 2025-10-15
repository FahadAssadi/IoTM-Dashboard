using IoTM.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Controllers.HealthConnect
{
    [ApiController]
    [Route("api/healthconnect/healthSummary")]
    [Authorize]
    public class HealthSummaryController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        [HttpGet("{userId}")]
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
    }
}