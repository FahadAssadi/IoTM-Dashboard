using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IoTM.Models.HealthSegments
{
    public class HealthSegmentSummary
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

        // BPM
        public double? AverageBpm { get; set; }
        public double? BpmStandardDeviation { get; set; }

        // SpO2
        public double? AverageSpO2 { get; set; }
        public double? SpO2StandardDeviation { get; set; }

        // Blood Pressure
        public double? AverageSystolic { get; set; }
        public double? AverageDiastolic { get; set; }
        public double? BloodPressureStandardDeviation { get; set; }

    }
}