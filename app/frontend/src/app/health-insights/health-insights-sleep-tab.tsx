import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { Moon } from "lucide-react"

export default function HealthInsightsSleepTab () {
    return (
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