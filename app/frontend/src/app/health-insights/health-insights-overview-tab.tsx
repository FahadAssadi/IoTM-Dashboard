import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function HealthInsightsOverviewTab () {
    return (
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
                      <div className="min-h-[200px] sm:min-h-[220px] md:min-h-[240px] w-full rounded-md border border-slate-200 bg-white p-4">
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
                    <div className="min-h-[200px] sm:min-h-[220px] md:min-h-[240px] w-full rounded-md border border-slate-200 bg-white p-4">
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
                    <div className="min-h-[200px] sm:min-h-[220px] md:min-h-[240px] w-full rounded-md border border-slate-200 bg-white p-4">
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
                    <div className="min-h-[200px] sm:min-h-[220px] md:min-h-[240px] w-full rounded-md border border-slate-200 bg-white p-4">
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
    )
}