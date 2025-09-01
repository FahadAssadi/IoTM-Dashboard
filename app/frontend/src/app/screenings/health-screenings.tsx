"use client"

import React, { useState, useEffect } from "react"
import { Calendar, CalendarClock, Eye, EyeOff, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import HealthScreeningTimeline, { TimelineItem } from "./health-screenings-timeline"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log("API Base URL:", apiBaseUrl);

export interface ScreeningItem {
  GuidelineId: string
  name: string
  lastScheduled?: string
  status?: "due-soon" | "overdue" | undefined
  isRecurring: boolean
  screeningType?: string
  defaultFrequencyMonths?: string
  description?: string
  eligibility?: string
  minAge?: number
  maxAge?: number
  cost?: string
  delivery?: string
  link?: string
}

function getScreeningStatus(lastScheduled?: string, defaultFrequencyMonths?: string): "due-soon" | "overdue" | "upcoming" | undefined {
  if (!lastScheduled || !defaultFrequencyMonths) return undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = new Date(lastScheduled)
  last.setHours(0, 0, 0, 0)

  const nextDue = new Date(last)
  if (defaultFrequencyMonths.includes("year")) {
    const years = parseInt(defaultFrequencyMonths.replace(/\D/g, "")) || 1
    nextDue.setFullYear(last.getFullYear() + years)
  } else if (defaultFrequencyMonths.includes("month")) {
    const months = parseInt(defaultFrequencyMonths.replace(/\D/g, "")) || 6
    nextDue.setMonth(last.getMonth() + months)
  }

  if (nextDue < today) return "overdue"

  const twoWeeksFromNow = new Date(today)
  twoWeeksFromNow.setDate(today.getDate() + 14)

  if (nextDue >= today && nextDue <= twoWeeksFromNow) return "due-soon"

  return "upcoming"
}

function formatDateForInput(dateStr?: string) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ""
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
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Add this state to track scheduled dates for each screening
  // TODO: ignore error for now, won't need this state once backend is connected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [scheduledDates, setScheduledDates] = useState<Record<string, string[]>>({})

  const [selectedType, setSelectedType] = useState<string>("allcategories")

  const [allScreenings, setAllScreenings] = useState<ScreeningItem[]>([])

  const [feedbackMessage, setFeedbackMessage] = useState<string>("") // feedback message for fetching new screenings

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/UserScreenings/`)
      .then(res => res.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any[]) => {
        // Extract only the guideline object from each user screening
        const guidelines = data
          .map(item => item.guideline)
          .filter(g => !!g); // Remove any undefined/null guidelines

        setAllScreenings(
          guidelines.map((screening) => ({
            GuidelineId: screening.guidelineId,
            name: screening.name,
            lastScheduled: screening.lastScheduled ?? undefined,
            isRecurring: screening.isRecurring,
            screeningType: screening.screeningType,
            defaultFrequencyMonths: screening.defaultFrequencyMonths,
            description: screening.description,
            cost: screening.cost,
            delivery: screening.delivery,
            link: screening.link,
          }))
        )
      })
      .catch(err => {
        console.error("Failed to fetch guidelines", err)
      })
  }, [])

  // Filter out hidden screenings for visible list
  const screenings = allScreenings.filter(
    (screening) =>
      !hiddenScreenings.some((hidden) => hidden.GuidelineId === screening.GuidelineId) &&
      (selectedType === "allcategories" || (screening.screeningType?.toLowerCase().replace(/\s+/g, "") === selectedType))
  )

  const screeningTypes: string[] = [
    "All Categories",
    ...Array.from(new Set(allScreenings.map(s => s.screeningType).filter((type): type is string => typeof type === "string")))
  ];

  // Handle scheduling a screening
  const handleSchedule = (screening: ScreeningItem) => {
    setErrorMessage("")
    setDatePickerOpen({ open: true, screening })
    setSelectedDate(formatDateForInput(screening.lastScheduled))
  }

  // Handle editing a timeline item
  const handleEditTimelineItem = (item: TimelineItem) => {
    setErrorMessage("")
    setDatePickerOpen({ open: true, timelineItemId: item.id })
    setSelectedDate(formatDateForInput(item.dueDate))
  }

  // Handle removing a timeline item
  const handleRemoveTimelineItem = (id: string) => {
    setTimelineItems((prev) => {
      const itemToRemove = prev.find(item => item.id === id)
      if (!itemToRemove) return prev
      const screeningId = itemToRemove.id.split("-")[0]
      const removedDate = itemToRemove.dueDate
      const now = new Date()
      const removedDateObj = new Date(removedDate)
      // Remove the date from scheduledDates
      setScheduledDates((dates) => {
        const updated = { ...dates }
        if (updated[screeningId]) {
          updated[screeningId] = updated[screeningId].filter(date => date !== removedDate)
          // If the removed date is in the future, update lastScheduled
          if (removedDateObj > now) {
            const latest = updated[screeningId].length > 0
              ? updated[screeningId][updated[screeningId].length - 1]
              : undefined
            setAllScreenings((screenings) =>
              screenings.map(s =>
                s.GuidelineId === screeningId
                  ? { ...s, lastScheduled: latest }
                  : s
              )
            )
          }
        }
        return updated
      })
      // Remove the timeline item
      return prev.filter(item => item.id !== id)
    })
  }

  // Handle date selection and add/update timeline
  const handleDateSelect = () => {
    if (!selectedDate) return

    if (datePickerOpen.timelineItemId) {
      // Editing an existing timeline item
      setTimelineItems((prev) =>
        prev.map((item) =>
          item.id === datePickerOpen.timelineItemId
            ? {
                ...item,
                dueDate: selectedDate,
                month: new Date(selectedDate).toLocaleString("default", { month: "long" }),
                status: (getScreeningStatus(selectedDate, allScreenings.find(s => s.GuidelineId === item.id.split("-")[0])?.defaultFrequencyMonths) ?? "upcoming"),
              }
            : item
        )
      )
      setDatePickerOpen({ open: false })
      setSelectedDate("")
    }
    // Scheduling a new screening
    else if (datePickerOpen.screening) {
      const screeningId = datePickerOpen.screening.GuidelineId
      const dueDate = selectedDate
      const status = getScreeningStatus(dueDate, datePickerOpen.screening.defaultFrequencyMonths)
      const month = new Date(dueDate).toLocaleString("default", { month: "long" })
      const newId = screeningId + "-" + dueDate

      setTimelineItems((prev) => {
        if (prev.some((item) => item.id === newId)) {
          setErrorMessage("This screening is already scheduled for this date.")
          return prev
        }
        setErrorMessage("")
        // Update scheduledDates history
        setScheduledDates((dates) => {
          const updated = { ...dates }
          updated[screeningId] = [...(updated[screeningId] || []), dueDate].sort()
          // Update lastScheduled in allScreenings
          setAllScreenings((screenings) =>
            screenings.map(s =>
              s.GuidelineId === screeningId
                ? { ...s, lastScheduled: updated[screeningId][updated[screeningId].length - 1] }
                : s
            )
          )
          return updated
        })
        return [
          ...prev,
          {
            id: newId,
            name: datePickerOpen.screening!.name,
            dueDate,
            month,
            status: status ?? "upcoming",
          }
        ]
      })
      setDatePickerOpen({ open: false })
      setSelectedDate("")
    }
  }

  // Hide a screening
  const handleHideScreening = (screening: ScreeningItem) => {
    setHiddenScreenings((prev) => [...prev, screening])
  }

  // Unhide a screening
  const handleUnhideScreening = (screening: ScreeningItem) => {
    setHiddenScreenings((prev) => prev.filter((item) => item.GuidelineId !== screening.GuidelineId))
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
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Button
                  variant="outline"
                  aria-label="Check for new screenings"
                  onClick={async () => {
                    setFeedbackMessage("")
                    try {
                      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/new-screenings`, { method: "POST" })
                      const data = await res.json()
                      if (!Array.isArray(data) || data.length === 0) {
                        setFeedbackMessage("No new screenings available.")
                      } else {
                        setFeedbackMessage(`${data.length} new screening${data.length > 1 ? "s" : ""} added.`)
                        
                          setAllScreenings(prev => [
                          ...prev,
                          ...data
                            .map((item: { guideline: ScreeningItem }) => item.guideline)
                            .filter((g: ScreeningItem | undefined): g is ScreeningItem => !!g)
                            .map((screening: ScreeningItem) => ({
                            GuidelineId: screening.GuidelineId,
                            name: screening.name,
                            lastScheduled: screening.lastScheduled ?? undefined,
                            isRecurring: screening.isRecurring,
                            screeningType: screening.screeningType,
                            defaultFrequencyMonths: screening.defaultFrequencyMonths,
                            description: screening.description,
                            cost: screening.cost,
                            delivery: screening.delivery,
                            link: screening.link,
                            }))
                        ])
                      }
                    } catch {
                      setFeedbackMessage("Failed to check for new screenings.")
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <span
                  className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
                >
                  Fetch new screenings
                </span>
              </div>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {screeningTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type?.toLowerCase().replace(/\s+/g, "")}
                    >{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fetch screenings feedback Message */}
          {feedbackMessage && (
            <div className="mb-2 text-sm text-teal-700">{feedbackMessage}</div>
          )}

          {/* Visible Screenings */}
          {!showHidden && (
            <div className="space-y-4">
              {screenings.length === 0 && (
                <div className="text-center text-slate-500 py-8">No screenings to show.</div>
              )}
              {screenings.map((screening) => (
                <Card key={screening.GuidelineId} className="p-2 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100">
                        <Calendar className="h-4 w-4 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{screening.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span>Last scheduled: {screening.lastScheduled || "Not recorded"}</span>
                          {screening.status === "overdue" && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Overdue</Badge>
                          )}
                          {screening.status === "due-soon" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Due Soon</Badge>
                          )}
                        </div>
                        {screening.description && (
                          <div className="text-xs text-gray-500 mt-1">{screening.description}</div>
                        )}
                        {screening.defaultFrequencyMonths && (
                          <div className="text-xs text-gray-500 mt-1">Recommended frequency: {screening.defaultFrequencyMonths}</div>
                        )}
                        {screening.cost && (
                          <div className="text-xs text-gray-500 mt-1">Cost: {screening.cost}</div>
                        )}
                        {screening.delivery && (
                          <div className="text-xs text-gray-500 mt-1">Delivery: {screening.delivery}</div>
                        )}
                        {screening.link && (
                          <a href={screening.link} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 underline mt-1 block">
                            Learn more
                          </a>
                        )}
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
                <Card key={screening.GuidelineId} className="p-2 rounded bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-200">
                        <Calendar className="h-4 w-4 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{screening.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span>Last scheduled: {screening.lastScheduled || "Not recorded"}</span>
                          {screening.status === "overdue" && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Overdue</Badge>
                          )}
                          {screening.status === "due-soon" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Due Soon</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="ml-2">Frequency: {screening.defaultFrequencyMonths}</span>
                        </div>
                        {screening.description && (
                          <div className="text-xs text-gray-500 mt-1">{screening.description}</div>
                        )}
                        {screening.cost && (
                          <div className="text-xs text-gray-500 mt-1">Cost: {screening.cost}</div>
                        )}
                        {screening.delivery && (
                          <div className="text-xs text-gray-500 mt-1">Delivery: {screening.delivery}</div>
                        )}
                        {screening.link && (
                          <a href={screening.link} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 underline mt-1 block">
                            Learn more
                          </a>
                        )}
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
              onChange={e => {
                setSelectedDate(e.target.value)
                setErrorMessage("")
              }}
            />
            {errorMessage && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDatePickerOpen({ open: false })}>Cancel</Button>
              <Button
                variant="default"
                onClick={handleDateSelect}
                disabled={!selectedDate || !!errorMessage}
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
