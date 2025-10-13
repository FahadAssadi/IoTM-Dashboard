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
    [Route("api/healthconnect/bloodPressure")]
    [Authorize]
    public class BloodPressureController(ApplicationDbContext context, BloodPressureService service) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly BloodPressureService _service = service;

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> PostBloodPressureDataTest([FromBody] BloodPressureDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || !dataDto.Points.Any())
            {
                return BadRequest("Data is required");
            }
            Guid userId = Guid.NewGuid();
            // Retrieve the most recent segment for the user (by End time)
            var lastSegment = await _context.HealthSegmentBloodPressures
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            // Create new segments using the new data
            var filteredPoints = dataDto.Points
                .OfType<BloodPressurePointDto>()  
                .ToList();
            var segments = _service.SegmentData(filteredPoints, userId, lastSegment);
            // Does NOT save to DB
            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.Points,
                s.AverageSystolic,
                s.AverageDiastolic,
                s.SystolicStandardDeviation,
                s.DiastolicStandardDeviation,
                s.DurationHours,
                s.Category
            }));
        }

        [HttpPost("{userId}")]
        public async Task<IActionResult> PostBloodPressureData(Guid userId, [FromBody] BloodPressureDto dataDto)
        {
            if (dataDto == null || dataDto.Points == null || dataDto.Points.Count == 0)
            {
                return BadRequest("Data is required");
            }

            // Retrieve the most recent segment for the user (by End time)
            var lastSegment = await _context.HealthSegmentBloodPressures
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.End)
                .FirstOrDefaultAsync();
            // Remove the last segment if it exists
            if (lastSegment != null)
            {
                _context.HealthSegmentBloodPressures.Remove(lastSegment);
                await _context.SaveChangesAsync(); // Save immediately to persist deletion
            }
            // Create new segments using the new data
            var filteredPoints = dataDto.Points
                .OfType<BloodPressurePointDto>()  
                .ToList();
            var segments = _service.SegmentData(filteredPoints, userId, lastSegment);
            // Save to DB
            await _context.HealthSegmentBloodPressures.AddRangeAsync(segments);
            await _context.SaveChangesAsync();
            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.Points,
                s.AverageSystolic,
                s.AverageDiastolic,
                s.SystolicStandardDeviation,
                s.DiastolicStandardDeviation,
                s.DurationHours,
                s.Category
            }));
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserBloodPressureData(Guid userId)
        {
            var segments = await _context.HealthSegmentBloodPressures
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.Start) // optional: sort latest first
                .ToListAsync();

            if (segments == null || segments.Count == 0)
            {
                return NotFound($"No health segments found for user {userId}");
            }

            return Ok(segments.Select(s => new
            {
                s.Start,
                s.End,
                s.Points,
                s.AverageSystolic,
                s.AverageDiastolic,
                s.SystolicStandardDeviation,
                s.DiastolicStandardDeviation,
                s.DurationHours,
                s.Category
            }));
        }
    }
}