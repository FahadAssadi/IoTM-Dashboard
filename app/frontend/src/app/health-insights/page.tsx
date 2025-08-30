"use client"

import { useState } from "react"
import {
  Activity,
  Calendar,
  Clock,
  Download,
  Heart,
  // LineChart as LineChartIcon, - ES-Lint Error
  Trees as Lungs,
  Share2,
  Footprints as Shoe,
  ThermometerSnowflake,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import HealthInsightsOverviewTab from "./health-insights-overview-tab"
import HealthInsightsHeartTab from "./health-insights-heart-tab"
import HealthInsightsRespiratoryTab from "./health-insights-respiratory-tab"
import HealthInsightsActivityTab from "./health-insights-activity-tab"
import HealthInsightsSleepTab from "./health-insights-sleep-tab"

// Renamed the component and main heading to "Health Insights"
export default function HealthInsightsPage() {
  const [timeRange, setTimeRange] = useState("24h")

  return (
    <main id="main-content" className="w-full flex flex-col gap-4 p-4 md:gap-8 md:p-6 bg-slate-50" role="main">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Health Insights Dashboard</h1>
          <p className="text-slate-600">Monitor your vital signs and health metrics</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white" aria-label="Export data">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="bg-white" aria-label="Share dashboard">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Vitals summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <VitalCard
          title="Heart Rate"
          value="72"
          unit="bpm"
          status="normal"
          change="-3"
          icon={<Heart className="h-4 w-4 text-rose-500" />}
        />
        <VitalCard
          title="Blood Oxygen"
          value="98"
          unit="%"
          status="normal"
          change="+1"
          icon={<Lungs className="h-4 w-4 text-sky-500" />}
        />
        <VitalCard
          title="Steps"
          value="8,742"
          unit="steps"
          status="good"
          change="+1,254"
          icon={<Shoe className="h-4 w-4 text-green-500" />}
        />
        <VitalCard
          title="Temperature"
          value="37.0"
          unit="°C"
          status="normal"
          change="0"
          icon={<ThermometerSnowflake className="h-4 w-4 text-amber-500" />}
        />
      </div>

      {/* Tabs for different health metrics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="heart" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
            Heart
          </TabsTrigger>
          <TabsTrigger
            value="respiratory"
            className="data-[state=active]:bg-teal-700 data-[state=active]:text-white"
          >
            Respiratory
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
            Activity
          </TabsTrigger>
          <TabsTrigger value="sleep" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
            Sleep
          </TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6">
          <HealthInsightsOverviewTab />
        </TabsContent>

        {/* Heart tab */}
        <TabsContent value="heart" className="space-y-6">
          <HealthInsightsHeartTab />
        </TabsContent>

        {/* Respiratory tab */}
        <TabsContent value="respiratory">
          <HealthInsightsRespiratoryTab />
        </TabsContent>

        {/* Activity tab */}
        <TabsContent value="activity">
          <HealthInsightsActivityTab />
        </TabsContent>

        {/* Sleep tab */}
        <TabsContent value="sleep" className="space-y-4 pt-4">
          <HealthInsightsSleepTab />
        </TabsContent>
      </Tabs>

      {/* Health insights */}
      <div className="w-full gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Health Insights</CardTitle>
            <CardDescription>AI-powered analysis of your health data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Card>
                <div className="flex items-start gap-4 rounded-lg p-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Improved Cardiovascular Health</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your resting heart rate has decreased by 5 bpm over the past month, indicating improved
                      cardiovascular fitness.
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4 rounded-lg p-4">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Consistent Sleep Schedule</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You&apos;ve maintained a consistent sleep schedule for 14 days. This regularity benefits your overall
                      health.
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4 rounded-lg p-4">
                  <div className="rounded-full bg-amber-100 p-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Activity Pattern</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You&apos;re most active on Thursdays and Saturdays. Consider adding light activity on your less active
                      days.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

// TODO: FIX THIS PROPERLY
type VitalCardProps = {
  title: string;
  value: number | string;
  unit?: string;
  status: "normal" | "good" | "warning" | "alert" | string;
  change?: string;
  icon?: unknown;
};

function VitalCard({ title, value, unit, status, change, icon }: VitalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-teal-700"
      case "good":
        return "text-emerald-700"
      case "warning":
        return "text-amber-700"
      case "alert":
        return "text-red-700"
      default:
        return "text-teal-700"
    }
  }

  // FIX THIS
  console.log("Fix the problem with icon: ", icon)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-800">{title}</CardTitle>
          {"This should be 'icon' but I changed it to bypass the linter "} {/* This was icon but the types were weird*/}
        </div>

        <div className="flex items-end gap-1">
          <p className="text-3xl font-bold text-slate-900">{value} </p>
          <p className="text-sm text-slate-600 mb-1">{unit}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          {" · "}
          <span className="text-slate-600">{change} from yesterday</span>
        </p>
      </CardContent>
    </Card>
  )
}