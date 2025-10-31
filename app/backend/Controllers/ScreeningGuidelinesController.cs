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
    /// <summary>
    /// Endpoints for managing screening guidelines.
    /// </summary>
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
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ScreeningGuideline>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ScreeningGuideline>>> GetGuidelines()
        {
            var guidelines = await _context.ScreeningGuidelines
                .Include(g => g.FrequencyRules)
                .ToListAsync();
            return Ok(guidelines);
        }

        /// <summary>
        /// Import screening guidelines from JSON files into the database.
        /// </summary>
        /// <remarks>
        /// Reads JSON files from the <c>Scrapers</c> folder.
        /// This operation is idempotent and can be re-run when scrapers are updated.
        /// </remarks>
        [HttpPost("import")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<IActionResult> ImportScreeningGuidelines()
        {
            string scrapersFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "Scrapers");
            await _screeningGuidelineService.ImportOrUpdateScreeningGuidelinesFromJsonAsync(scrapersFolderPath);
            return Ok("Import complete");
        }
    }
}