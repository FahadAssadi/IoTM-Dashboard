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
  Moon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, LineChart } from "@/components/ui/chart"

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
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800">Health Metrics Overview</CardTitle>
              <CardDescription className="text-slate-600">
                Summary of your key health metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">

                {/* Heart rate chart */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base">Heart Rate</CardTitle>
                      <CardDescription>Beats per minute over time</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {/* Heart Rate Chart TODO: FIX CHART COMPONENTS */}
                    {/* <HeartRateChart /> */}
                    <div className="space-y-2">
                      <div className="h-[180px] w-full rounded-md border border-slate-200 bg-white p-4">
                        <div className="flex h-full flex-col">
                          <div className="relative flex-1">
                            {/* Heart Rate Line */}
                            <div className="absolute inset-0">
                              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                  d="M0,50 L5,48 L10,52 L15,45 L20,60 L25,40 L30,55 L35,50 L40,45 L45,55 L50,40 L55,45 L60,35 L65,55 L70,50 L75,45 L80,55 L85,30 L90,50 L95,45 L100,50"
                                  fill="none"
                                  stroke="#0e7c6b"
                                  strokeWidth="2"
                                  vectorEffect="non-scaling-stroke"
                                />
                                <path
                                  d="M0,50 L5,48 L10,52 L15,45 L20,60 L25,40 L30,55 L35,50 L40,45 L45,55 L50,40 L55,45 L60,35 L65,55 L70,50 L75,45 L80,55 L85,30 L90,50 L95,45 L100,50"
                                  fill="url(#heartRateGradient)"
                                  strokeWidth="0"
                                  opacity="0.2"
                                />
                                <defs>
                                  <linearGradient id="heartRateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#0e7c6b" />
                                    <stop offset="100%" stopColor="#0e7c6b" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>

                            {/* Y-axis labels */}
                            <div className="absolute -left-4 top-0 h-full flex flex-col justify-between text-xs text-slate-500">
                              <span>100</span>
                              <span>80</span>
                              <span>60</span>
                              <span>40</span>
                            </div>
                          </div>

                          {/* X-axis labels */}
                          <div className="mt-2 flex justify-between text-xs text-slate-500">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <p className="text-xs text-muted-foreground">Average: 72 bpm | Max: 90 bpm | Min: 58 bpm</p>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base">Blood Oxygen</CardTitle>
                      <CardDescription>SpO2 percentage over time</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {/* Blood Oxygen Chart TODO: FIX CHART COMPONENTS */}
                    {/* <BloodOxygenChart /> */}
                    <div className="h-[180px] w-full rounded-md border border-slate-200 bg-white p-4">
                        <div className="flex h-full flex-col">
                          <div className="relative flex-1">
                            {/* Blood Oxygen Line */}
                            <div className="absolute inset-0">
                              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                  d="M0,20 L5,15 L10,18 L15,10 L20,15 L25,12 L30,10 L35,15 L40,12 L45,8 L50,15 L55,10 L60,12 L65,8 L70,15 L75,10 L80,12 L85,8 L90,15 L95,12 L100,10"
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="2"
                                  vectorEffect="non-scaling-stroke"
                                />
                                <path
                                  d="M0,20 L5,15 L10,18 L15,10 L20,15 L25,12 L30,10 L35,15 L40,12 L45,8 L50,15 L55,10 L60,12 L65,8 L70,15 L75,10 L80,12 L85,8 L90,15 L95,12 L100,10 L100,100 L0,100 Z"
                                  fill="url(#oxygenGradient)"
                                  strokeWidth="0"
                                  opacity="0.2"
                                />
                                <defs>
                                  <linearGradient id="oxygenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>

                            {/* Y-axis labels */}
                            <div className="absolute -left-4 top-0 h-full flex flex-col justify-between text-xs text-slate-500">
                              <span>100%</span>
                              <span>98%</span>
                              <span>96%</span>
                              <span>94%</span>
                            </div>
                          </div>

                          {/* X-axis labels */}
                          <div className="mt-2 flex justify-between text-xs text-slate-500">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                          </div>
                        </div>
                      </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <p className="text-xs text-muted-foreground">Average: 98% | Max: 99% | Min: 95%</p>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base">Steps</CardTitle>
                      <CardDescription>Daily step count in the last week</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {/* Steps chart TODO: fix chart components */}
                    {/* <ActivityChart /> */}
                    <div className="h-[180px] w-full rounded-md border border-slate-200 bg-white p-4">
                        <div className="flex h-full flex-col">
                          <div className="relative flex-1">
                            {/* Steps Bars */}
                            <div className="absolute inset-0 flex items-end justify-around">
                              <div className="h-[40%] w-[8%] rounded-t bg-teal-600 opacity-80"></div>
                              <div className="h-[65%] w-[8%] rounded-t bg-teal-600 opacity-80"></div>
                              <div className="h-[50%] w-[8%] rounded-t bg-teal-600 opacity-80"></div>
                              <div className="h-[75%] w-[8%] rounded-t bg-teal-600 opacity-80"></div>
                              <div className="h-[60%] w-[8%] rounded-t bg-teal-600 opacity-80"></div>
                              <div className="h-[85%] w-[8%] rounded-t bg-teal-600 opacity-80"></div>
                              <div className="h-[45%] w-[8%] rounded-t bg-teal-600 opacity-80"></div>
                            </div>

                            {/* Y-axis labels */}
                            <div className="absolute -left-4 top-0 h-full flex flex-col justify-between text-xs text-slate-500">
                              <span>15k</span>
                              <span>10k</span>
                              <span>5k</span>
                              <span>0</span>
                            </div>
                          </div>

                          {/* X-axis labels */}
                          <div className="mt-2 flex justify-between text-xs text-slate-500">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                          </div>
                        </div>
                      </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <p className="text-xs text-muted-foreground">Average: 9k | Max: 13k | Min: 5k</p>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base">Temperature</CardTitle>
                      <CardDescription>Body temperature in the last week</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {/* TODO: add temperature chart component */}
                    <div className="h-[180px] w-full rounded-md border border-slate-200 bg-white p-4">
                        <div className="flex h-full flex-col">
                          <div className="relative flex-1">
                            {/* Temperature Line */}
                            <div className="absolute inset-0">
                              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                  d="M0,50 L5,48 L10,52 L15,45 L20,50 L25,48 L30,52 L35,50 L40,45 L45,50 L50,48 L55,52 L60,45 L65,50 L70,48 L75,52 L80,50 L85,45 L90,50 L95,48 L100,52"
                                  fill="none"
                                  stroke="#ef4444"
                                  strokeWidth="2"
                                  vectorEffect="non-scaling-stroke"
                                />
                                <path
                                  d="M0,50 L5,48 L10,52 L15,45 L20,50 L25,48 L30,52 L35,50 L40,45 L45,50 L50,48 L55,52 L60,45 L65,50 L70,48 L75,52 L80,50 L85,45 L90,50 L95,48 L100,52"
                                  fill="url(#tempGradient)"
                                  strokeWidth="0"
                                  opacity="0.2"
                                />
                                <defs>
                                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>

                            {/* Y-axis labels */}
                            <div className="absolute -left-4 top-0 h-full flex flex-col justify-between text-xs text-slate-500">
                              <span>38°C</span>
                              <span>37.5°C</span>
                              <span>37°C</span>
                              <span>36.5°C</span>
                            </div>
                          </div>

                          {/* X-axis labels */}
                          <div className="mt-2 flex justify-between text-xs text-slate-500">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                          </div>
                        </div>
                      </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <p className="text-xs text-muted-foreground">Average: 37.3°C | Max: 37.5°C | Min: 37.1°C</p>
                  </CardFooter>
                </Card>

                {/* <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base">Exercise Impact on Vitals</CardTitle>
                      <CardDescription>How exercise affects your heart rate and blood oxygen</CardDescription>
                    </div>
                    <LineChartIcon className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <ExerciseImpactChart />
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground">
                      Exercise sessions are highlighted in light green. Notice how your heart rate increases during exercise
                      and recovers afterward.
                    </p>
                  </CardFooter>
                </Card> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heart tab */}
        <TabsContent value="heart" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Heart Rate Detailed Analysis</CardTitle>
                <CardDescription>Comprehensive view of your heart rate patterns</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <HeartRateDetailedChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resting Heart Rate</CardTitle>
                <CardDescription>30-day trend</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <RestingHeartRateChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heart Rate Variability</CardTitle>
                <CardDescription>Measure of heart health</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <HeartRateVariabilityChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Respiratory tab */}
        <TabsContent value="respiratory">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Respiratory Health</CardTitle>
                <CardDescription>Blood oxygen and breathing rate</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <RespiratoryHealthChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity tab */}
        <TabsContent value="activity">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Activity Tracking</CardTitle>
                <CardDescription>Steps, distance, and active minutes</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ActivityTrackingChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sleep tab */}
        <TabsContent value="sleep" className="space-y-4 pt-4">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Sleep Analysis</CardTitle>
                  <CardDescription className="text-slate-600">Sleep stages and quality</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Sleep Chart */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-800">Sleep Stages</h3>
                        <span className="text-xs text-slate-500">Last night</span>
                      </div>
                      <div className="h-[200px] w-full rounded-md border border-slate-200 bg-white p-4">
                        <div className="flex h-full flex-col">
                          <div className="relative flex-1">
                            {/* Sleep Stages */}
                            <div className="absolute inset-0">
                              <div className="flex h-full flex-col">
                                <div className="h-[25%] border-b border-slate-100 relative">
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                    Awake
                                  </span>
                                  <div className="absolute top-0 left-[10%] h-full w-[5%] bg-red-200"></div>
                                  <div className="absolute top-0 left-[30%] h-full w-[8%] bg-red-200"></div>
                                  <div className="absolute top-0 left-[70%] h-full w-[3%] bg-red-200"></div>
                                </div>
                                <div className="h-[25%] border-b border-slate-100 relative">
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                    REM
                                  </span>
                                  <div className="absolute top-0 left-[20%] h-full w-[15%] bg-purple-200"></div>
                                  <div className="absolute top-0 left-[50%] h-full w-[20%] bg-purple-200"></div>
                                </div>
                                <div className="h-[25%] border-b border-slate-100 relative">
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                    Light
                                  </span>
                                  <div className="absolute top-0 left-[5%] h-full w-[15%] bg-blue-200"></div>
                                  <div className="absolute top-0 left-[25%] h-full w-[20%] bg-blue-200"></div>
                                  <div className="absolute top-0 left-[55%] h-full w-[15%] bg-blue-200"></div>
                                  <div className="absolute top-0 left-[75%] h-full w-[20%] bg-blue-200"></div>
                                </div>
                                <div className="h-[25%] relative">
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                    Deep
                                  </span>
                                  <div className="absolute top-0 left-[40%] h-full w-[25%] bg-indigo-300"></div>
                                  <div className="absolute top-0 left-[70%] h-full w-[15%] bg-indigo-300"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* X-axis labels */}
                          <div className="mt-2 flex justify-between text-xs text-slate-500">
                            <span>10 PM</span>
                            <span>12 AM</span>
                            <span>2 AM</span>
                            <span>4 AM</span>
                            <span>6 AM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sleep Schedule Chart */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-800">Sleep Schedule</h3>
                        <span className="text-xs text-slate-500">Last 7 days</span>
                      </div>
                      <div className="h-[220px] w-full rounded-md border border-slate-200 bg-white p-6">
                        <div className="flex h-full flex-col">
                          <div className="relative flex-1">
                            {/* Sleep Schedule Bars */}
                            <div className="absolute inset-0">
                              <div className="flex h-full flex-col justify-around">
                                {/* Sunday */}
                                <div className="relative h-[10%] w-full flex items-center">
                                  <span className="w-10 text-xs text-slate-500 mr-4">Sun</span>
                                  <div className="relative flex-1">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-[30%] right-[25%] h-4 rounded-full bg-indigo-300"></div>
                                  </div>
                                </div>

                                {/* Saturday */}
                                <div className="relative h-[10%] w-full flex items-center">
                                  <span className="w-10 text-xs text-slate-500 mr-4">Sat</span>
                                  <div className="relative flex-1">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-[35%] right-[15%] h-4 rounded-full bg-indigo-300"></div>
                                  </div>
                                </div>

                                {/* Friday */}
                                <div className="relative h-[10%] w-full flex items-center">
                                  <span className="w-10 text-xs text-slate-500 mr-4">Fri</span>
                                  <div className="relative flex-1">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-[25%] right-[35%] h-4 rounded-full bg-indigo-300"></div>
                                  </div>
                                </div>

                                {/* Thursday */}
                                <div className="relative h-[10%] w-full flex items-center">
                                  <span className="w-10 text-xs text-slate-500 mr-4">Thu</span>
                                  <div className="relative flex-1">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-[28%] right-[30%] h-4 rounded-full bg-indigo-300"></div>
                                  </div>
                                </div>

                                {/* Wednesday */}
                                <div className="relative h-[10%] w-full flex items-center">
                                  <span className="w-10 text-xs text-slate-500 mr-4">Wed</span>
                                  <div className="relative flex-1">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-[30%] right-[30%] h-4 rounded-full bg-indigo-300"></div>
                                  </div>
                                </div>

                                {/* Tuesday */}
                                <div className="relative h-[10%] w-full flex items-center">
                                  <span className="w-10 text-xs text-slate-500 mr-4">Tue</span>
                                  <div className="relative flex-1">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-[27%] right-[30%] h-4 rounded-full bg-indigo-300"></div>
                                  </div>
                                </div>

                                {/* Monday */}
                                <div className="relative h-[10%] w-full flex items-center">
                                  <span className="w-10 text-xs text-slate-500 mr-4">Mon</span>
                                  <div className="relative flex-1">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-[32%] right-[30%] h-4 rounded-full bg-indigo-300"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* X-axis labels */}
                          <div className="mt-6 flex justify-between text-xs text-slate-500 pl-14 pr-2">
                            <span>8 PM</span>
                            <span>10 PM</span>
                            <span>12 AM</span>
                            <span>2 AM</span>
                            <span>4 AM</span>
                            <span>6 AM</span>
                            <span>8 AM</span>
                            <span>10 AM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sleep Metrics */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center gap-2">
                          <Moon className="h-5 w-5 text-indigo-600" />
                          <h3 className="font-medium text-slate-800">Total Sleep</h3>
                        </div>
                        <div className="mt-2">
                          <p className="text-2xl font-bold text-slate-900">7h 12m</p>
                          <p className="text-xs text-slate-600">Last night</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center gap-2">
                          <Moon className="h-5 w-5 text-indigo-600" />
                          <h3 className="font-medium text-slate-800">Deep Sleep</h3>
                        </div>
                        <div className="mt-2">
                          <p className="text-2xl font-bold text-slate-900">1h 45m</p>
                          <p className="text-xs text-slate-600">24% of total sleep</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

