import { ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import timelineData from "./timeline-data.json"

interface TimelineItem {
  id: string
  name: string
  dueDate: string
  month: string
  status: "upcoming" | "due-soon" | "overdue"
}

export default function HealthScreeningTimeline() {
  const timelineItems: TimelineItem[] = timelineData.map((item) => ({
    id: item.id,
    name: item.name,
    dueDate: item.dueDate,
    month: new Date(item.dueDate).toLocaleString("default", { month: "long" }),
    status: item.status as "upcoming" | "due-soon" | "overdue",
  }))

  // Group timeline items by month
  const groupedItems: Record<string, TimelineItem[]> = {}
  timelineItems.forEach((item) => {
    if (!groupedItems[item.month]) {
      groupedItems[item.month] = []
    }
    groupedItems[item.month].push(item)
  })

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Health Screening Timeline</h2>
        <p className="text-sm text-muted-foreground">Upcoming and recommended health screenings by date</p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([month, items]) => (
          <div key={month} className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">{month}</span>
            </div>

            <div className="space-y-4 pl-4 ml-4 border-l border-dashed">
              {items.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[22px] top-6 w-3 h-3 rounded-full border-2 border-primary bg-white"></div>
                  <div className="pl-6 p-2 border border-gray-300 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.name}</h3>
                          {item.status === "due-soon" ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Due Soon
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                              Upcoming
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <span className="text-sm text-muted-foreground">{item.dueDate}</span>
                        </div>
                      </div>
                      <Button variant="default">Export</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
