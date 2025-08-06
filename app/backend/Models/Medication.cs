using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public enum MedicationStatus
{
    active, discontinued, completed
}

[Table("medications")]
public class Medication
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid MedicationId { get; set; }

    [ForeignKey("User")]
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    [Required]
    [StringLength(200)]
    public string MedicationName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Dosage { get; set; }

    [StringLength(100)]
    public string? Frequency { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    [StringLength(100)]
    public string? PrescribingDoctor { get; set; }

    [StringLength(200)]
    public string? Reason { get; set; }

    public MedicationStatus Status { get; set; } = MedicationStatus.active;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}