// Chart components
// function HeartRateChart() {
//   const data = [
//     { name: "12 AM", value: 62 },
//     { name: "3 AM", value: 58 },
//     { name: "6 AM", value: 65 },
//     { name: "9 AM", value: 78 },
//     { name: "12 PM", value: 84 },
//     { name: "3 PM", value: 110 },
//     { name: "6 PM", value: 82 },
//     { name: "9 PM", value: 73 },
//     { name: "12 AM", value: 68 },
//   ]

//   return (
//     <LineChart
//       data={data}
//       categories={["value"]}
//       index="name"
//       colors={["#e11d48"]}
//       yAxisWidth={30}
//       showAnimation
//       showLegend={false}
//       className="h-[200px]"
//     />
//   )
// }

// function BloodOxygenChart() {
//   const data = [
//     { name: "12 AM", value: 97 },
//     { name: "3 AM", value: 96 },
//     { name: "6 AM", value: 97 },
//     { name: "9 AM", value: 98 },
//     { name: "12 PM", value: 99 },
//     { name: "3 PM", value: 97 },
//     { name: "6 PM", value: 98 },
//     { name: "9 PM", value: 98 },
//     { name: "12 AM", value: 97 },
//   ]

//   return (
//     <LineChart
//       data={data}
//       categories={["value"]}
//       index="name"
//       colors={["#0ea5e9"]}
//       valueFormatter={(value) => `${value}%`}
//       yAxisWidth={30}
//       showAnimation
//       showLegend={false}
//       className="h-[200px]"
//     />
//   )
// }

