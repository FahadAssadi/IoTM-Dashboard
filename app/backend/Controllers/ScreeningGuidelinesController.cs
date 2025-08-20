using Microsoft.AspNetCore.Mvc;
using IoTM.Models;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScreeningGuidelinesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ScreeningGuidelinesController(ApplicationDbContext context)
        {
            _context = context;
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
    }
}