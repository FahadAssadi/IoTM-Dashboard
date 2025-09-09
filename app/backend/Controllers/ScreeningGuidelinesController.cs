using Microsoft.AspNetCore.Mvc;
using IoTM.Models;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using IoTM.Services;

namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScreeningGuidelinesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IScreeningGuidelineService _screeningGuidelineService;

        public ScreeningGuidelinesController(ApplicationDbContext context, IScreeningGuidelineService screeningGuidelineService)
        {
            _context = context;
            _screeningGuidelineService = screeningGuidelineService;
        }

        /// <summary>
        /// Get all screening guidelines in the database without eligibility filtering.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScreeningGuideline>>> GetGuidelines()
        {
            var guidelines = await _context.ScreeningGuidelines
                .Include(g => g.FrequencyRules)
                .ToListAsync();
            return Ok(guidelines);
        }

        /// <summary>
        /// Import screening guidelines from JSON files into database.
        /// </summary>
        /// <returns></returns>
        [HttpPost("import")]
        public async Task<IActionResult> ImportScreeningGuidelines()
        {
            string scrapersFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "Scrapers");
            await _screeningGuidelineService.ImportOrUpdateScreeningGuidelinesFromJsonAsync(scrapersFolderPath);
            return Ok("Import complete");
        }
    }
}