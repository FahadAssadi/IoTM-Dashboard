using System.ComponentModel.DataAnnotations;

namespace IoTM.Models
{
    public class NewsArticle
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        [Required]
        public string Source { get; set; } = string.Empty;
        
        [Required]
        public string Author { get; set; } = string.Empty;
        
        [Required]
        public DateTime PublishedAt { get; set; }
        
        [Required]
        public string Url { get; set; } = string.Empty;
        
        public string? ImageUrl { get; set; }
        
        [Required]
        public NewsCategory Category { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum NewsCategory
    {
        VaccinationRecommendations,
        DiseaseOutbreakAlerts,
        ScreeningGuidelines,
        HealthPolicyInsurance,
        PublicHealthCampaigns,
        VaccineResearch,
        MythBustingEducation,
        PreparationGuides,
        General
    }

    public class NewsResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<NewsArticle> Articles { get; set; } = new List<NewsArticle>();
        public int TotalResults { get; set; }
        public string Source { get; set; } = string.Empty;
    }

    public class NewsFilter
    {
        public NewsCategory? Category { get; set; }
        public string? SearchTerm { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int PageSize { get; set; } = 20;
        public int Page { get; set; } = 1;
        public string? Source { get; set; }
    }
}
