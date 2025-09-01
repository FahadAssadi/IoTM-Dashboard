using IoTM.Models;

namespace IoTM.Dtos;

public class UserScreeningDto
{
    public Guid ScreeningId { get; set; }
    public Guid GuidelineId { get; set; }
    public ScreeningGuidelineDto Guideline { get; set; } = null!;
    public DateOnly? LastScheduledDate { get; set; }
    public ScreeningStatus Status { get; set; }
    public DateOnly? CompletedDate { get; set; }
    public DateOnly? NextDueDate { get; set; }
    public bool ReminderSent { get; set; } = false;
}