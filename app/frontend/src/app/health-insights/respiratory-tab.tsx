// repiratory-tab.tsx

/**
 * @file Provides the `RespiratoryTab` component – displays user respiratory health insights,
 * including blood oxygen levels (SpO₂) and breathing rate.
 *
 * @remarks
 * This component handles:
 * - Visualizing respiratory metrics over time via `RespiratoryHealthChart`
 * - Summarizing average SpO₂ levels and variability via `RespiratoryHealthSummary`
 * - Rendering responsive card layouts for detailed and summary views
 *
 * Used within the health insights dashboard to present recent respiratory data
 * and trends in a clear, interactive format.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import RespiratoryHealthChart from "./respiratory-components/respiratory-health-chart";
import RespiratoryHealthSummary from "./respiratory-components/respiratory-health-summary";
import { SpO2DataPoint } from "./respiratory-components/load-spo2-data";

export default function RespiratoryTab ({ data = [] } : { data?: SpO2DataPoint[] }) {
    const chartData: SpO2DataPoint[] = data.map(d => ({
        start: new Date(d.start).getTime(),
        end: new Date(d.end).getTime(),
        category: d.category,
        averageSpO2: d.averageSpO2,
        standardDeviation: d.standardDeviation,
        points: d.points,
        durationHours: d.durationHours
    }));
    

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Respiratory Health</CardTitle>
                    <CardDescription>Blood oxygen and breathing rate</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[240px]">
                        <RespiratoryHealthChart data={chartData}/>
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Respiratory Health Summary</CardTitle>
                    <CardDescription>Blood oxygen and breathing rate</CardDescription>
                </CardHeader>
                <CardContent>
                    <RespiratoryHealthSummary data={chartData}/>
                </CardContent>
            </Card>
        </div>
    )
}