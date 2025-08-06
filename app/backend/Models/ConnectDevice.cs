using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public enum DeviceType
{
    apple_watch, fitbit, google_fit, samsung_health, garmin, other
}

[Table("connected_devices")]
public class ConnectedDevice
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid DeviceId { get; set; }

    [ForeignKey("User")]
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    [Required]
    public DeviceType DeviceType { get; set; }

    [StringLength(100)]
    public string? DeviceName { get; set; }

    [StringLength(200)]
    public string? DeviceIdentifier { get; set; }

    public string? ApiTokenEncrypted { get; set; }

    public DateTime? LastSync { get; set; }

    public int SyncFrequencyMinutes { get; set; } = 60;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual ICollection<HealthMetric> HealthMetrics { get; set; } = new List<HealthMetric>();
}