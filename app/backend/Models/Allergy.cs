using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public enum AllergyType
{
    drug, food, environmental, other
}
public enum AllergySeverity
{
    mild, moderate, severe, life_threatening
}

[Table("allergies")]
public class Allergy
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid AllergyId { get; set; }

    [ForeignKey("User")]
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    [Required]
    [StringLength(200)]
    public string Allergen { get; set; } = string.Empty;

    [Required]
    public AllergyType AllergyType { get; set; }

    [StringLength(300)]
    public string? Reaction { get; set; }

    [Required]
    public AllergySeverity Severity { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}