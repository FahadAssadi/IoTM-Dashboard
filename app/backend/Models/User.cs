using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IoTM.Models
{
    public enum Sex
    {
        male,
        female,
        other
    }

    [Table("users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public Guid UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        public DateOnly? DateOfBirth { get; set; }

        public Sex? Sex { get; set; }

        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        [StringLength(3)]
        public string? CountryCode { get; set; } = "AUS";

        [StringLength(50)]
        public string? Timezone { get; set; } = "Australia/Sydney";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties for relationships
        public virtual UserMedicalProfile? MedicalProfile { get; set; }
        public virtual ICollection<MedicalCondition> MedicalConditions { get; set; } = new List<MedicalCondition>();
        public virtual ICollection<FamilyHistory> FamilyHistories { get; set; } = new List<FamilyHistory>();
        public virtual ICollection<Medication> Medications { get; set; } = new List<Medication>();
        public virtual ICollection<Allergy> Allergies { get; set; } = new List<Allergy>();
        public virtual ICollection<ConnectedDevice> ConnectedDevices { get; set; } = new List<ConnectedDevice>();
        public virtual ICollection<HealthMetric> HealthMetrics { get; set; } = new List<HealthMetric>();
        public virtual ICollection<UserScreening> UserScreenings { get; set; } = new List<UserScreening>();
        public virtual ICollection<HealthAlert> HealthAlerts { get; set; } = new List<HealthAlert>();
    }
}