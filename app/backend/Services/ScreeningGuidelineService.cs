using IoTM.Models;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
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

                // Shape the user context once for evaluation
                var ctx = BuildUserContext(user);

                // Load guidelines
                var guidelines = await _context.ScreeningGuidelines
                    .Include(g => g.FrequencyRules)
                    .Where(g => g.IsActive)
                    .ToListAsync();

                var recommended = new List<ScreeningGuideline>();
                foreach (var g in guidelines)
                {
                    if (g.MinAge.HasValue && ctx.Age.HasValue && ctx.Age < g.MinAge) continue;
                    if (g.MaxAge.HasValue && ctx.Age.HasValue && ctx.Age > g.MaxAge) continue;
                    if (!string.Equals(g.SexApplicable.ToString(), "both", StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(g.SexApplicable.ToString(), ctx.Sex, StringComparison.OrdinalIgnoreCase)) continue;
                    // Pregnancy applicability: 'any' means universally applicable; otherwise must match user's status
                    if (g.PregnancyApplicable != PregnancyApplicable.any)
                    {
                        var requiredPreg = g.PregnancyApplicable.ToString();
                        if (!string.Equals(requiredPreg, ctx.PregnancyStatus, StringComparison.OrdinalIgnoreCase))
                            continue;
                    }

                    if (g.ConditionsRequired is not null && !MatchesCriteriaGroup(ctx, g.ConditionsRequired))
                        continue;

                    // Compute effective frequency from matching rules (if any)
                    g.EffectiveFrequencyMonths = SelectEffectiveFrequency(ctx, g);

                    recommended.Add(g);
                }

                return recommended;
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
                            allGuidelines.AddRange(importedGuidelines);
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
                        existing.MinAge = imported.MinAge;
                        existing.MaxAge = imported.MaxAge;
                        existing.SexApplicable = imported.SexApplicable;
                        existing.PregnancyApplicable = imported.PregnancyApplicable;
                        existing.ConditionsRequired = imported.ConditionsRequired;
                        existing.ConditionsExcluded = imported.ConditionsExcluded;
                        existing.RiskFactors = imported.RiskFactors;
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
                        if (imported.GuidelineId == Guid.Empty)
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
                RecommendedFrequency = FormatFrequency(guideline.EffectiveFrequencyMonths ?? guideline.DefaultFrequencyMonths),
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

        // Shape the user context once for evaluation. 
        // This allows data from User and UserMedicalProfile to be placed in one object.
        private sealed class UserContext
        {
            public int? Age { get; init; }
            public string Sex { get; init; } = "both"; // "male" | "female" | "both"
            public string PregnancyStatus { get; init; } = "not_pregnant";
            public string SmokingStatus { get; init; } = "unknown";
            public string AlcoholFrequency { get; init; } = "unknown";
            public string ActivityLevel { get; init; } = "moderately_active";
        }

        private UserContext BuildUserContext(User user)
        {
            // Pull data from User and UserMedicalProfile
            return new UserContext
            {
                Age = user.Age(),
                Sex = user.Sex?.ToString() ?? "both",
                PregnancyStatus = user.MedicalProfile?.PregnancyStatus?.ToString()?.ToLower() ?? "not_pregnant",
                SmokingStatus = user.MedicalProfile?.SmokingStatus.ToString()?.ToLower() ?? "unknown",
                AlcoholFrequency = user.MedicalProfile?.AlcoholFrequency.ToString()?.ToLower() ?? "unknown",
                ActivityLevel = user.MedicalProfile?.ActivityLevel.ToString()?.ToLower() ?? "moderately_active"
            };
        }

        private static bool MatchesCriterion(UserContext ctx, Criterion c)
        {
            // Resolve the left-hand value as string or number based on factor
            string? sval = null;
            double? nval = null;

            switch (c.Factor)
            {
                case LifestyleFactorType.SmokingStatus: sval = ctx.SmokingStatus; break;
                case LifestyleFactorType.Sex: sval = ctx.Sex; break;
                case LifestyleFactorType.PregnancyStatus: sval = ctx.PregnancyStatus; break;
                case LifestyleFactorType.AlcoholFrequency: sval = ctx.AlcoholFrequency; break;
                case LifestyleFactorType.ActivityLevel: sval = ctx.ActivityLevel; break;
                case LifestyleFactorType.Age: nval = ctx.Age; break;
                default: return false;
            }

            // String-based ops
            if (sval is not null)
            {
                var vals = c.Values?.Select(v => v.ToLower()).ToHashSet() ?? new HashSet<string>();
                var left = sval.ToLower();

                return c.Operator switch
                {
                    ComparisonOperator.Equals => vals.Count == 1 && vals.Contains(left),
                    ComparisonOperator.NotEquals => vals.Count == 1 && !vals.Contains(left),
                    ComparisonOperator.In => vals.Contains(left),
                    ComparisonOperator.NotIn => !vals.Contains(left),
                    ComparisonOperator.Exists => !string.IsNullOrWhiteSpace(left),
                    ComparisonOperator.NotExists => string.IsNullOrWhiteSpace(left),
                    _ => false
                };
            }

            // Numeric-based ops
            if (nval is double d)
            {
                return c.Operator switch
                {
                    ComparisonOperator.GreaterOrEqual => d >= (c.Min ?? double.MinValue),
                    ComparisonOperator.LessOrEqual => d <= (c.Max ?? double.MaxValue),
                    ComparisonOperator.Between => d >= (c.Min ?? double.MinValue) && d <= (c.Max ?? double.MaxValue),
                    _ => false
                };
            }

            return false;
        }

        private static bool MatchesCriteriaGroup(UserContext ctx, CriteriaGroup group)
        {
            // All (AND)
            if (group.All.Any() && !group.All.All(c => MatchesCriterion(ctx, c)))
                return false;

            // Any (OR)
            if (group.Any.Any() && !group.Any.Any(c => MatchesCriterion(ctx, c)))
                return false;

            return true;
        }

        private static int? SelectEffectiveFrequency(UserContext ctx, ScreeningGuideline g)
        {
            if (g.FrequencyRules == null || g.FrequencyRules.Count == 0) return null;

            // Reuse the same criteria engine by converting a rule into a CriteriaGroup
            var matches = g.FrequencyRules
                .Where(r => MatchesCriteriaGroup(ctx, BuildCriteriaGroupFromRule(r)))
                .ToList();

            if (matches.Count == 0) return null;
            // Choose the smallest frequency (most frequent) as the effective one
            return matches
                .OrderBy(r => r.FrequencyMonths)
                .Select(r => (int?)r.FrequencyMonths)
                .FirstOrDefault();
        }

        private static CriteriaGroup BuildCriteriaGroupFromRule(FrequencyRule r)
        {
            var group = new CriteriaGroup { All = new List<Criterion>(), Any = new List<Criterion>() };

            if (r.MinAge.HasValue)
            {
                group.All.Add(new Criterion
                {
                    Factor = LifestyleFactorType.Age,
                    Operator = ComparisonOperator.GreaterOrEqual,
                    Min = r.MinAge
                });
            }

            if (r.MaxAge.HasValue)
            {
                group.All.Add(new Criterion
                {
                    Factor = LifestyleFactorType.Age,
                    Operator = ComparisonOperator.LessOrEqual,
                    Max = r.MaxAge
                });
            }

            if (r.SexApplicable.HasValue && r.SexApplicable.Value != SexApplicable.both)
            {
                group.All.Add(new Criterion
                {
                    Factor = LifestyleFactorType.Sex,
                    Operator = ComparisonOperator.Equals,
                    Values = new List<string> { r.SexApplicable.Value.ToString() }
                });
            }

            if (r.PregnancyApplicable.HasValue && r.PregnancyApplicable.Value != PregnancyApplicable.any)
            {
                group.All.Add(new Criterion
                {
                    Factor = LifestyleFactorType.PregnancyStatus,
                    Operator = ComparisonOperator.Equals,
                    Values = new List<string> { r.PregnancyApplicable.Value.ToString() }
                });
            }

            return group;
        }
    }
}