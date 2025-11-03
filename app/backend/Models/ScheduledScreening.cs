using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IoTM.Models
{
    public class ScheduledScreening
    {
        [Key]
        public Guid ScheduledScreeningId { get; set; }

        [ForeignKey("UserScreening")]
        public Guid ScreeningId { get; set; }
        public virtual UserScreening UserScreening { get; set; } = null!; // TODO: link to UserScreening via key instead
        public DateOnly ScheduledDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}