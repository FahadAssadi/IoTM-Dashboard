using System.ComponentModel.DataAnnotations;
using IoTM.Models;

namespace IoTM.Dtos;

public class ScreeningGuidelineDto
{
    public Guid Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string ScreeningType { get; set; } = string.Empty;

    [Required]
    public string RecommendedFrequency { get; set; } = string.Empty;

    [Required]
    public ScreeningCategory Category { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    public string? Cost { get; set; }
    public string? Delivery { get; set; }
    public string? Link { get; set; }
    public bool IsRecurring { get; set; }
}