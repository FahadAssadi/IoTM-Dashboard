using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Models
{
    public enum AlertType
    {
        metric_anomaly, missed_screening, device_sync_issue, general_health
    }
    public enum AlertSeverity
    {
        low, medium, high, critical
    }

    [Table("health_alerts")]
    [Index(nameof(UserId), nameof(IsRead), Name = "idx_user_unread")]
    [Index(nameof(Severity), nameof(CreatedAt), Name = "idx_severity_created")]
    public class HealthAlert
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid AlertId { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        [Required]
        public AlertType AlertType { get; set; }

        [Required]
        public AlertSeverity Severity { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        [ForeignKey("HealthMetric")]
        public Guid? TriggeredByMetricId { get; set; }
        public virtual HealthMetric? HealthMetric { get; set; }

        [ForeignKey("UserScreening")]
        public Guid? TriggeredByScreeningId { get; set; }
        public virtual UserScreening? UserScreening { get; set; }

        public bool IsRead { get; set; } = false;
        public bool IsDismissed { get; set; } = false;
        public bool ActionTaken { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}