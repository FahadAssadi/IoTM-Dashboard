"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Loader2, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Copy } from "lucide-react"

// Types based on your backend API
interface NewsArticle {
  id: number
  title: string
  description: string
  content: string
  source: string
  author: string
  publishedAt: string
  url: string
  imageUrl?: string
  category: string
  createdAt: string
}

interface NewsResponse {
  success: boolean
  message: string
  articles: NewsArticle[]
  totalResults: number
  source: string
}

interface NewsCategory {
  value: number
  name: string
  displayName: string
  apiName: string[]
}

const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const NEWS_API_URL = `https://newsapi.org/v2/everything?apiKey=${API_KEY}`;
const ARTICLES_PER_PAGE = 10

// You can optionally pass an "summary" prop to show an AI-generated summary.
// Alternatively, append ?summary=... to the URL. The section appears above the articles list.
export function HealthNewsPage({ summary }: { summary?: string } = {}) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [copied, setCopied] = useState(false)
  const [categories, setCategories] = useState<NewsCategory[]>(
    [
      { value: 1, name: "All", displayName: "All", apiName: ["health"] },
      { value: 2, name: "Vaccination", displayName: "Vaccination", apiName: ["vaccination"] },
      { value: 3, name: "DiseaseOutbreakAlerts", displayName: "Disease Outbreak Alerts", apiName: ["disease", "outbreak"] },
      { value: 4, name: "ScreeningGuidelines", displayName: "Screening Guidelines" , apiName: ["screening", "guidelines"]},
      { value: 7, name: "Research", displayName: "Vaccine & Screening Research", apiName: ["health", "research"] },
      { value: 8, name: "MythBustingEducation", displayName: "Myth Busting & Education", apiName: ["myth", "education"] },
      { value: 9, name: "UrgentOrEmergency", displayName: "Urgent or Emergency", apiName: ["forest fire", "emergency", "urgent"] },
    ]
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [paginationLoading, setPaginationLoading] = useState(false)

  // Fetch news articles from API
  useEffect(() => {
  const fetchNews = async () => {
    if (currentPage === 1) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    setError(null);

    try {
      // Build the query
      const selectedCategoryObj = categories.find(
        (category) => category.displayName === selectedCategory
      );
      const query = selectedCategoryObj?.apiName.join("+") || "health";

      const url = `${NEWS_API_URL}&q=${query}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch news");

      const data = await response.json();

      if (data.articles) {
        const formatted = data.articles.map((article: any, index: number) => ({
          id: index,
          title: article.title,
          description: article.description,
          content: article.content,
          source: article.source.name,
          author: article.author,
          publishedAt: article.publishedAt,
          url: article.url,
          imageUrl: article.urlToImage,
          category: "General",
          createdAt: new Date().toISOString(),
        }));

        setArticles(formatted);
        setTotalResults(data.totalResults);
        setTotalPages(Math.ceil(data.totalResults / ARTICLES_PER_PAGE));

        // Trigger AI summary fetch separately (non-blocking)
        fetchSummary(data.articles);
      } else {
        throw new Error("No articles found");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  const fetchSummary = async (articles: any[]) => {
    try {
      setSummaryLoading(true);

      const topArticles = articles.slice(0, 5);
      const prompt = `
        You are a concise news summarization assistant.

        Summarize the following ${topArticles.length} news articles into a short, engaging paragraph (under 150 words).
        Focus on the main theme, key events, and overall tone of the news.

        Articles:
        ${topArticles
          .map(
            (a: any, i: number) =>
              `${i + 1}. "${a.title}" — ${a.description || a.content || ""}`
          )
          .join("\n")}

        Return only the summary paragraph — do not list the articles individually.
      `;

      const res = await fetch(`/api/gemini?prompt=${encodeURIComponent(prompt)}`);
      const summary = await res.text();
      setAiSummary(summary);
    } catch (err) {
      console.error("Error fetching AI summary:", err);
      setAiSummary("Failed to generate AI summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  fetchNews();
}, [currentPage, selectedCategory, categories]);


  // Reset to page 1 when category changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [selectedCategory])

  // Pagination helper functions
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
      setExpandedArticle(null) // Collapse any expanded articles when changing pages
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pageNumbers.push(
        <Button
          key={1}
          variant={1 === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(1)}
          className="w-10 h-10"
        >
          1
        </Button>
      )
      if (startPage > 2) {
        pageNumbers.push(
          <span key="ellipsis-start" className="px-2 text-gray-500">
            ...
          </span>
        )
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="w-10 h-10"
        >
          {i}
        </Button>
      )
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="ellipsis-end" className="px-2 text-gray-500">
            ...
          </span>
        )
      }
      pageNumbers.push(
        <Button
          key={totalPages}
          variant={totalPages === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="w-10 h-10"
        >
          {totalPages}
        </Button>
      )
    }

    return pageNumbers
  }

  const toggleArticle = (id: number) => {
    setExpandedArticle(expandedArticle === id ? null : id)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const getCategoryDisplayName = (categoryName: string) => {
    // Convert backend category names to display names
    switch (categoryName) {
      case 'VaccinationRecommendations': return 'Vaccination Recommendations'
      case 'DiseaseOutbreakAlerts': return 'Disease Outbreak Alerts'
      case 'ScreeningGuidelines': return 'Screening Guidelines'
      case 'HealthPolicyInsurance': return 'Health Policy & Insurance'
      case 'PublicHealthCampaigns': return 'Public Health Campaigns'
      case 'VaccineResearch': return 'Vaccine & Screening Research'
      case 'MythBustingEducation': return 'Myth Busting & Education'
      case 'PreparationGuides': return 'How-to & Preparation Guides'
      case 'General': return 'General Health News'
      default: return categoryName
    }
  }

  // All category options including "All" - ensure unique values
  const allCategories = [...Array.from(new Set(categories.map(cat => cat.displayName)))]

  return (
        <div className="flex flex-col p-6 bg-gray-50">

          {/* Main content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Personalized Health Brief</h2>
                <p className="text-gray-600">
                  Explore curated news on emerging diseases, medical research, and new screening guidelines relevant to
                  you
                </p>
              </div>

              {/* Category tabs */}
              <div className="mb-6 overflow-x-auto">
                <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="mb-4">
                    {allCategories.map((category, index) => (
                      <TabsTrigger key={`${category}-${index}`} value={category}>
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* AI Summary section - appears before articles */}
              <div className="mb-6">
                <Card className="border-teal-200 bg-teal-50/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-teal-600 text-white hover:bg-teal-700">
                        AI Summary
                      </Badge>
                      <Sparkles className="h-4 w-4 text-teal-700" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-teal-900">
                      Today’s Health Briefing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {summaryLoading ? (
                      <div className="flex items-center gap-2 text-teal-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating AI summary...</span>
                      </div>
                    ) : aiSummary && aiSummary.length > 0 ? (
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <p className="text-teal-900/90 whitespace-pre-line md:max-w-[85%]">
                          {aiSummary}
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          className="self-start bg-white text-teal-700 hover:bg-teal-100"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(aiSummary);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1500);
                            } catch {}
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-teal-900/80">No AI summary yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  <span className="ml-2 text-gray-600">Loading health news...</span>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="flex items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <span className="ml-2 text-red-600">Error: {error}</span>
                  <Button 
                    variant="outline" 
                    className="ml-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* News articles */}
              {!loading && !error && (
                <div className="relative">
                  {/* Pagination loading overlay */}
                  {paginationLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                        <span className="text-gray-600">Loading page {currentPage}...</span>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-6 md:grid-cols-2">
                    {articles.length === 0 ? (
                      <div className="col-span-2 text-center py-12">
                        <p className="text-gray-600">No news articles found for the selected category.</p>
                      </div>
                    ) : (
                      articles.map((article, index) => (
                        <Card key={`${article.id}-${index}-${article.title.slice(0, 20)}`} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <Badge variant="outline" className="bg-teal-50 text-teal-700 hover:bg-teal-100">
                                {getCategoryDisplayName(article.category)}
                              </Badge>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(article.publishedAt)}
                              </div>
                            </div>
                            <CardTitle className="text-lg font-semibold mt-2">{article.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-gray-600 text-sm">
                              {expandedArticle === article.id
                                ? article.description || "No description available."
                                : article.description
                                ? `${article.description.substring(0, 120)}...`
                                : "No description available."}
                            </p>
                            {expandedArticle === article.id && article.content && article.content !== article.description && (
                              <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                {article.content}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-between pt-0">
                            <div className="flex gap-2">
                              <Button
                                variant="link"
                                className="p-0 h-auto text-teal-600 hover:text-teal-800"
                                onClick={() => toggleArticle(article.id)}
                              >
                                {expandedArticle === article.id ? "Show Less" : "Read More"}
                              </Button>
                              {article.url && (
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                                  onClick={() => window.open(article.url, '_blank')}
                                >
                                  View Source
                                </Button>
                              )}
                            </div>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                              {article.source}
                            </Badge>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && !error && totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center space-y-4">
                  {/* Page info */}
                  <div className="text-sm text-gray-600">
                    Showing {Math.min((currentPage - 1) * ARTICLES_PER_PAGE + 1, totalResults)} to{' '}
                    {Math.min(currentPage * ARTICLES_PER_PAGE, totalResults)} of {totalResults} articles
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Previous button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {renderPageNumbers()}
                    </div>

                    {/* Next button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
  )
}