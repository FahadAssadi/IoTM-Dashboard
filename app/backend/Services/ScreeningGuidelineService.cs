using IoTM.Models;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace IoTM.Services
{
    public interface IScreeningGuidelineService
    {
        Task<List<ScreeningGuideline>> GetRecommendedScreeningGuidelines(Guid userId);
        Task ImportOrUpdateScreeningGuidelinesFromJsonAsync(string jsonFilePath);
    }

    public class ScreeningGuidelineService : IScreeningGuidelineService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ScreeningGuidelineService> _logger;

        public ScreeningGuidelineService(ApplicationDbContext context, ILogger<ScreeningGuidelineService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get recommended screening guidelines for a user based on their medical profile.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public async Task<List<ScreeningGuideline>> GetRecommendedScreeningGuidelines(Guid userId)
        {
            try
            {
                // Fetch user and their medical profile
                var user = await _context.Users
                    .Include(u => u.MedicalProfile)
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                {
                    _logger.LogWarning("User {UserId} not found.", userId);
                    return new List<ScreeningGuideline>();
                }

                // Fetch all screening guidelines with frequency rules
                var guidelines = await _context.ScreeningGuidelines
                    .Include(g => g.FrequencyRules)
                    .Where(g => g.IsActive)
                    .ToListAsync();

                // Filter for eligibility
                // TODO: add pregnancy filtering functionality
                var eligibleGuidelines = guidelines.Where(g =>
                    (!g.MinAge.HasValue || user.Age() >= g.MinAge) &&
                    (!g.MaxAge.HasValue || user.Age() <= g.MaxAge) &&
                    (g.SexApplicable == SexApplicable.both || (int)g.SexApplicable == (int)user.Sex)
                ).ToList();

                // Determine recommended frequency for each guideline
                foreach (var guideline in eligibleGuidelines)
                {
                    var matchingRule = guideline.FrequencyRules.FirstOrDefault(r =>
                        (!r.MinAge.HasValue || user.Age() >= r.MinAge) &&
                        (!r.MaxAge.HasValue || user.Age() <= r.MaxAge) &&
                        (!r.SexApplicable.HasValue || (int)r.SexApplicable == (int)user.Sex)
                    );

                    guideline.DefaultFrequencyMonths = matchingRule?.FrequencyMonths ?? guideline.DefaultFrequencyMonths;
                }

                return eligibleGuidelines;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended screening guidelines for user {UserId}", userId);
                return new List<ScreeningGuideline>();
            }
        }

        public async Task ImportOrUpdateScreeningGuidelinesFromJsonAsync(string scrapersFolderPath)
        {
            try
            {
                var allGuidelines = new List<ScreeningGuideline>();

                // Get all .json files in the scrapers folder
                var jsonFiles = Directory.GetFiles(scrapersFolderPath, "*.json");

                foreach (var jsonFile in jsonFiles)
                {
                    var json = await File.ReadAllTextAsync(jsonFile);
                    var importedGuidelines = JsonSerializer.Deserialize<List<ScreeningGuideline>>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
                    });

                    if (importedGuidelines != null)
                    {
                        allGuidelines.AddRange(importedGuidelines);
                    }
                }

                foreach (var imported in allGuidelines)
                {
                    // Find existing by unique field
                    var existing = await _context.ScreeningGuidelines
                        .Include(g => g.FrequencyRules)
                        .FirstOrDefaultAsync(g => g.Name == imported.Name);

                    if (existing != null)
                    {
                        // Update fields
                        existing.ScreeningType = imported.ScreeningType;
                        existing.DefaultFrequencyMonths = imported.DefaultFrequencyMonths;
                        existing.Category = imported.Category;
                        existing.SexApplicable = imported.SexApplicable;
                        existing.PregnancyApplicable = imported.PregnancyApplicable;
                        existing.FrequencyRules = imported.FrequencyRules;
                        existing.Description = imported.Description;
                        existing.Cost = imported.Cost;
                        existing.Delivery = imported.Delivery;
                        existing.Link = imported.Link;
                        existing.IsActive = imported.IsActive;
                        existing.LastUpdated = imported.LastUpdated;
                        existing.isRecurring = imported.isRecurring;
                        // Update frequency rules
                        existing.FrequencyRules.Clear();
                        foreach (var rule in imported.FrequencyRules)
                        {
                            existing.FrequencyRules.Add(rule);
                        }
                    }
                    else
                    {
                        imported.GuidelineId = Guid.NewGuid();
                        _context.ScreeningGuidelines.Add(imported);
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing screening guidelines from scrapers folder");
                throw;
            }
        }
    }
}