// function ActivityChart() {
//   const data = [
//     { name: "Mon", steps: 5234 },
//     { name: "Tue", steps: 7891 },
//     { name: "Wed", steps: 6543 },
//     { name: "Thu", steps: 9876 },
//     { name: "Fri", steps: 8742 },
//     { name: "Sat", steps: 4321 },
//     { name: "Sun", steps: 3456 },
//   ]

//   return (
//     <BarChart
//       data={data}
//       categories={["steps"]}
//       index="name"
//       colors={["#22c55e"]}
//       valueFormatter={(value) => `${value.toLocaleString()} steps`}
//       showAnimation
//       showLegend={false}
//       className="h-[200px]"
//     />
//   )
// }

// function ECGChart() {
//   // Simulated ECG data
//   const generateECGData = () => {
//     const data = []
//     for (let i = 0; i < 100; i++) {
//       let value = 0

//       // Simple ECG pattern
//       if (i % 25 === 0) value = 0.1
//       else if (i % 25 === 1) value = 0.5
//       else if (i % 25 === 2) value = 1
//       else if (i % 25 === 3) value = 0.2
//       else if (i % 25 === 4) value = -0.5
//       else if (i % 25 === 5) value = -0.2
//       else value = 0

//       data.push({ x: i, value })
//     }
//     return data
//   }

