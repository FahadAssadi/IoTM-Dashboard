using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IoTM.Models
{
    public class FrequencyRule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [ForeignKey("Guideline")]
        public Guid GuidelineId { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public SexApplicable? SexApplicable { get; set; }
        public PregnancyApplicable? PregnancyApplicable { get; set; }
        public int FrequencyMonths { get; set; }
        public string? Condition { get; set; } // e.g. "smoker", "family history"
    }
}