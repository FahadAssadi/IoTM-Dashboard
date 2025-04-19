import type React from "react"
import { Calendar, CalendarClock, CalendarDays, CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ScreeningItem {
  id: string
  name: string
  dueDate: string
  icon: React.ReactNode
  alert?: boolean
}

export default function HealthScreenings() {
  const screenings: ScreeningItem[] = [
    {
      id: "1",
      name: "Annual Physical Examination",
      dueDate: "May 15, 2025",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      id: "2",
      name: "Dental Checkup",
      dueDate: "June 3, 2025",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      id: "3",
      name: "Eye Examination",
      dueDate: "August 12, 2025",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      id: "4",
      name: "Skin Cancer Screening",
      dueDate: "March 10, 2025",
      icon: <CircleAlert className="h-5 w-5 text-red-500" />,
      alert: true,
    },
    {
      id: "5",
      name: "Mammogram",
      dueDate: "July 22, 2025",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      id: "6",
      name: "Colonoscopy",
      dueDate: "November 5, 2029",
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "7",
      name: "Cholesterol Test",
      dueDate: "February 15, 2025",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      id: "8",
      name: "Bone Density Test",
      dueDate: "September 20, 2025",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      id: "9",
      name: "Tetanus Booster",
      dueDate: "October 10, 2025",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      id: "10",
      name: "Hearing Test",
      dueDate: "April 5, 2025",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Health Screenings</h1>
        <Button variant="ghost" size="icon">
          <CalendarDays className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">Track and manage your recommended health screenings and checkups.</p>

      <div className="bg-white border rounded-lg p-6 mb-6">
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
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="annual">Annual Checkups</SelectItem>
              <SelectItem value="dental">Dental</SelectItem>
              <SelectItem value="vision">Vision</SelectItem>
              <SelectItem value="cancer">Cancer Screenings</SelectItem>
              <SelectItem value="vaccines">Vaccines</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {screenings.map((screening) => (
            <div key={screening.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{screening.icon}</div>
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
    </div>
  )
}
