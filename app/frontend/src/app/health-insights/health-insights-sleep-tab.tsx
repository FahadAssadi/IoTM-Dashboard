"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SleepDataPoint, loadSleepData } from "./sleep-components/load-sleep-data";
import { useState, useEffect } from "react";
import { SleepTimeline } from "./sleep-components/sleep-timeline";
import { SleepSummary } from "./sleep-components/sleep-summary";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
          <SleepTimeline data={chartData}/>
          <SleepTimeline data={chartData} timeframe={7}/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
          <SleepSummary data={chartData}/>
          <SleepSummary data={chartData} timeframe={7}/>
        </div>
      </CardContent>
    </Card>
  );
}
