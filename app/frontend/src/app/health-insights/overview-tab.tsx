// overview-tab.tsx

/**
 * @file Provides the `OverviewTab` component – displays a daily summary of key health metrics
 * including blood pressure, heart rate, and blood oxygen levels.
 *
 * @remarks
 * This component handles:
 * - Aggregating daily averages from multiple health data sources
 * - Visualizing trends via the `HealthSummary` timeline component
 * - Rendering a responsive card summarizing overall health status
 *
 * Used within the health insights dashboard to provide an at-a-glance overview
 * of recent health metrics and general wellbeing trends.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { HealthSummaryPoint } from "./overview-components/load-summary-data"
import HealthSummary from "./overview-components/summary-timeline"

export default function OverviewTab ({ data = [] } : { data?: HealthSummaryPoint[] }) {
    const chartData: HealthSummaryPoint[] = data.map(d => ({
            start: new Date(d.start).getTime(),
            end: new Date(d.end).getTime(),
            averageSpO2: d.averageSpO2,
            averageBpm: d.averageBpm,
            averageDiastolic: d.averageDiastolic,
            averageSystolic: d.averageSystolic,
            durationHours: d.durationHours,
        }));
    
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="w-full overflow-hidden md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-slate-800">Health Metrics Overview</CardTitle>
                    <CardDescription className="text-slate-600">
                        Summary of your key health metrics per day
                    </CardDescription>
                </CardHeader>
                <CardContent >
                    <HealthSummary data={chartData} />
                </CardContent>
            </Card>
        </div>
    )
}