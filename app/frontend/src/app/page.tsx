"use client"

import { Calendar, Clock, Heart, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { TimelineItem } from "./screenings/health-screenings-timeline"
import timelineData from "./screenings/timeline-data.json"
import { useRouter } from "next/navigation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const timelineItems: TimelineItem[] = timelineData as any[] // TODO: connect backend to get real scheduled screening data

const BADGE_MAP: Record<"upcoming" | "due-soon" | "overdue", { bg: string; text: string; border: string; label: string }> = {
  "upcoming": {
    bg: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-200",
    label: "Upcoming"
  },
  "due-soon": {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Due Soon"
  },
  "overdue": {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    label: "Overdue"
  },
}

function HealthScreeningCard({
  item,
}: { item: TimelineItem }) {
  const badge = BADGE_MAP[item.status as "upcoming" | "due-soon" | "overdue"] ?? BADGE_MAP["upcoming"]
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
        <Calendar className="h-6 w-6 text-teal-600" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="font-medium text-slate-800">{item.guidelineName}</p>
        <div className="flex items-center text-sm text-slate-600">
          <Clock className="mr-1 h-4 w-4" />
          <span>{item.scheduledDate}</span>
        </div>
      </div>
      <Badge
        variant="outline"
        className={`ml-auto ${badge.bg} ${badge.text} ${badge.border}`}
      >
        {badge.label}
      </Badge>
      <Button variant="default">
        Export
      </Button>
    </div>
  )
}


export default function DashboardPage() {

  const router = useRouter();
  const redirect = ( page: string ) => {
    router.push(page);
  }

  return (
    <main className="flex flex-col gap-4 p-4 md:gap-8 md:p-6 w-full bg-slate-50">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Welcome back, Jane</h1>
        <p className="text-slate-600">Here&apos;s an overview of your health status and upcoming checkups.</p>
      </div>

      {/* Health Status Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Upcoming Checkups</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {timelineItems.length}
            </div>
            <p className="mt-2 text-xs text-slate-600">
              You have {timelineItems.length} upcoming health screenings
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 ">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Vitals Status</CardTitle>
            <Heart className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">Normal</div>
            <p className="mt-2 text-xs text-slate-600">All your vital signs are within normal ranges</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Health Screenings */}
      <Card className="border-slate-200 ">
        <CardHeader>
          <CardTitle className="text-slate-800">Upcoming Health Screenings</CardTitle>
          <CardDescription className="text-slate-600">
            Your personalised health screening timeline based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {timelineItems.slice(0, 2).map(item => (
            <HealthScreeningCard key={item.scheduledScreeningId} item={item} />
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="outline"
            className="w-full border-teal-700 text-teal-800 hover:bg-teal-50"
            onClick={() => redirect("screenings")}
            >
            View All Screenings
            <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        </CardFooter>
      </Card>

    </main>
  )
}