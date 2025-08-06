using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid UserId { get; set; }

    [Required]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public DateOnly DateOfBirth { get; set; }

    [Required]
    public Sex Sex { get; set; }

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [StringLength(3)]
    public string CountryCode { get; set; } = "AUS";

    [StringLength(50)]
    public string Timezone { get; set; } = "Australia/Sydney";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;
    public bool EmailVerified { get; set; } = false;
    public bool PrivacyConsent { get; set; } = false;
    public bool DataSharingConsent { get; set; } = false;

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
    public virtual UserNewsPreference? NewsPreferences { get; set; }
    public virtual ICollection<UserNewsInteraction> NewsInteractions { get; set; } = new List<UserNewsInteraction>();
    public virtual NotificationPreference? NotificationPreferences { get; set; }
    public virtual ICollection<NotificationLog> NotificationLogs { get; set; } = new List<NotificationLog>();
    public virtual ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();
}