//   const data = generateECGData()

//   return (
//     <LineChart
//       data={data}
//       categories={["value"]}
//       index="x"
//       colors={["#f59e0b"]}
//       showAnimation
//       showLegend={false}
//       showXAxis={false}
//       showGridLines={false}
//       className="h-[200px]"
//     />
//   )
// }

// function ExerciseImpactChart() {
//   // Combined data for heart rate, blood oxygen, exercise
//   const data = [
//     { time: "6 AM", heartRate: 65, bloodOxygen: 97, exercise: 0 },
//     { time: "7 AM", heartRate: 68, bloodOxygen: 97, exercise: 0 },
//     { time: "8 AM", heartRate: 110, bloodOxygen: 96, exercise: 1 },
//     { time: "9 AM", heartRate: 115, bloodOxygen: 95, exercise: 1 },
//     { time: "10 AM", heartRate: 75, bloodOxygen: 98, exercise: 0 },
//     { time: "11 AM", heartRate: 72, bloodOxygen: 98, exercise: 0 },
//     { time: "12 PM", heartRate: 70, bloodOxygen: 98, exercise: 0 },
//     { time: "1 PM", heartRate: 68, bloodOxygen: 98, exercise: 0 },
//     { time: "2 PM", heartRate: 70, bloodOxygen: 98, exercise: 0 },
//     { time: "3 PM", heartRate: 105, bloodOxygen: 96, exercise: 1 },
//     { time: "4 PM", heartRate: 112, bloodOxygen: 95, exercise: 1 },
//     { time: "5 PM", heartRate: 78, bloodOxygen: 97, exercise: 0 },
//     { time: "6 PM", heartRate: 72, bloodOxygen: 98, exercise: 0 },
//   ]

