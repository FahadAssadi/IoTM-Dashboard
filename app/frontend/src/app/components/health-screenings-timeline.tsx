import { ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TimelineItem {
  id: string
  name: string
  dueDate: string
  month: string
  status: "upcoming" | "due-soon" | "overdue"
}

export default function HealthScreeningTimeline() {
  const timelineItems: TimelineItem[] = [
    {
      id: "1",
      name: "Hearing Test",
      dueDate: "Due: March 20, 2025",
      month: "April 2025",
      status: "due-soon",
    },
    {
      id: "2",
      name: "Annual Physical Examination",
      dueDate: "Due: April 20, 2025",
      month: "May 2025",
      status: "upcoming",
    },
    {
      id: "3",
      name: "Dental Checkup",
      dueDate: "Due: May 20, 2025",
      month: "June 2025",
      status: "upcoming",
    },
    {
      id: "4",
      name: "Mammogram",
      dueDate: "Due: June 5, 2025",
      month: "July 2025",
      status: "upcoming",
    },
  ]

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
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{month}</span>
            </div>

            <div className="space-y-4 pl-4 ml-4 border-l border-dashed">
            {items.map((item) => (
                <div key={item.id} className="relative">
                <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-white"></div>
                <div className="pl-6 p-2 border border-gray-300 rounded">
                    <div className="flex items-center justify-between mb-1">
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
                    <p className="text-sm text-muted-foreground">{item.dueDate}</p>
                </div>
                </div>
            ))}
            </div>
        </div>
        ))}
    </div>

    <Button variant="outline" className="w-full mt-6 flex items-center justify-center gap-2">
        View Full Timeline
        <ArrowRight className="h-4 w-4" />
    </Button>
    </div>
  )
}
