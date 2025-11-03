using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IoTM.Models.HealthSegments
{
    public class HealthSegmentBloodPressure
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }

        public virtual User User { get; set; } = null!;

        [Required]
        public DateTime Start { get; set; }

        [Required]
        public DateTime End { get; set; }

        [Required]
        public int Points { get; set; }

        [NotMapped]
        public double DurationHours => (End - Start).TotalHours;
        public string? Category { get; set; }
        public double AverageSystolic { get; set; }
        public double AverageDiastolic { get; set; }
        public double SystolicStandardDeviation { get; set; }
        public double DiastolicStandardDeviation { get; set; }

    }
}
