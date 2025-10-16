"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SleepDataPoint, loadSleepData } from "./sleep-components/load-sleep-data";
import { useState, useEffect } from "react";
import { SleepTimeline } from "./sleep-components/sleep-timeline";

export default function HealthInsightsSleepTab() {
  const [sleepData, setSleepData ] = useState<SleepDataPoint[]>([]);
      useEffect(() => {
        async function fetchData() {
          const data = await loadSleepData();
          setSleepData(data);
        }
        fetchData();
      }, []);
  
  const chartData: SleepDataPoint[] = sleepData.map(d => ({
    start: new Date(d.start).getTime(),
    end: new Date(d.end).getTime(),
    category: d.category,
  }));

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Sleep Analysis</CardTitle>
        <CardDescription className="text-slate-600">
          Sleep stages and quality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 flex gap-6">
          <SleepTimeline data={chartData}/>
          <SleepTimeline data={chartData} timeframe={7}/>
        </div>
      </CardContent>
    </Card>
  );
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