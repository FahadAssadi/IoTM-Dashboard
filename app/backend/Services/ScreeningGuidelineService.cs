using IoTM.Models;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using IoTM.Dtos;

namespace IoTM.Services
{
    public interface IScreeningGuidelineService
    {
        Task<List<ScreeningGuideline>> GetRecommendedScreeningGuidelines(Guid userId);
        Task ImportOrUpdateScreeningGuidelinesFromJsonAsync(string jsonFilePath);
        ScreeningGuidelineDto MapToDto(ScreeningGuideline guideline);
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
                var eligibleGuidelines = guidelines.Where(g =>
                    (!g.MinAge.HasValue || user.Age() >= g.MinAge) &&
                    (!g.MaxAge.HasValue || user.Age() <= g.MaxAge) &&
                    (g.SexApplicable == SexApplicable.both || (user.Sex != null && (int)g.SexApplicable == (int)user.Sex)) &&
                    (
                        user.MedicalProfile == null || user.MedicalProfile.PregnancyStatus == null
                            ? g.PregnancyApplicable == PregnancyApplicable.not_pregnant
                            : (int)g.PregnancyApplicable == (int)user.MedicalProfile.PregnancyStatus
                    )
                ).ToList();

                // Determine recommended frequency for each guideline
                foreach (var guideline in eligibleGuidelines)
                {
                    var matchingRule = guideline.FrequencyRules.FirstOrDefault(r =>
                        (!r.MinAge.HasValue || user.Age() >= r.MinAge) &&
                        (!r.MaxAge.HasValue || user.Age() <= r.MaxAge) &&
                        (!r.SexApplicable.HasValue || (user.Sex != null && (int)r.SexApplicable == (int)user.Sex)) &&
                        (!r.PregnancyApplicable.HasValue ||
                            (user.MedicalProfile?.PregnancyStatus == null
                                ? r.PregnancyApplicable == PregnancyApplicable.not_pregnant
                                : (int)r.PregnancyApplicable == (int)user.MedicalProfile.PregnancyStatus)
                        )
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

        /// <summary>
        /// Imports or updates screening guidelines from JSON files into database.
        /// </summary>
        public async Task ImportOrUpdateScreeningGuidelinesFromJsonAsync(string scrapersFolderPath)
        {
            try
            {
                var allGuidelines = new List<ScreeningGuideline>();

                // Load only top-level JSON files, skip overrides by name/pattern
                var jsonFiles = Directory.GetFiles(scrapersFolderPath, "*.json", SearchOption.TopDirectoryOnly)
                    .Where(f => !string.Equals(Path.GetFileName(f), "overrides.json", StringComparison.OrdinalIgnoreCase)
                             && !f.EndsWith(".overrides.json", StringComparison.OrdinalIgnoreCase))
                    .ToArray();

                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
                };

                foreach (var jsonFile in jsonFiles)
                {
                    try
                    {
                        var json = await File.ReadAllTextAsync(jsonFile);

                        // Guard: only deserialize files whose root is a JSON array
                        using var doc = JsonDocument.Parse(json);
                        if (doc.RootElement.ValueKind != JsonValueKind.Array)
                        {
                            _logger.LogInformation("Skipping {File} because root JSON is not an array.", jsonFile);
                            continue;
                        }

                        var importedGuidelines = JsonSerializer.Deserialize<List<ScreeningGuideline>>(json, jsonOptions);
                        if (importedGuidelines != null)
                        {
                            allGuidelines.AddRange(importedGuidelines);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Skipping invalid guideline JSON file {File}", jsonFile);
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
                        existing.Description = imported.Description;
                        existing.Cost = imported.Cost;
                        existing.Delivery = imported.Delivery;
                        existing.Link = imported.Link;
                        existing.IsActive = imported.IsActive;
                        existing.LastUpdated = imported.LastUpdated;
                        existing.IsRecurring = imported.IsRecurring;

                        // Replace frequency rules
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

        public ScreeningGuidelineDto MapToDto(ScreeningGuideline guideline)
        {
            if (guideline == null) return null!;
            return new ScreeningGuidelineDto
            {
                Id = guideline.GuidelineId,
                Name = guideline.Name,
                ScreeningType = guideline.ScreeningType,
                RecommendedFrequency = FormatFrequency(guideline.DefaultFrequencyMonths),
                Category = guideline.Category,
                Description = guideline.Description,
                Cost = guideline.Cost,
                Delivery = guideline.Delivery,
                Link = guideline.Link,
                IsRecurring = guideline.IsRecurring
            };
        }

        /// <summary>
        /// Helper to format frequency months as a string.
        /// </summary>
        private string FormatFrequency(int months)
        {
            if (months % 12 == 0)
            {
                int years = months / 12;
                return years == 1 ? "1 year" : $"{years} years";
            }
            else
            {
                return months == 1 ? "1 month" : $"{months} months";
            }
        }
    }
}