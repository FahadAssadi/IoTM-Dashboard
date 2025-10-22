import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { LineChart } from "@/components/ui/chart"

export default function HealthInsightsHeartTab () {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Heart Rate Detailed Analysis</CardTitle>
                    <CardDescription>Comprehensive view of your heart rate patterns</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[220px] sm:min-h-[280px] md:min-h-[360px]">
                    <HeartRateDetailedChart />
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resting Heart Rate</CardTitle>
                <CardDescription>30-day trend</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px] sm:min-h-[220px] md:min-h-[260px]">
                <RestingHeartRateChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heart Rate Variability</CardTitle>
                <CardDescription>Measure of heart health</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px] sm:min-h-[220px] md:min-h-[260px]">
                <HeartRateVariabilityChart />
              </CardContent>
            </Card>
          </div>

    )
}

function HeartRateDetailedChart() {
  // More detailed heart rate data
  const data = [
    { time: "12 AM", resting: 62, active: null },
    { time: "1 AM", resting: 60, active: null },
    { time: "2 AM", resting: 58, active: null },
    { time: "3 AM", resting: 58, active: null },
    { time: "4 AM", resting: 60, active: null },
    { time: "5 AM", resting: 62, active: null },
    { time: "6 AM", resting: 65, active: null },
    { time: "7 AM", resting: 68, active: null },
    { time: "8 AM", resting: null, active: 110 },
    { time: "9 AM", resting: null, active: 115 },
    { time: "10 AM", resting: 75, active: null },
    { time: "11 AM", resting: 72, active: null },
    { time: "12 PM", resting: 70, active: null },
    { time: "1 PM", resting: 68, active: null },
    { time: "2 PM", resting: 70, active: null },
    { time: "3 PM", resting: null, active: 105 },
    { time: "4 PM", resting: null, active: 112 },
    { time: "5 PM", resting: 78, active: null },
    { time: "6 PM", resting: 72, active: null },
    { time: "7 PM", resting: 70, active: null },
    { time: "8 PM", resting: 68, active: null },
    { time: "9 PM", resting: 65, active: null },
    { time: "10 PM", resting: 64, active: null },
    { time: "11 PM", resting: 62, active: null },
  ]

  return (
    <LineChart
      data={data}
      categories={["resting", "active"]}
      index="time"
      colors={["#94a3b8", "#e11d48"]}
      valueFormatter={(value) => (value ? `${value} bpm` : "N/A")}
      showAnimation
      showLegend
      className="h-full"
    />
  )
}

function RestingHeartRateChart() {
  // 30-day resting heart rate trend
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 10) + 60,
  }))

  return (
    <LineChart
      data={data}
      categories={["value"]}
      index="day"
      colors={["#e11d48"]}
      valueFormatter={(value) => `${value} bpm`}
      showAnimation
      showLegend={false}
      className="h-full"
    />
  )
}

function HeartRateVariabilityChart() {
  // Heart rate variability data
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 20) + 40,
  }))

  return (
    <LineChart
      data={data}
      categories={["value"]}
      index="day"
      colors={["#8b5cf6"]}
      valueFormatter={(value) => `${value} ms`}
      showAnimation
      showLegend={false}
      className="h-full"
    />
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