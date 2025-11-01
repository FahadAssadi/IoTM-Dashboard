import React from "react"
import { Calendar, CalendarClock, Sprout, Pencil, Trash2, Archive, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export interface TimelineItem {
  scheduledScreeningId: string
  guidelineName: string
  guidelineId: string
  scheduledDate: string
  month: string
  status?: "due-soon" | "overdue" | "upcoming"
}

type CalEvent = {
  title: string
  description?: string
  startTime: string
  endTime?: string
  location?: string
  timezone?: string
}

// Google Calendar helper: format Date to YYYYMMDDTHHMMSSZ
function formatGoogleDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

// Build a Google Calendar "Add event" URL (opens Google Calendar UI in a new tab)
function getGoogleCalendarUrl(event: CalEvent): string {
  const start = formatGoogleDate(new Date(event.startTime));
  const end = event.endTime ? formatGoogleDate(new Date(event.endTime)) : start;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "",
    details: event.description || "",
    location: event.location || "",
    dates: `${start}/${end}`,
    ctz: event.timezone || "UTC",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

interface HealthScreeningTimelineProps {
  timelineItems: TimelineItem[]
  onEdit?: (item: TimelineItem) => void
  onRemove?: (scheduledScreeningId: string) => void
  onArchive?: (scheduledScreeningId: string) => void
  timezone?: string // user-selectable, defaults to AEST
  showArchived?: boolean
  onToggleArchived?: () => void
  archivedTimelineItems?: TimelineItem[]
  onDeleteArchived?: (scheduledScreeningId: string) => void
}

function getMonthYear(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`
}

export function getTimelineStatus(scheduledDate?: string): "due-soon" | "overdue" | "upcoming" | undefined {
  if (!scheduledDate) return undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(scheduledDate)
  target.setHours(0, 0, 0, 0)

  if (target < today) return "overdue"

  const twoWeeksFromNow = new Date(today)
  twoWeeksFromNow.setDate(today.getDate() + 14)

  if (target >= today && target <= twoWeeksFromNow) return "due-soon"

  return "upcoming"
}

export default function HealthScreeningTimeline({
  timelineItems = [],
  onEdit,
  onRemove,
  onArchive,
  timezone = "Australia/Sydney", // default to AEST
  showArchived = false,
  onToggleArchived,
  archivedTimelineItems = [],
  onDeleteArchived
}: HealthScreeningTimelineProps) {
  // Group timeline items by month and year
  const groupedItems: Record<string, TimelineItem[]> = {}
    ; (timelineItems ?? []).forEach((item) => {
      const groupKey = getMonthYear(item.scheduledDate)
      if (!groupedItems[groupKey]) {
        groupedItems[groupKey] = []
      }
      groupedItems[groupKey].push(item)
    })

  // Sort group keys chronologically
  const sortedGroupKeys = Object.keys(groupedItems).sort((a, b) => {
    const aDate = new Date(a)
    const bDate = new Date(b)
    return aDate.getTime() - bDate.getTime()
  })

  const hasItems = timelineItems && timelineItems.length > 0

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {showArchived ? "Archived Screenings" : "Upcoming Screenings"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {showArchived ? "Archived health screenings" : "Upcoming health screenings by date"}
          </p>
        </div>

        {showArchived ? (
          // Render archived items
          archivedTimelineItems.length === 0 ? (
            <div className="text-center text-slate-500 py-8">No archived screenings.</div>
          ) : (
            <div className="space-y-6">
              {/* Group by guidelineId */}
              {Object.values(
                archivedTimelineItems.reduce<Record<string, TimelineItem[]>>((acc, item) => {
                  if (!acc[item.guidelineId]) acc[item.guidelineId] = [];
                  acc[item.guidelineId].push(item);
                  return acc;
                }, {})
              ).map((items) => (
                <div key={items[0].guidelineId} className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center">
                      <Archive className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{items[0].guidelineName}</span>
                  </div>
                  <div className="space-y-2 pl-4 ml-4 border-l border-dashed">
                    {items
                      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                      .map((item) => (
                        <div key={item.scheduledScreeningId} className="pl-2 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.scheduledDate).toLocaleDateString("en-AU", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            onClick={() => onDeleteArchived?.(item.scheduledScreeningId)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Render active timeline items
          hasItems ? (
            <div className="space-y-6">
              {sortedGroupKeys.map((groupKey) => {
                const items = groupedItems[groupKey].slice().sort((a, b) =>
                  new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
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
                      {items.map((item) => {
                        // Prepare event object for Google Calendar link
                        const startDate = new Date(item.scheduledDate)
                        const endDate = new Date(item.scheduledDate)
                        endDate.setHours(endDate.getHours() + 1) // 1 hour event by default

                        const computedStatus = item.status ?? getTimelineStatus(item.scheduledDate)

                        const event: CalEvent = {
                          title: item.guidelineName,
                          description: "Health screening reminder",
                          startTime: startDate.toISOString(),
                          endTime: endDate.toISOString(),
                          location: "",
                          timezone: timezone
                        }

                        return (
                          <div key={item.scheduledScreeningId} className="relative">
                            <div className="absolute -left-[22px] top-6 w-3 h-3 rounded-full border-2 border-primary bg-white"></div>
                            <div className="pl-6 p-2 border border-gray-300 rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{item.guidelineName}</h3>
                                    {computedStatus === "due-soon" ? (
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        Due Soon
                                      </Badge>
                                    ) : computedStatus === "overdue" ? (
                                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                                        Overdue
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <CalendarClock className="h-3.5 w-3.5" />
                                    <span>
                                      Due: {new Date(item.scheduledDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {onEdit && (
                                    <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => onEdit(item)}>
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {onArchive && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="Archive"
                                      onClick={() => onArchive(item.scheduledScreeningId)}
                                    >
                                      <Archive className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {onRemove && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="Remove"
                                      onClick={() => onRemove(item.scheduledScreeningId)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <a
                                    href={getGoogleCalendarUrl(event)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="default">Export</Button>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
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
          )
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!showArchived && (
          <>
            <div className="w-full flex gap-2">
              <Button
                variant="outline"
                className="w-full border-teal-700 text-teal-800 hover:bg-teal-50"
                onClick={onToggleArchived}
              >
                View Archived Screenings
              </Button>
            </div>
          </>
        )}
        {showArchived && (
          <Button
            variant="outline"
            className="w-full border-teal-700 text-teal-800 hover:bg-teal-50"
            onClick={onToggleArchived}
          >
            Show Active Screenings
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
