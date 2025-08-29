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

        // Get all guidelines (with frequency rules)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScreeningGuideline>>> GetGuidelines()
        {
            var guidelines = await _context.ScreeningGuidelines
                .Include(g => g.FrequencyRules)
                .ToListAsync();
            return Ok(guidelines);
        }

        // WIP
        // Get guidelines filtered by eligibility (age, sex, etc.)
        // TODO: move this logic to the service layer?
        [HttpGet("eligible")]
        public async Task<ActionResult<IEnumerable<ScreeningGuideline>>> GetEligibleGuidelines([FromQuery] int age, [FromQuery] SexApplicable sex)
        {
            var guidelines = await _context.ScreeningGuidelines
                .Include(g => g.FrequencyRules)
                .Where(g =>
                    (!g.MinAge.HasValue || age >= g.MinAge) &&
                    (!g.MaxAge.HasValue || age <= g.MaxAge) &&
                    (g.SexApplicable == SexApplicable.both || g.SexApplicable == sex)
                )
                .ToListAsync();
            return Ok(guidelines);
        }

        [HttpGet("fromfile")]
        public ActionResult<IEnumerable<ScreeningGuideline>> GetGeneralGuidelines()
        {
            var jsonPath = "Scrapers/general-checkups.json";
            var json = System.IO.File.ReadAllText(jsonPath);

            var guidelines = JsonSerializer.Deserialize<List<ScreeningGuideline>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
            });

            if (guidelines != null)
            {
                foreach (var guideline in guidelines)
                {
                    if (guideline.GuidelineId == Guid.Empty)
                        guideline.GuidelineId = Guid.NewGuid();
                }
            }

            return Ok(guidelines);
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportScreeningGuidelines()
        {
            string scrapersFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "Scrapers");
            await _screeningGuidelineService.ImportOrUpdateScreeningGuidelinesFromJsonAsync(scrapersFolderPath);
            return Ok("Import complete");
        }
    }
}