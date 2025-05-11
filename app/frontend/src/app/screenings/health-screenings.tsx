import type React from "react"
import { Calendar, CalendarClock, CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import screeningsData from "./screenings-data.json"

interface ScreeningItem {
  id: string
  name: string
  dueDate: string
  icon: React.ReactNode
  alert?: boolean
}

export default function HealthScreenings() {
  const screenings: ScreeningItem[] = screeningsData.map((screening) => ({
    ...screening,
    icon: screening.alert ? <CircleAlert className="h-4 w-4 text-red-500" /> : <Calendar className="h-4 w-4 text-primary-500" />,
  }))

  const screeningTypes: string[] = [
    "All Categories",
    "Annual Checkups",
    "Dental",
    "Cancer Screenings",
    "Vaccines"
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Recommended Health Screenings</h2>
          <p className="text-sm text-muted-foreground">
            Your personalized health screening timeline based on your profile
          </p>
        </div>
        <Select defaultValue="all"> 
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem> {/* TO BE FIXED: This is here twice to fulfill the defaultValue Correctly*/}
            {screeningTypes.map((type) => (
              <SelectItem 
              key={type} // Convert to value-safe string
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
                <div className="flex items-center justify-center mt-1 h-12 w-12 rounded-full bg-slate-100">{screening.icon}</div>
                <div>
                  <h3 className="font-medium">{screening.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    <span>Due: {screening.dueDate}</span>
                  </div>
                </div>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">Schedule</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
