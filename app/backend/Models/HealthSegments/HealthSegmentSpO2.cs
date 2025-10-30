using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IoTM.Models.HealthSegments
{
    public class HealthSegmentSpO2
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

        public double AverageSpO2 { get; set; }

        public double StandardDeviation { get; set; }
    }
}