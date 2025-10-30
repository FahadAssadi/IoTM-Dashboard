"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { BloodPressureDataPoint } from "./blood-pressure-components/load-blood-pressure-data"
import { BloodPressureChart } from "./blood-pressure-components/blood-pressure-chart";
import { HeartRateVariabilityChart } from "./blood-pressure-components/heart-rate-variability-chart";
import { BloodPressureTimeline } from "./blood-pressure-components/blood-pressure-timeline";

export default function HealthInsightsHeartTab ({ data = [] } : { data? : BloodPressureDataPoint[] }) {

	const chartData: BloodPressureDataPoint[] = data.map(d => ({
        start: new Date(d.start).getTime(),
        end: new Date(d.end).getTime(),
        category: d.category,
		averageSystolic: d.averageSystolic,
		averageDiastolic: d.averageDiastolic,
		diastolicStandardDeviation: d.diastolicStandardDeviation,
		systolicStandardDeviation: d.systolicStandardDeviation,
        points: d.points,
        durationHours: d.durationHours
    }));

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Blood Pressure Detailed Analysis</CardTitle>
                    <CardDescription>Comprehensive view of your blood pressure patterns</CardDescription>
                </CardHeader>
                <CardContent className="md:col-span-2">
                  	<BloodPressureChart data={data}/>
                </CardContent>
            </Card>

            <Card>
				<CardHeader>
					<CardTitle>Blood Pressure Category Timeline</CardTitle>
					<CardDescription>14-day trend</CardDescription>
				</CardHeader>
				<CardContent className="md:col-span-1">
					<BloodPressureTimeline data={chartData} timeframe={14}/>
				</CardContent>
            </Card>

            <Card>
				<CardHeader>
					<CardTitle>Blood Pressure Variability</CardTitle>
					<CardDescription>Measure of heart health</CardDescription>
				</CardHeader>
				<CardContent className="md:col-span-1">
					<HeartRateVariabilityChart data={data}/>
				</CardContent>
            </Card>
          </div>
    )
}



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