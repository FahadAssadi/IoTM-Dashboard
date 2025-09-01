namespace IoTM.Dtos;

public class ScheduledScreeningDto
{
    public Guid ScheduledScreeningId { get; set; }
    public DateOnly ScheduledDate { get; set; }
    public bool IsActive { get; set; }
}