"use client"

import React, { useState } from "react"
import { Calendar, CalendarClock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import screeningsData from "./screenings-data.json"
import HealthScreeningTimeline, { TimelineItem } from "./health-screenings-timeline"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export interface ScreeningItem {
  id: string
  name: string
  dueDate?: string
  status?: "due-soon" | "overdue" | undefined
}

function getScreeningStatus(dueDate?: string): "due-soon" | "overdue" | "upcoming" | undefined {
  if (!dueDate) return undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  if (due < today) return "overdue"

  const twoWeeksFromNow = new Date(today)
  twoWeeksFromNow.setDate(today.getDate() + 14)

  if (due >= today && due <= twoWeeksFromNow) return "due-soon"

  return "upcoming"
}

function formatDateForInput(dateStr?: string) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ""
  // Adjust for local timezone offset
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 10)
}

export default function HealthScreenings() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [datePickerOpen, setDatePickerOpen] = useState<{ open: boolean; screening?: ScreeningItem; timelineItemId?: string }>({ open: false })
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [hiddenScreenings, setHiddenScreenings] = useState<ScreeningItem[]>([])
  const [showHidden, setShowHidden] = useState(false)

  // All screenings from data, with status
  const allScreenings: ScreeningItem[] = screeningsData.map((screening) => {
    const status = getScreeningStatus(screening.dueDate)
    return {
      ...screening,
      status: status === "upcoming" ? undefined : status,
    }
  })

  // Filter out hidden screenings for visible list
  const screenings = allScreenings.filter(
    (screening) => !hiddenScreenings.some((hidden) => hidden.id === screening.id)
  )

  const screeningTypes: string[] = [
    "All Categories",
    "Annual Checkups",
    "Dental",
    "Vaccines"
  ];

  // Handle scheduling a screening
  const handleSchedule = (screening: ScreeningItem) => {
    setDatePickerOpen({ open: true, screening })
    setSelectedDate(formatDateForInput(screening.dueDate))
  }

  // Handle editing a timeline item
  const handleEditTimelineItem = (item: TimelineItem) => {
    setDatePickerOpen({ open: true, timelineItemId: item.id })
    setSelectedDate(formatDateForInput(item.dueDate))
  }

  // Handle removing a timeline item
  const handleRemoveTimelineItem = (id: string) => {
    setTimelineItems((prev) => prev.filter((item) => item.id !== id))
  }

  // Handle date selection and add/update timeline
  const handleDateSelect = () => {
    if (!selectedDate) return

    // Editing an existing timeline item
    if (datePickerOpen.timelineItemId) {
      setTimelineItems((prev) =>
        prev.map((item) =>
          item.id === datePickerOpen.timelineItemId
            ? {
                ...item,
                dueDate: selectedDate,
                month: new Date(selectedDate).toLocaleString("default", { month: "long" }),
                status: getScreeningStatus(selectedDate) as "due-soon" | "overdue" | "upcoming",
              }
            : item
        )
      )
    }
    // Scheduling a new screening
    else if (datePickerOpen.screening) {
      const dueDate = selectedDate
      const status = getScreeningStatus(dueDate) as "due-soon" | "overdue" | "upcoming"
      const month = new Date(dueDate).toLocaleString("default", { month: "long" })
      setTimelineItems((prev) => [
        ...prev,
        {
          id: datePickerOpen.screening!.id + "-" + dueDate,
          name: datePickerOpen.screening!.name,
          dueDate,
          month,
          status,
        }
      ])
    }

    setDatePickerOpen({ open: false })
    setSelectedDate("")
  }

  // Hide a screening
  const handleHideScreening = (screening: ScreeningItem) => {
    setHiddenScreenings((prev) => [...prev, screening])
  }

  // Unhide a screening
  const handleUnhideScreening = (screening: ScreeningItem) => {
    setHiddenScreenings((prev) => prev.filter((item) => item.id !== screening.id))
  }

  // Unhide all hidden screenings
  const handleUnhideAll = () => {
    setHiddenScreenings([])
    setShowHidden(false)
  }

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Recommended Health Screenings</h2>
              <p className="text-sm text-muted-foreground">
                Your personalised health screening timeline based on your profile
              </p>
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {screeningTypes.map((type) => (
                  <SelectItem
                    key={type}
                    value={type.toLowerCase().replace(/\s+/g, "")}
                  >{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visible Screenings */}
          {!showHidden && (
            <div className="space-y-4">
              {screenings.length === 0 && (
                <div className="text-center text-slate-500 py-8">No screenings to show.</div>
              )}
              {screenings.map((screening) => (
                <Card key={screening.id} className="p-2 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center mt-1 h-12 w-12 rounded-full bg-slate-100">
                        <Calendar className="h-4 w-4 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{screening.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span>Due: {screening.dueDate || "Not scheduled"}</span>
                          {screening.status === "overdue" && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Overdue</Badge>
                          )}
                          {screening.status === "due-soon" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Due Soon</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" aria-label="Hide" onClick={() => handleHideScreening(screening)}>
                        <EyeOff className="w-5 h-5" />
                      </Button>
                      <Button variant="default" onClick={() => handleSchedule(screening)}>
                        Schedule
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Hidden Screenings */}
          {showHidden && (
            <div className="space-y-4">
              {hiddenScreenings.length === 0 && (
                <div className="text-center text-slate-500 py-8">No hidden screenings.</div>
              )}
              {hiddenScreenings.map((screening) => (
                <Card key={screening.id} className="p-2 rounded bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center mt-1 h-12 w-12 rounded-full bg-slate-200">
                        <Calendar className="h-4 w-4 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{screening.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span>Due: {screening.dueDate || "Not scheduled"}</span>
                          {screening.status === "overdue" && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Overdue</Badge>
                          )}
                          {screening.status === "due-soon" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Due Soon</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" aria-label="Unhide" onClick={() => handleUnhideScreening(screening)}>
                        <Eye className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {hiddenScreenings.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full border-teal-700 text-teal-800 hover:bg-teal-50 mt-4"
                  onClick={handleUnhideAll}
                >
                  Unhide All
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!showHidden ? (
            <Button
              variant="outline"
              className="w-full border-teal-700 text-teal-800 hover:bg-teal-50"
              onClick={() => setShowHidden(true)}
              disabled={hiddenScreenings.length === 0}
            >
              View Hidden Screenings
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full border-teal-700 text-teal-800 hover:bg-teal-50"
              onClick={() => setShowHidden(false)}
            >
              Show Screenings
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Date Picker Modal */}
      {datePickerOpen.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-4 min-w-[320px]">
            <h3 className="font-semibold text-lg mb-2">
              {datePickerOpen.timelineItemId ? "Edit Due Date" : "Select Due Date"}
            </h3>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDatePickerOpen({ open: false })}>Cancel</Button>
              <Button
                variant="default"
                onClick={handleDateSelect}
                disabled={!selectedDate}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Health Screenings Timeline */}
      <HealthScreeningTimeline
        timelineItems={timelineItems}
        onEdit={handleEditTimelineItem}
        onRemove={handleRemoveTimelineItem}
      />
    </>
  )
}
