import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { RespiratoryHealthChart } from "./respiratory-components/respiratory-health-chart";
import { RespiratoryHealthSummary } from "./respiratory-components/respiratory-health-summary";
import { SpO2DataPoint } from "./respiratory-components/load-spo2-data";

export default function HealthInsightsRespiratoryTab ({ data = [] } : { data?: SpO2DataPoint[] }) {
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
                    <RespiratoryHealthChart data={chartData}/>
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