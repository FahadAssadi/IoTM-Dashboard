"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Loader2, AlertCircle } from "lucide-react"

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
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5225'

export function HealthNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch news categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/news/categories`)
        if (!response.ok) throw new Error('Failed to fetch categories')
        
        const categoryData: NewsCategory[] = await response.json()
        setCategories(categoryData)
      } catch (err) {
        console.error('Error fetching categories:', err)
        // Fallback to default categories if API fails
        setCategories([
          { value: 0, name: 'VaccinationRecommendations', displayName: 'Vaccination Recommendations' },
          { value: 1, name: 'DiseaseOutbreakAlerts', displayName: 'Disease Outbreak Alerts' },
          { value: 2, name: 'ScreeningGuidelines', displayName: 'Screening Guidelines' },
          { value: 3, name: 'HealthPolicyInsurance', displayName: 'Health Policy & Insurance' },
          { value: 4, name: 'PublicHealthCampaigns', displayName: 'Public Health Campaigns' },
          { value: 5, name: 'VaccineResearch', displayName: 'Vaccine & Screening Research' },
          { value: 6, name: 'MythBustingEducation', displayName: 'Myth Busting & Education' },
          { value: 7, name: 'PreparationGuides', displayName: 'How-to & Preparation Guides' },
          { value: 8, name: 'General', displayName: 'General Health News' }
        ])
      }
    }

    fetchCategories()
  }, [])

  // Fetch news articles from API
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      setError(null)
      
      try {
        let url = `${API_BASE_URL}/api/news?pageSize=50`
        
        // Add category filter if not "All"
        if (selectedCategory !== "All") {
          const categoryObj = categories.find(cat => cat.displayName === selectedCategory)
          if (categoryObj && categoryObj.value >= 0) {
            url += `&category=${categoryObj.value}`
          }
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch news')
        
        const data: NewsResponse = await response.json()
        
        if (data.success) {
          setArticles(data.articles)
        } else {
          throw new Error(data.message || 'Failed to fetch news')
        }
      } catch (err) {
        console.error('Error fetching news:', err)
        setError(err instanceof Error ? err.message : 'Failed to load news')
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if categories are loaded
    if (categories.length > 0) {
      fetchNews()
    }
  }, [selectedCategory, categories])

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
  const allCategories = ["All", ...Array.from(new Set(categories.map(cat => cat.displayName)))]

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
                              ? article.description 
                              : `${article.description.substring(0, 120)}...`
                            }
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
              )}
            </div>
          </main>
        </div>
  )
}
