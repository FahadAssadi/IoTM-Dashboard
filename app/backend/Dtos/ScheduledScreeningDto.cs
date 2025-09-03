namespace IoTM.Dtos;

public class ScheduledScreeningDto
{
    public Guid ScheduledScreeningId { get; set; }
    public DateOnly ScheduledDate { get; set; }
    public bool IsActive { get; set; }
    public Guid ScreeningId { get; set; }
    public Guid GuidelineId { get; set; }
    public string GuidelineName { get; set; } = "";
    public string? ScreeningType { get; set; }
    public int? DefaultFrequencyMonths { get; set; } // TODO: set this to frequency (consider rules)
}