using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public enum Relationship
{
    parent, sibling, grandparent, aunt_uncle, cousin, other
}

[Table("family_history")]
public class FamilyHistory
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid HistoryId { get; set; }

    [ForeignKey("User")]
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    [Required]
    public Relationship Relationship { get; set; }

    [Required]
    [StringLength(200)]
    public string ConditionName { get; set; } = string.Empty;

    public int? AgeAtDiagnosis { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}