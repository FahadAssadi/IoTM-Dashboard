using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public enum Severity
{
    mild, moderate, severe, unknown
}
public enum ConditionStatus
{
    active, inactive, resolved, unknown
}

[Table("medical_conditions")]
public class MedicalCondition
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid ConditionId { get; set; }

    [ForeignKey("User")]
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    [Required]
    [StringLength(200)]
    public string ConditionName { get; set; } = string.Empty;

    [StringLength(20)]
    public string? ConditionCode { get; set; }

    public DateOnly? DiagnosedDate { get; set; }

    public Severity Severity { get; set; } = Severity.unknown;

    public ConditionStatus Status { get; set; } = ConditionStatus.active;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}