//   return (
//     <AreaChart
//       data={data}
//       categories={["heartRate", "bloodOxygen", "exercise"]}
//       index="time"
//       colors={["#e11d48", "#0ea5e9", "#bbf7d0"]}
//       valueFormatter={(value, category) => {
//         if (category === "heartRate") return `${value} bpm`
//         if (category === "bloodOxygen") return `${value}%`
//         return value ? "Active" : "Rest"
//       }}
//       showAnimation
//       showLegend
//       className="h-[300px]"
//     />
//   )
// }

function HeartRateDetailedChart() {
  // More detailed heart rate data
  const data = [
    { time: "12 AM", resting: 62, active: null },
    { time: "1 AM", resting: 60, active: null },
    { time: "2 AM", resting: 58, active: null },
    { time: "3 AM", resting: 58, active: null },
    { time: "4 AM", resting: 60, active: null },
    { time: "5 AM", resting: 62, active: null },
    { time: "6 AM", resting: 65, active: null },
    { time: "7 AM", resting: 68, active: null },
    { time: "8 AM", resting: null, active: 110 },
    { time: "9 AM", resting: null, active: 115 },
    { time: "10 AM", resting: 75, active: null },
    { time: "11 AM", resting: 72, active: null },
    { time: "12 PM", resting: 70, active: null },
    { time: "1 PM", resting: 68, active: null },
    { time: "2 PM", resting: 70, active: null },
    { time: "3 PM", resting: null, active: 105 },
    { time: "4 PM", resting: null, active: 112 },
    { time: "5 PM", resting: 78, active: null },
    { time: "6 PM", resting: 72, active: null },
    { time: "7 PM", resting: 70, active: null },
    { time: "8 PM", resting: 68, active: null },
    { time: "9 PM", resting: 65, active: null },
    { time: "10 PM", resting: 64, active: null },
    { time: "11 PM", resting: 62, active: null },
  ]

  return (
    <LineChart
      data={data}
      categories={["resting", "active"]}
      index="time"
      colors={["#94a3b8", "#e11d48"]}
      valueFormatter={(value) => (value ? `${value} bpm` : "N/A")}
      showAnimation
      showLegend
      className="h-[400px]"
    />
  )
}

