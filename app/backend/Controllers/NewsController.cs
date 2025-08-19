using Microsoft.AspNetCore.Mvc;
using IoTM.Models;
using IoTM.Services;

namespace IoTM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
        private readonly INewsService _newsService;
        private readonly ILogger<NewsController> _logger;

        public NewsController(INewsService newsService, ILogger<NewsController> logger)
        {
            _newsService = newsService;
            _logger = logger;
        }

        /// <summary>
        /// Get health news from multiple sources
        /// </summary>
        /// <param name="category">News category filter</param>
        /// <param name="searchTerm">Search term to filter articles</param>
        /// <param name="fromDate">Start date for news articles (YYYY-MM-DD)</param>
        /// <param name="toDate">End date for news articles (YYYY-MM-DD)</param>
        /// <param name="pageSize">Number of articles per page (default: 20, max: 100)</param>
        /// <param name="page">Page number (default: 1)</param>
        /// <param name="source">Specific source to filter by (CDC, WHO, etc.)</param>
        /// <returns>List of health news articles</returns>
        [HttpGet]
        public async Task<ActionResult<NewsResponse>> GetHealthNews(
            [FromQuery] NewsCategory? category = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int pageSize = 20,
            [FromQuery] int page = 1,
            [FromQuery] string? source = null)
        {
            try
            {
                // Validate parameters
                if (pageSize <= 0 || pageSize > 100)
                    pageSize = 20;
                
                if (page <= 0)
                    page = 1;

                var filter = new NewsFilter
                {
                    Category = category,
                    SearchTerm = searchTerm,
                    FromDate = fromDate,
                    ToDate = toDate,
                    PageSize = pageSize,
                    Page = page,
                    Source = source
                };

                var result = await _newsService.GetHealthNewsAsync(filter);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetHealthNews endpoint");
                return StatusCode(500, new NewsResponse
                {
                    Success = false,
                    Message = "Internal server error occurred while fetching news",
                    Articles = new List<NewsArticle>(),
                    TotalResults = 0,
                    Source = "Error"
                });
            }
        }

        /// <summary>
        /// Get news specifically from CDC sources
        /// </summary>
        [HttpGet("cdc")]
        public async Task<ActionResult<NewsResponse>> GetCDCNews(
            [FromQuery] string? searchTerm = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int pageSize = 20,
            [FromQuery] int page = 1)
        {
            try
            {
                var filter = new NewsFilter
                {
                    SearchTerm = searchTerm,
                    FromDate = fromDate,
                    ToDate = toDate,
                    PageSize = pageSize,
                    Page = page
                };

                var result = await _newsService.GetCDCNewsAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCDCNews endpoint");
                return StatusCode(500, new NewsResponse
                {
                    Success = false,
                    Message = "Internal server error occurred while fetching CDC news",
                    Articles = new List<NewsArticle>(),
                    TotalResults = 0,
                    Source = "CDC"
                });
            }
        }

        /// <summary>
        /// Get news specifically from WHO sources
        /// </summary>
        [HttpGet("who")]
        public async Task<ActionResult<NewsResponse>> GetWHONews(
            [FromQuery] string? searchTerm = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int pageSize = 20,
            [FromQuery] int page = 1)
        {
            try
            {
                var filter = new NewsFilter
                {
                    SearchTerm = searchTerm,
                    FromDate = fromDate,
                    ToDate = toDate,
                    PageSize = pageSize,
                    Page = page
                };

                var result = await _newsService.GetWHONewsAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetWHONews endpoint");
                return StatusCode(500, new NewsResponse
                {
                    Success = false,
                    Message = "Internal server error occurred while fetching WHO news",
                    Articles = new List<NewsArticle>(),
                    TotalResults = 0,
                    Source = "WHO"
                });
            }
        }

        /// <summary>
        /// Get available news categories
        /// </summary>
        [HttpGet("categories")]
        public ActionResult<IEnumerable<object>> GetNewsCategories()
        {
            var categories = Enum.GetValues<NewsCategory>()
                .Select(c => new
                {
                    Value = (int)c,
                    Name = c.ToString(),
                    DisplayName = GetCategoryDisplayName(c)
                })
                .ToList();

            return Ok(categories);
        }

        private string GetCategoryDisplayName(NewsCategory category)
        {
            return category switch
            {
                NewsCategory.VaccinationRecommendations => "Vaccination Recommendations",
                NewsCategory.DiseaseOutbreakAlerts => "Disease Outbreak Alerts",
                NewsCategory.ScreeningGuidelines => "Screening Guidelines",
                NewsCategory.HealthPolicyInsurance => "Health Policy & Insurance",
                NewsCategory.PublicHealthCampaigns => "Public Health Campaigns",
                NewsCategory.VaccineResearch => "Vaccine & Screening Research",
                NewsCategory.MythBustingEducation => "Myth Busting & Education",
                NewsCategory.PreparationGuides => "How-to & Preparation Guides",
                NewsCategory.General => "General Health News",
                _ => category.ToString()
            };
        }
    }
}
