using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace IoTM.Models
{
    public enum ScreeningCategory
    {
        screening, vaccination, checkup
    }
    public enum SexApplicable
    {
        male, female, both
    }
    public enum ImportanceLevel
    {
        critical, high, medium, low
    }
    public enum PregnancyApplicable
    {
        not_pregnant, pregnant, postpartum, any
    }

    [Table("screening_guidelines")]
    public class ScreeningGuideline
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid GuidelineId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string ScreeningType { get; set; } = string.Empty;

        //TODO: make sure this is only required if IsRecurring is true.
        public int DefaultFrequencyMonths { get; set; }

        [Required]
        public ScreeningCategory Category { get; set; }

        /// <summary>
        /// Recommendation Criteria
        /// </summary>
        public int? MinAge { get; set; }

        /// <summary>
        /// Recommendation Criteria
        /// </summary>
        public int? MaxAge { get; set; }

        /// <summary>
        /// Recommendation Criteria
        /// </summary>
        public SexApplicable SexApplicable { get; set; } = SexApplicable.both;

        /// <summary>
        /// Recommendation Criteria
        /// </summary>
        public PregnancyApplicable PregnancyApplicable { get; set; }

        /// <summary>
        /// Recommendation Criteria
        /// </summary>
        public string? ConditionsRequired { get; set; } // e.g. "smoker", "family history"
        public string? ConditionsExcluded { get; set; }
        public string? RiskFactors { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        public ImportanceLevel ImportanceLevel { get; set; } = ImportanceLevel.medium;

        [Required]
        [StringLength(100)]
        public string SourceOrganisation { get; set; } = string.Empty;

        [StringLength(3)]
        public string? CountrySpecific { get; set; }

        [Required]
        public DateOnly LastUpdated { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Cost { get; set; }
        public string? Delivery { get; set; }
        public string? Link { get; set; }
        public bool IsRecurring { get; set; }

        // Navigation properties
        public virtual ICollection<UserScreening> UserScreenings { get; set; } = new List<UserScreening>();
        public virtual ICollection<FrequencyRule> FrequencyRules { get; set; } = new List<FrequencyRule>();
    }
}