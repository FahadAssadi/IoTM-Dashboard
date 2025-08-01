"use client"

import React, { useState } from "react"
import { Calendar, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import screeningsData from "./screenings-data.json"
import HealthScreeningTimeline from "./health-screenings-timeline"
import { TimelineItem } from "./health-screenings-timeline"

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

export default function HealthScreenings() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [datePickerOpen, setDatePickerOpen] = useState<{ open: boolean; screening?: ScreeningItem }>({ open: false })
  const [selectedDate, setSelectedDate] = useState<string>("")

  const screenings: ScreeningItem[] = screeningsData.map((screening) => {
    const status = getScreeningStatus(screening.dueDate)
    return {
      ...screening,
      status: status === "upcoming" ? undefined : status,
    }
  })

  const screeningTypes: string[] = [
    "All Categories",
    "Annual Checkups",
    "Dental",
    "Vaccines"
  ];

  // Handle scheduling a screening
  const handleSchedule = (screening: ScreeningItem) => {
    setDatePickerOpen({ open: true, screening })
  }

  // Handle date selection and add to timeline
  const handleDateSelect = () => {
    if (!datePickerOpen.screening || !selectedDate) return
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
    setDatePickerOpen({ open: false })
    setSelectedDate("")
  }

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
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

        <div className="space-y-4">
          {screenings.map((screening) => (
            <div key={screening.id} className="border border-gray-300 p-2 rounded">
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
                <Button variant="default" onClick={() => handleSchedule(screening)}>
                  Schedule
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date Picker Modal */}
      {datePickerOpen.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-4 min-w-[320px]">
            <h3 className="font-semibold text-lg mb-2">Select Due Date</h3>
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

      {/* Timeline */}
      <HealthScreeningTimeline timelineItems={timelineItems} />
    </>
  )
}
