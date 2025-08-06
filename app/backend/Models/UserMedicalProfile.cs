using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IoTM.Models
{
    public enum BloodType
    {
        A_plus, A_minus, B_plus, B_minus, AB_plus, AB_minus, O_plus, O_minus, unknown
    }
    public enum SmokingStatus
    {
        never, former, current, unknown
    }
    public enum AlcoholFrequency
    {
        never, rarely, occasionally, regularly, daily, unknown
    }
    public enum ActivityLevel
    {
        sedentary, lightly_active, moderately_active, very_active, extremely_active
    }

    [Table("user_medical_profiles")]
    public class UserMedicalProfile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid ProfileId { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        [Column(TypeName = "decimal(5,2)")]
        public decimal? HeightCm { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? WeightKg { get; set; }

        public BloodType? BloodType { get; set; } = Models.BloodType.unknown;
        public SmokingStatus SmokingStatus { get; set; } = Models.SmokingStatus.unknown;
        public AlcoholFrequency AlcoholFrequency { get; set; } = Models.AlcoholFrequency.unknown;
        public ActivityLevel ActivityLevel { get; set; } = Models.ActivityLevel.moderately_active;

        [StringLength(100)]
        public string? Occupation { get; set; }

        [StringLength(100)]
        public string? EmergencyContactName { get; set; }

        [StringLength(20)]
        public string? EmergencyContactPhone { get; set; }

        [StringLength(100)]
        public string? PrimaryDoctorName { get; set; }

        [StringLength(20)]
        public string? PrimaryDoctorPhone { get; set; }

        [StringLength(100)]
        public string? InsuranceProvider { get; set; }

        [StringLength(100)]
        public string? InsuranceNumber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}