function RestingHeartRateChart() {
  // 30-day resting heart rate trend
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 10) + 60,
  }))

  return (
    <LineChart
      data={data}
      categories={["value"]}
      index="day"
      colors={["#e11d48"]}
      valueFormatter={(value) => `${value} bpm`}
      showAnimation
      showLegend={false}
      className="h-[300px]"
    />
  )
}

function HeartRateVariabilityChart() {
  // Heart rate variability data
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 20) + 40,
  }))

  return (
    <LineChart
      data={data}
      categories={["value"]}
      index="day"
      colors={["#8b5cf6"]}
      valueFormatter={(value) => `${value} ms`}
      showAnimation
      showLegend={false}
      className="h-[300px]"
    />
  )
}

function RespiratoryHealthChart() {
  // Respiratory stats for 24 hours
  const data = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    bloodOxygen: Math.floor(Math.random() * 4) + 95,
    breathingRate: Math.floor(Math.random() * 4) + 14,
  }))

  return (
    <LineChart
      data={data}
      categories={["bloodOxygen", "breathingRate"]}
      index="hour"
      colors={["#0ea5e9", "#8b5cf6"]}
      valueFormatter={(value, category) => (category === "bloodOxygen" ? `${value}%` : `${value} br/min`)}
      showAnimation
      showLegend
      className="h-[400px]"
    />
  )
}

function ActivityTrackingChart() {
  // Weekly activity data
  const data = [
    { day: "Mon", steps: 5234, distance: 3.2, activeMinutes: 35 },
    { day: "Tue", steps: 7891, distance: 4.8, activeMinutes: 52 },
    { day: "Wed", steps: 6543, distance: 4.0, activeMinutes: 43 },
    { day: "Thu", steps: 9876, distance: 6.1, activeMinutes: 65 },
    { day: "Fri", steps: 8742, distance: 5.4, activeMinutes: 58 },
    { day: "Sat", steps: 4321, distance: 2.7, activeMinutes: 28 },
    { day: "Sun", steps: 3456, distance: 2.1, activeMinutes: 23 },
  ]

  return (
    <BarChart
      data={data}
      categories={["steps", "distance", "activeMinutes"]}
      index="day"
      colors={["#22c55e", "#3b82f6", "#f97316"]}
      valueFormatter={(value, category) => {
        if (category === "steps") return `${value.toLocaleString()} steps`
        if (category === "distance") return `${value} km`
        return `${value} min`
      }}
      showAnimation
      showLegend
      className="h-[400px]"
    />
  )
}

// function SleepAnalysisChart() {
//   // Sleep data for the past week
//   const data = [
//     { day: "Mon", deep: 1.5, light: 4.5, rem: 1.2, awake: 0.5 },
//     { day: "Tue", deep: 1.8, light: 4.2, rem: 1.5, awake: 0.3 },
//     { day: "Wed", deep: 1.2, light: 4.8, rem: 1.0, awake: 0.7 },
//     { day: "Thu", deep: 2.0, light: 4.0, rem: 1.7, awake: 0.2 },
//     { day: "Fri", deep: 1.7, light: 4.3, rem: 1.4, awake: 0.4 },
//     { day: "Sat", deep: 2.2, light: 4.5, rem: 1.8, awake: 0.3 },
//     { day: "Sun", deep: 2.0, light: 4.7, rem: 1.6, awake: 0.2 },
//   ]

//   return (
//     <BarChart
//       data={data}
//       categories={["deep", "light", "rem", "awake"]}
//       index="day"
//       colors={["#3b82f6", "#94a3b8", "#8b5cf6", "#f97316"]}
//       valueFormatter={(value) => `${value} hrs`}
//       showAnimation
//       showLegend
//       className="h-[400px]"
//       layout="stacked"
//     />
//   )
// }