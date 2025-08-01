import React from "react"
import { Calendar, CalendarClock, Sprout, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export interface TimelineItem {
  id: string
  name: string
  dueDate: string
  month: string
  status: "due-soon" | "overdue" | "upcoming"
}

interface HealthScreeningTimelineProps {
  timelineItems: TimelineItem[]
  onEdit?: (item: TimelineItem) => void
  onRemove?: (id: string) => void
}

function getMonthYear(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`
}

export default function HealthScreeningTimeline({ timelineItems = [], onEdit, onRemove }: HealthScreeningTimelineProps) {
  // Group timeline items by month and year
  const groupedItems: Record<string, TimelineItem[]> = {}
  ;(timelineItems ?? []).forEach((item) => {
    const groupKey = getMonthYear(item.dueDate)
    if (!groupedItems[groupKey]) {
      groupedItems[groupKey] = []
    }
    groupedItems[groupKey].push(item)
  })

  // Sort group keys chronologically
  const sortedGroupKeys = Object.keys(groupedItems).sort((a, b) => {
    // Parse "Month YYYY" to Date for sorting
    const aDate = new Date(a)
    const bDate = new Date(b)
    return aDate.getTime() - bDate.getTime()
  })

  const hasItems = timelineItems && timelineItems.length > 0

  return (
    <Card className="bg-white border border-gray-300 p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Health Screening Timeline</h2>
        <p className="text-sm text-muted-foreground">Upcoming and recommended health screenings by date</p>
      </div>

      {hasItems ? (
        <div className="space-y-6">
          {sortedGroupKeys.map((groupKey) => {
            // Sort items within the group by dueDate
            const items = groupedItems[groupKey].slice().sort((a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            )
            return (
              <div key={groupKey} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{groupKey}</span>
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
                              ) : item.status === "overdue" ? (
                                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                                  Overdue
                                </Badge>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <CalendarClock className="h-3.5 w-3.5" />
                              <span>
                                Due: {new Date(item.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Edit"
                                onClick={() => onEdit(item)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                            {onRemove && (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Remove"
                                onClick={() => onRemove(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="default">Export</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Sprout className="w-16 h-16 text-teal-600 mb-4" />
          <p className="text-lg text-slate-500 font-medium">{`There's nothing here yet`}</p>
        </div>
      )}
    </Card>
  )
}
