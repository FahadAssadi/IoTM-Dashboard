using IoTM.Models;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Xml;
using System.ServiceModel.Syndication;

namespace IoTM.Services
{
    public interface INewsService
    {
        Task<NewsResponse> GetHealthNewsAsync(NewsFilter filter);
        Task<NewsResponse> GetCDCNewsAsync(NewsFilter filter);
        Task<NewsResponse> GetWHONewsAsync(NewsFilter filter);
        Task<NewsResponse> GetGeneralHealthNewsAsync(NewsFilter filter);
    }

    public class NewsService : INewsService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<NewsService> _logger;
        private readonly IConfiguration _configuration;

        public NewsService(HttpClient httpClient, ILogger<NewsService> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<NewsResponse> GetHealthNewsAsync(NewsFilter filter)
        {
            var allNews = new List<NewsArticle>();

            try
            {
                // Fetch from multiple sources in parallel
                var tasks = new List<Task<NewsResponse>>
                {
                    GetCDCNewsAsync(new NewsFilter { Category = filter.Category, SearchTerm = filter.SearchTerm, FromDate = filter.FromDate, ToDate = filter.ToDate, PageSize = 100, Page = 1 }),
                    GetWHONewsAsync(new NewsFilter { Category = filter.Category, SearchTerm = filter.SearchTerm, FromDate = filter.FromDate, ToDate = filter.ToDate, PageSize = 100, Page = 1 }),
                    GetGeneralHealthNewsAsync(new NewsFilter { Category = filter.Category, SearchTerm = filter.SearchTerm, FromDate = filter.FromDate, ToDate = filter.ToDate, PageSize = 100, Page = 1 })
                };

                var results = await Task.WhenAll(tasks);
                
                foreach (var result in results)
                {
                    if (result.Success)
                    {
                        allNews.AddRange(result.Articles);
                    }
                }

                // Apply category filter if specified
                if (filter.Category.HasValue)
                {
                    allNews = allNews.Where(a => a.Category == filter.Category.Value).ToList();
                }

                // Apply search term filter if specified
                if (!string.IsNullOrEmpty(filter.SearchTerm))
                {
                    var searchTerm = filter.SearchTerm.ToLowerInvariant();
                    allNews = allNews.Where(a => 
                        (a.Title?.ToLowerInvariant().Contains(searchTerm) == true) ||
                        (a.Description?.ToLowerInvariant().Contains(searchTerm) == true) ||
                        (a.Content?.ToLowerInvariant().Contains(searchTerm) == true)
                    ).ToList();
                }

                // Apply date filters
                if (filter.FromDate.HasValue)
                {
                    allNews = allNews.Where(a => a.PublishedAt >= filter.FromDate.Value).ToList();
                }

                if (filter.ToDate.HasValue)
                {
                    allNews = allNews.Where(a => a.PublishedAt <= filter.ToDate.Value).ToList();
                }

                // Sort by published date (newest first)
                var sortedNews = allNews.OrderByDescending(a => a.PublishedAt).ToList();

                // Calculate total results before pagination
                var totalResults = sortedNews.Count;

                // Apply pagination
                var paginatedNews = sortedNews
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToList();

                return new NewsResponse
                {
                    Success = true,
                    Message = "Health news fetched successfully",
                    Articles = paginatedNews,
                    TotalResults = totalResults,
                    Source = "Multiple Sources"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching health news");
                return new NewsResponse
                {
                    Success = false,
                    Message = $"Error fetching health news: {ex.Message}",
                    Articles = new List<NewsArticle>(),
                    TotalResults = 0,
                    Source = "Error"
                };
            }
        }

        public async Task<NewsResponse> GetCDCNewsAsync(NewsFilter filter)
        {
            try
            {
                var articles = new List<NewsArticle>();

                // Mock CDC news data for demonstration (since CDC RSS feeds may be restricted)
                var cdcNews = GetMockCDCNews(filter);
                articles.AddRange(cdcNews);

                // Try to fetch from actual CDC sources if available
                var cdcFeeds = new[]
                {
                    "https://tools.cdc.gov/api/v2/resources/media/316422.rss"
                };

                foreach (var feedUrl in cdcFeeds)
                {
                    try
                    {
                        var feedArticles = await ParseRssFeedAsync(feedUrl, "CDC", filter);
                        articles.AddRange(feedArticles);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to fetch CDC feed: {FeedUrl}", feedUrl);
                    }
                }

                // Apply pagination for individual endpoint calls only
                var totalResults = articles.Count;
                var paginatedArticles = articles
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToList();

                return new NewsResponse
                {
                    Success = true,
                    Message = "CDC news fetched successfully",
                    Articles = filter.Page == 1 && filter.PageSize >= 100 ? articles : paginatedArticles,
                    TotalResults = totalResults,
                    Source = "CDC"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching CDC news");
                return new NewsResponse
                {
                    Success = false,
                    Message = $"Error fetching CDC news: {ex.Message}",
                    Articles = new List<NewsArticle>(),
                    TotalResults = 0,
                    Source = "CDC"
                };
            }
        }

        public async Task<NewsResponse> GetWHONewsAsync(NewsFilter filter)
        {
            try
            {
                var articles = new List<NewsArticle>();

                // Add mock WHO news data
                var whoNews = GetMockWHONews(filter);
                articles.AddRange(whoNews);

                // Try to fetch from actual WHO RSS feed
                try
                {
                    var whoFeedUrl = "https://www.who.int/rss-feeds/news-english.xml";
                    var feedArticles = await ParseRssFeedAsync(whoFeedUrl, "WHO", filter);
                    articles.AddRange(feedArticles);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch WHO RSS feed, using mock data only");
                }

                // Apply pagination for individual endpoint calls only
                var totalResults = articles.Count;
                var paginatedArticles = articles
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToList();

                return new NewsResponse
                {
                    Success = true,
                    Message = "WHO news fetched successfully",
                    Articles = filter.Page == 1 && filter.PageSize >= 100 ? articles : paginatedArticles,
                    TotalResults = totalResults,
                    Source = "WHO"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching WHO news");
                return new NewsResponse
                {
                    Success = false,
                    Message = $"Error fetching WHO news: {ex.Message}",
                    Articles = new List<NewsArticle>(),
                    TotalResults = 0,
                    Source = "WHO"
                };
            }
        }

        public async Task<NewsResponse> GetGeneralHealthNewsAsync(NewsFilter filter)
        {
            try
            {
                var articles = new List<NewsArticle>();

                // Add mock general health news
                var generalNews = GetMockGeneralHealthNews(filter);
                articles.AddRange(generalNews);

                // Use NewsAPI for general health news (requires API key)
                var newsApiKey = _configuration["NewsAPI:ApiKey"];
                if (!string.IsNullOrEmpty(newsApiKey))
                {
                    try
                    {
                        var newsApiArticles = await FetchFromNewsAPIAsync(newsApiKey, filter);
                        articles.AddRange(newsApiArticles);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to fetch from NewsAPI, using mock data only");
                    }
                }

                // Try to fetch from public health RSS feeds
                var healthFeeds = new[]
                {
                    "https://www.sciencedaily.com/rss/health_medicine.xml"
                };

                foreach (var feedUrl in healthFeeds)
                {
                    try
                    {
                        var feedArticles = await ParseRssFeedAsync(feedUrl, ExtractSourceFromUrl(feedUrl), filter);
                        articles.AddRange(feedArticles);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to fetch health feed: {FeedUrl}", feedUrl);
                    }
                }

                // Apply pagination for individual endpoint calls only
                var totalResults = articles.Count;
                var paginatedArticles = articles
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToList();

                return new NewsResponse
                {
                    Success = true,
                    Message = "General health news fetched successfully",
                    Articles = filter.Page == 1 && filter.PageSize >= 100 ? articles : paginatedArticles,
                    TotalResults = totalResults,
                    Source = "Multiple Health Sources"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching general health news");
                return new NewsResponse
                {
                    Success = false,
                    Message = $"Error fetching general health news: {ex.Message}",
                    Articles = new List<NewsArticle>(),
                    TotalResults = 0,
                    Source = "General Health Sources"
                };
            }
        }

        private async Task<List<NewsArticle>> ParseRssFeedAsync(string feedUrl, string source, NewsFilter filter)
        {
            var articles = new List<NewsArticle>();

            try
            {
                var response = await _httpClient.GetStreamAsync(feedUrl);
                
                using var xmlReader = XmlReader.Create(response);
                var feed = SyndicationFeed.Load(xmlReader);

                foreach (var item in feed.Items)
                {
                    var title = item.Title?.Text ?? "";
                    var summary = item.Summary?.Text ?? "";
                    var content = item.Content != null ? 
                        ((TextSyndicationContent)item.Content).Text : summary;
                    var link = item.Links.FirstOrDefault()?.Uri?.ToString() ?? "";
                    var author = item.Authors.FirstOrDefault()?.Name ?? source;
                    var pubDate = item.PublishDate.DateTime;

                    if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(link))
                        continue;

                    // Filter by date if specified
                    if (filter.FromDate.HasValue && pubDate < filter.FromDate.Value)
                        continue;
                    if (filter.ToDate.HasValue && pubDate > filter.ToDate.Value)
                        continue;

                    // Filter by search term
                    if (!string.IsNullOrEmpty(filter.SearchTerm))
                    {
                        var searchTerm = filter.SearchTerm.ToLowerInvariant();
                        if (!title.ToLowerInvariant().Contains(searchTerm) && 
                            !summary.ToLowerInvariant().Contains(searchTerm))
                            continue;
                    }

                    var article = new NewsArticle
                    {
                        Title = CleanHtmlContent(title),
                        Description = CleanHtmlContent(summary),
                        Content = CleanHtmlContent(content),
                        Source = source,
                        Author = CleanHtmlContent(author),
                        PublishedAt = pubDate,
                        Url = link,
                        Category = CategorizeArticle(title, summary),
                        CreatedAt = DateTime.UtcNow
                    };

                    articles.Add(article);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing RSS feed: {FeedUrl}", feedUrl);
            }

            return articles;
        }

        private async Task<List<NewsArticle>> FetchFromNewsAPIAsync(string apiKey, NewsFilter filter)
        {
            var articles = new List<NewsArticle>();

            try
            {
                var healthKeywords = new[]
                {
                    "vaccination", "vaccine", "screening", "health guidelines", 
                    "disease outbreak", "health policy", "public health", 
                    "medical research", "health campaign"
                };

                var keyword = filter.SearchTerm ?? string.Join(" OR ", healthKeywords);
                var fromDate = filter.FromDate?.ToString("yyyy-MM-dd") ?? DateTime.UtcNow.AddDays(-7).ToString("yyyy-MM-dd");
                
                var url = $"https://newsapi.org/v2/everything?q={Uri.EscapeDataString(keyword)}&from={fromDate}&sortBy=publishedAt&language=en&apiKey={apiKey}";

                var response = await _httpClient.GetStringAsync(url);
                var newsApiResponse = JsonSerializer.Deserialize<NewsApiResponse>(response);

                if (newsApiResponse?.Articles != null)
                {
                    foreach (var apiArticle in newsApiResponse.Articles)
                    {
                        if (string.IsNullOrEmpty(apiArticle.Title) || string.IsNullOrEmpty(apiArticle.Url))
                            continue;

                        var article = new NewsArticle
                        {
                            Title = apiArticle.Title,
                            Description = apiArticle.Description ?? "",
                            Content = apiArticle.Content ?? apiArticle.Description ?? "",
                            Source = apiArticle.Source?.Name ?? "NewsAPI",
                            Author = apiArticle.Author ?? "Unknown",
                            PublishedAt = apiArticle.PublishedAt,
                            Url = apiArticle.Url,
                            ImageUrl = apiArticle.UrlToImage,
                            Category = CategorizeArticle(apiArticle.Title, apiArticle.Description),
                            CreatedAt = DateTime.UtcNow
                        };

                        articles.Add(article);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching from NewsAPI");
            }

            return articles;
        }

        private NewsCategory CategorizeArticle(string title, string? description)
        {
            var content = $"{title} {description}".ToLowerInvariant();

            if (content.Contains("vaccin") || content.Contains("immuniz"))
                return NewsCategory.VaccinationRecommendations;
            
            if (content.Contains("outbreak") || content.Contains("epidemic") || content.Contains("pandemic"))
                return NewsCategory.DiseaseOutbreakAlerts;
            
            if (content.Contains("screening") || content.Contains("mammogram") || content.Contains("colonoscopy"))
                return NewsCategory.ScreeningGuidelines;
            
            if (content.Contains("health policy") || content.Contains("insurance") || content.Contains("healthcare policy"))
                return NewsCategory.HealthPolicyInsurance;
            
            if (content.Contains("health campaign") || content.Contains("public health") || content.Contains("free clinic"))
                return NewsCategory.PublicHealthCampaigns;
            
            if (content.Contains("research") || content.Contains("clinical trial") || content.Contains("study"))
                return NewsCategory.VaccineResearch;
            
            if (content.Contains("myth") || content.Contains("misinformation") || content.Contains("fact check"))
                return NewsCategory.MythBustingEducation;
            
            if (content.Contains("how to") || content.Contains("preparation") || content.Contains("guide"))
                return NewsCategory.PreparationGuides;

            return NewsCategory.General;
        }

        private string CleanHtmlContent(string content)
        {
            if (string.IsNullOrEmpty(content))
                return string.Empty;

            // Remove HTML tags
            var cleanContent = System.Text.RegularExpressions.Regex.Replace(content, "<.*?>", string.Empty);
            
            // Decode HTML entities
            cleanContent = System.Net.WebUtility.HtmlDecode(cleanContent);
            
            return cleanContent.Trim();
        }

        private string ExtractSourceFromUrl(string url)
        {
            try
            {
                var uri = new Uri(url);
                var domain = uri.Host.Replace("www.", "");
                return domain.Split('.')[0].ToUpperInvariant();
            }
            catch
            {
                return "Unknown";
            }
        }

        private List<NewsArticle> GetMockCDCNews(NewsFilter filter)
        {
            var mockNews = new List<NewsArticle>
            {
                new NewsArticle
                {
                    Id = 1,
                    Title = "CDC Updates COVID-19 Vaccination Recommendations for 2025",
                    Description = "The Centers for Disease Control and Prevention has updated its COVID-19 vaccination recommendations to include new guidelines for booster shots and updated vaccines for emerging variants.",
                    Content = "The CDC announced today that all adults should receive updated COVID-19 vaccines that target the latest circulating variants. The new recommendations include specific guidance for immunocompromised individuals and those over 65 years of age.",
                    Source = "CDC",
                    Author = "CDC Press Office",
                    PublishedAt = DateTime.UtcNow.AddDays(-2),
                    Url = "https://www.cdc.gov/media/releases/2025/p0811-covid-vaccination.html",
                    Category = NewsCategory.VaccinationRecommendations,
                    CreatedAt = DateTime.UtcNow
                },
                new NewsArticle
                {
                    Id = 2,
                    Title = "Measles Outbreak Alert: 15 Cases Reported in Three States",
                    Description = "Health officials are investigating a measles outbreak affecting unvaccinated individuals across three states, prompting renewed vaccination campaigns.",
                    Content = "The CDC is working with state health departments to contain a measles outbreak that has affected 15 individuals across New York, California, and Texas. All cases have been linked to unvaccinated individuals who traveled internationally.",
                    Source = "CDC",
                    Author = "CDC Epidemiology Team",
                    PublishedAt = DateTime.UtcNow.AddDays(-1),
                    Url = "https://www.cdc.gov/measles/cases-outbreaks.html",
                    Category = NewsCategory.DiseaseOutbreakAlerts,
                    CreatedAt = DateTime.UtcNow
                },
                new NewsArticle
                {
                    Id = 3,
                    Title = "New Colorectal Cancer Screening Guidelines Lower Starting Age to 45",
                    Description = "Updated screening guidelines now recommend that adults begin colorectal cancer screening at age 45, down from the previous recommendation of 50.",
                    Content = "The U.S. Preventive Services Task Force has updated its colorectal cancer screening recommendations, lowering the starting age from 50 to 45 for average-risk adults. This change reflects rising rates of colorectal cancer in younger adults.",
                    Source = "CDC",
                    Author = "USPSTF Guidelines Committee",
                    PublishedAt = DateTime.UtcNow.AddDays(-3),
                    Url = "https://www.cdc.gov/cancer/colorectal/basic_info/screening/guidelines.html",
                    Category = NewsCategory.ScreeningGuidelines,
                    CreatedAt = DateTime.UtcNow
                }
            };

            // Apply filters
            if (filter.Category.HasValue)
            {
                mockNews = mockNews.Where(n => n.Category == filter.Category.Value).ToList();
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLowerInvariant();
                mockNews = mockNews.Where(n => 
                    (n.Title?.ToLowerInvariant().Contains(searchTerm) == true) || 
                    (n.Description?.ToLowerInvariant().Contains(searchTerm) == true)).ToList();
            }

            return mockNews;
        }

        private List<NewsArticle> GetMockWHONews(NewsFilter filter)
        {
            var mockNews = new List<NewsArticle>
            {
                new NewsArticle
                {
                    Id = 4,
                    Title = "WHO Launches Global Mpox Vaccination Initiative",
                    Description = "The World Health Organization announces a comprehensive global strategy to combat mpox through targeted vaccination campaigns in affected regions.",
                    Content = "The WHO has launched a global mpox vaccination initiative targeting high-risk populations and areas with ongoing transmission. The program aims to distribute 2 million doses of mpox vaccine to priority countries by the end of 2025.",
                    Source = "WHO",
                    Author = "WHO Communications",
                    PublishedAt = DateTime.UtcNow.AddDays(-1),
                    Url = "https://www.who.int/news/item/mpox-vaccination-initiative",
                    Category = NewsCategory.PublicHealthCampaigns,
                    CreatedAt = DateTime.UtcNow
                },
                new NewsArticle
                {
                    Id = 5,
                    Title = "WHO Debunks Common Vaccine Myths in New Educational Campaign",
                    Description = "A comprehensive fact-checking initiative addresses widespread misinformation about vaccine safety and effectiveness.",
                    Content = "The World Health Organization has launched a new educational campaign to address common vaccine myths and misinformation. The initiative includes evidence-based responses to frequently asked questions about vaccine safety, effectiveness, and side effects.",
                    Source = "WHO",
                    Author = "WHO Health Education Team",
                    PublishedAt = DateTime.UtcNow.AddDays(-4),
                    Url = "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
                    Category = NewsCategory.MythBustingEducation,
                    CreatedAt = DateTime.UtcNow
                }
            };

            // Apply filters
            if (filter.Category.HasValue)
            {
                mockNews = mockNews.Where(n => n.Category == filter.Category.Value).ToList();
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLowerInvariant();
                mockNews = mockNews.Where(n => 
                    (n.Title?.ToLowerInvariant().Contains(searchTerm) == true) || 
                    (n.Description?.ToLowerInvariant().Contains(searchTerm) == true)).ToList();
            }

            return mockNews;
        }

        private List<NewsArticle> GetMockGeneralHealthNews(NewsFilter filter)
        {
            var mockNews = new List<NewsArticle>
            {
                new NewsArticle
                {
                    Id = 6,
                    Title = "How to Prepare for Your First Mammogram: A Complete Guide",
                    Description = "A comprehensive guide to help women prepare for their first mammogram appointment, including what to expect and how to reduce anxiety.",
                    Content = "Getting your first mammogram can feel intimidating, but proper preparation can make the experience much smoother. Here's everything you need to know about scheduling, what to wear, and what to expect during the procedure.",
                    Source = "HealthLine",
                    Author = "Dr. Sarah Johnson",
                    PublishedAt = DateTime.UtcNow.AddDays(-2),
                    Url = "https://www.healthline.com/health/mammogram-preparation-guide",
                    Category = NewsCategory.PreparationGuides,
                    CreatedAt = DateTime.UtcNow
                },
                new NewsArticle
                {
                    Id = 7,
                    Title = "New Research Shows HPV Vaccine Reduces Cancer Risk by 87%",
                    Description = "A 10-year study demonstrates the significant impact of HPV vaccination on reducing cervical cancer rates among young women.",
                    Content = "A landmark study following 1.4 million women over 10 years shows that HPV vaccination reduces the risk of cervical cancer by 87% when administered before age 17. The research supports expanding vaccination programs globally.",
                    Source = "Medical Research Today",
                    Author = "Dr. Michael Chen",
                    PublishedAt = DateTime.UtcNow.AddDays(-5),
                    Url = "https://www.medicalresearchtoday.com/hpv-vaccine-study-2025",
                    Category = NewsCategory.VaccineResearch,
                    CreatedAt = DateTime.UtcNow
                },
                new NewsArticle
                {
                    Id = 8,
                    Title = "Insurance Coverage Expanded for Preventive Health Screenings",
                    Description = "New health policy changes require insurance companies to cover additional preventive screenings at no cost to patients.",
                    Content = "Starting January 2025, insurance providers must cover additional preventive health screenings including lung cancer screening for high-risk individuals and expanded mental health screenings, with no copayment required.",
                    Source = "Health Policy News",
                    Author = "Policy Analysis Team",
                    PublishedAt = DateTime.UtcNow.AddDays(-3),
                    Url = "https://www.healthpolicynews.com/insurance-coverage-expansion-2025",
                    Category = NewsCategory.HealthPolicyInsurance,
                    CreatedAt = DateTime.UtcNow
                },
                new NewsArticle
                {
                    Id = 9,
                    Title = "Free Flu Shot Clinics Available at Community Centers Nationwide",
                    Description = "Public health campaign provides free influenza vaccinations at over 2,000 community centers across the country.",
                    Content = "The Department of Health and Human Services has partnered with local community centers to provide free flu shots to underserved populations. No insurance or identification required at participating locations.",
                    Source = "Public Health News",
                    Author = "Community Health Team",
                    PublishedAt = DateTime.UtcNow.AddDays(-1),
                    Url = "https://www.publichealthnews.com/free-flu-shots-2025",
                    Category = NewsCategory.PublicHealthCampaigns,
                    CreatedAt = DateTime.UtcNow
                }
            };

            // Apply filters
            if (filter.Category.HasValue)
            {
                mockNews = mockNews.Where(n => n.Category == filter.Category.Value).ToList();
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLowerInvariant();
                mockNews = mockNews.Where(n => 
                    (n.Title?.ToLowerInvariant().Contains(searchTerm) == true) || 
                    (n.Description?.ToLowerInvariant().Contains(searchTerm) == true)).ToList();
            }

            return mockNews;
        }
    }

    // NewsAPI response models
    public class NewsApiResponse
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("totalResults")]
        public int TotalResults { get; set; }

        [JsonPropertyName("articles")]
        public List<NewsApiArticle> Articles { get; set; } = new List<NewsApiArticle>();
    }

    public class NewsApiArticle
    {
        [JsonPropertyName("source")]
        public NewsApiSource? Source { get; set; }

        [JsonPropertyName("author")]
        public string? Author { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; } = string.Empty;

        [JsonPropertyName("urlToImage")]
        public string? UrlToImage { get; set; }

        [JsonPropertyName("publishedAt")]
        public DateTime PublishedAt { get; set; }

        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }

    public class NewsApiSource
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }
}
