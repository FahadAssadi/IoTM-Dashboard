import type React from "react"
import { Calendar, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import screeningsData from "./screenings-data.json"
import { Badge } from "@/components/ui/badge"

export interface ScreeningItem {
  id: string
  name: string
  dueDate?: string,
  status?: "due-soon" | "overdue" | undefined
}

// Helper to determine status based on dueDate
function getScreeningStatus(dueDate?: string): "due-soon" | "overdue" | undefined {
  if (!dueDate) return undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  if (due < today) return "overdue"

  const twoWeeksFromNow = new Date(today)
  twoWeeksFromNow.setDate(today.getDate() + 14)

  if (due >= today && due <= twoWeeksFromNow) return "due-soon"

  return undefined
}

export default function HealthScreenings() {
  const screenings: ScreeningItem[] = screeningsData.map((screening) => ({
    ...screening,
    status: getScreeningStatus(screening.dueDate),
  }))

  const screeningTypes: string[] = [
    "All Categories",
    "Annual Checkups",
    "Dental",
    "Vaccines"
  ];

  return (
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
                    <span>Due: {screening.dueDate}</span>
                    {screening.status === "overdue" && (
                      <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Overdue</Badge>
                    )}
                    {screening.status === "due-soon" && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Due Soon</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="default">Schedule</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
