import React from "react"
import { Calendar, Sprout, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

export default function HealthScreeningTimeline({ timelineItems = [], onEdit, onRemove }: HealthScreeningTimelineProps) {
  // Group timeline items by month
  const groupedItems: Record<string, TimelineItem[]> = {}
  ;(timelineItems ?? []).forEach((item) => {
    if (!groupedItems[item.month]) {
      groupedItems[item.month] = []
    }
    groupedItems[item.month].push(item)
  })

  const hasItems = timelineItems && timelineItems.length > 0

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Health Screening Timeline</h2>
        <p className="text-sm text-muted-foreground">Upcoming and recommended health screenings by date</p>
      </div>

      {hasItems ? (
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
                            ) : item.status === "overdue" ? (
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                                Overdue
                              </Badge>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <span className="text-sm text-muted-foreground">{item.dueDate}</span>
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
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Sprout className="w-16 h-16 text-teal-600 mb-4" />
          <p className="text-lg text-slate-500 font-medium">{`There's nothing here yet`}</p>
        </div>
      )}
    </div>
  )
}
