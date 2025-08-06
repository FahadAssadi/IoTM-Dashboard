using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

public enum MetricType
{
    heart_rate, blood_pressure_systolic, blood_pressure_diastolic,
    oxygen_saturation, steps, sleep_hours, calories_burned,
    weight, body_fat_percentage, temperature
}
public enum DataQuality
{
    high, medium, low
}

[Table("health_metrics")]
[Index(nameof(UserId), nameof(MetricType), nameof(RecordedAt), Name = "idx_user_metric_time")]
[Index(nameof(RecordedAt), Name = "idx_recorded_at")]
public class HealthMetric
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid MetricId { get; set; }

    [ForeignKey("User")]
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    [ForeignKey("Device")]
    public Guid? DeviceId { get; set; }
    public virtual ConnectedDevice? Device { get; set; }

    [Required]
    public MetricType MetricType { get; set; }

    [Required]
    [Column(TypeName = "decimal(10,4)")]
    public decimal Value { get; set; }

    [Required]
    [StringLength(20)]
    public string Unit { get; set; } = string.Empty;

    [Required]
    public DateTime RecordedAt { get; set; }

    public DataQuality DataQuality { get; set; } = DataQuality.high;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}