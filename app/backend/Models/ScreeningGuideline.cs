using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

    [Table("screening_guidelines")]
    public class ScreeningGuideline
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid GuidelineId { get; set; }

        [Required]
        [StringLength(200)]
        public string ScreeningType { get; set; } = string.Empty;

        [Required]
        public ScreeningCategory Category { get; set; }

        public int? MinAge { get; set; }

        public int? MaxAge { get; set; }

        public SexApplicable SexApplicable { get; set; } = SexApplicable.both;

        [Required]
        public int FrequencyMonths { get; set; }

        // Represent JSON columns as a string or a more specific C# type
        public string? ConditionsRequired { get; set; }
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

        // Navigation property
        public virtual ICollection<UserScreening> UserScreenings { get; set; } = new List<UserScreening>();
    }
}