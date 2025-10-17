import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { BPMDataPoint, BPMCategory } from "./activity-components/load-bpm-data";
import { HeartRateDetailedChart } from "./activity-components/heart-rate-chart";
import { HeartRateTimeline } from "./activity-components/heart-rate-timeline";

export default function HealthInsightsActivityTab ({ data = [] }: { data?: BPMDataPoint[] }) {
	const chartCategorisor = (bpmValue : number): BPMCategory => {
		if (bpmValue < 60){
			return "0 - 60"
		} else if (bpmValue < 80){
			return "60 - 80"
		} else if (bpmValue < 100){
			return "80 - 100"
		} else if (bpmValue < 120){
			return "100 - 120"
		} else if (bpmValue < 140){
			return "120 - 140"
		} else if (bpmValue < 160){
			return "140 - 160"
		} else if (bpmValue < 180){
			return "160 - 180"
		} else if (bpmValue < 200){
			return "180 - 200"
		} else if (bpmValue < 220){
			return "200 - 220"
		} else {
			return "220+"
		}
	}
    
    const chartData: BPMDataPoint[] = data.map(d => ({
        start: new Date(d.start).getTime(),
        end: new Date(d.end).getTime(),
        category: chartCategorisor(d.averageBpm),
        averageBpm: d.averageBpm,
        standardDeviation: d.standardDeviation,
        points: d.points,
        durationHours: d.durationHours
    }));

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
				<CardHeader>
					<CardTitle>Average Heart Rate</CardTitle>
					<CardDescription>Heart rate information</CardDescription>
				</CardHeader>
				<CardContent className="md:col-span-1">
					<HeartRateDetailedChart data={chartData}/>
				</CardContent>
            </Card>

            <Card>
				<CardHeader>
					<CardTitle>Activity Tracking</CardTitle>
					<CardDescription>Steps, distance, and active minutes</CardDescription>
				</CardHeader>
				<CardContent className="md:col-span-1">
					<HeartRateTimeline data={chartData}/>
				</CardContent>
            </Card>
          </div>
    )
}
