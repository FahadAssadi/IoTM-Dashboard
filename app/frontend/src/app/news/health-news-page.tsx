"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "lucide-react"

import healthNews from "./news-data.json"

// All unique categories from the news data
const categories = ["All", ...new Set(healthNews.map((item) => item.category))]

export function HealthNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null)

  // Filter news based on selected category
  const filteredNews =
    selectedCategory === "All" ? healthNews : healthNews.filter((item) => item.category === selectedCategory)

  const toggleArticle = (id: number) => {
    setExpandedArticle(expandedArticle === id ? null : id)
  }

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
                    {categories.map((category) => (
                      <TabsTrigger key={category} value={category}>
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* News articles */}
              <div className="grid gap-6 md:grid-cols-2">
                {filteredNews.map((article) => (
                  <Card key={article.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 hover:bg-teal-100">
                          {article.category}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {article.date}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold mt-2">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-gray-600 text-sm">
                        {expandedArticle === article.id ? article.summary : `${article.summary.substring(0, 120)}...`}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-teal-600 hover:text-teal-800"
                        onClick={() => toggleArticle(article.id)}
                      >
                        {expandedArticle === article.id ? "Show Less" : "Read More"}
                      </Button>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {article.source}
                      </Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
  )
}
