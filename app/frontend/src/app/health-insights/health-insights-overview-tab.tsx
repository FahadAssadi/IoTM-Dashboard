import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { HealthSummaryPoint } from "./summary-components/load-summary-data"
import { HealthSummary } from "./summary-components/summary-timeline"

export default function HealthInsightsOverviewTab ({ data = [] } : { data?: HealthSummaryPoint[] }) {
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