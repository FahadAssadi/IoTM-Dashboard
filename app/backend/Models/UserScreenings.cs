using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Models
{
    public enum ScreeningStatus
    {
        pending, scheduled, completed, overdue, skipped
    }

    [Table("user_screenings")]
    // [Index(nameof(UserId), nameof(DueDate), Name = "idx_user_due_date")]
    // [Index(nameof(Status), nameof(DueDate), Name = "idx_status_due")]
    public class UserScreening
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid ScreeningId { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }
        
        [JsonIgnore]
        public virtual User User { get; set; } = null!;

        [ForeignKey("Guideline")]
        public Guid GuidelineId { get; set; }
        public virtual ScreeningGuideline Guideline { get; set; } = null!;

        public DateOnly? LastScheduledDate { get; set; }

        public ScreeningStatus Status { get; set; } = ScreeningStatus.pending;

        public DateOnly? CompletedDate { get; set; }

        [StringLength(200)]
        public string? ProviderName { get; set; }

        [StringLength(20)]
        public string? ProviderPhone { get; set; }

        public string? Results { get; set; }
        public string? Notes { get; set; }

        public DateOnly? NextDueDate { get; set; }

        public bool ReminderSent { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual ICollection<HealthAlert> HealthAlerts { get; set; } = new List<HealthAlert>();
    }
}