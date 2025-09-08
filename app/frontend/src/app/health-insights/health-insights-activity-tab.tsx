import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { BarChart } from "@/components/ui/chart"

export default function HealthInsightsActivityTab () {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Activity Tracking</CardTitle>
                <CardDescription>Steps, distance, and active minutes</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ActivityTrackingChart />
              </CardContent>
            </Card>
          </div>
    )
}

function ActivityTrackingChart() {
  // Weekly activity data
  const data = [
    { day: "Mon", steps: 5234, distance: 3.2, activeMinutes: 35 },
    { day: "Tue", steps: 7891, distance: 4.8, activeMinutes: 52 },
    { day: "Wed", steps: 6543, distance: 4.0, activeMinutes: 43 },
    { day: "Thu", steps: 9876, distance: 6.1, activeMinutes: 65 },
    { day: "Fri", steps: 8742, distance: 5.4, activeMinutes: 58 },
    { day: "Sat", steps: 4321, distance: 2.7, activeMinutes: 28 },
    { day: "Sun", steps: 3456, distance: 2.1, activeMinutes: 23 },
  ]

  return (
    <BarChart
      data={data}
      categories={["steps", "distance", "activeMinutes"]}
      index="day"
      colors={["#22c55e", "#3b82f6", "#f97316"]}
      valueFormatter={(value, category) => {
        if (category === "steps") return `${value.toLocaleString()} steps`
        if (category === "distance") return `${value} km`
        return `${value} min`
      }}
      showAnimation
      showLegend
      className="h-[400px]"
    />
  )
}

// function ActivityChart() {
//   const data = [
//     { name: "Mon", steps: 5234 },
//     { name: "Tue", steps: 7891 },
//     { name: "Wed", steps: 6543 },
//     { name: "Thu", steps: 9876 },
//     { name: "Fri", steps: 8742 },
//     { name: "Sat", steps: 4321 },
//     { name: "Sun", steps: 3456 },
//   ]

//   return (
//     <BarChart
//       data={data}
//       categories={["steps"]}
//       index="name"
//       colors={["#22c55e"]}
//       valueFormatter={(value) => `${value.toLocaleString()} steps`}
//       showAnimation
//       showLegend={false}
//       className="h-[200px]"
//     />
//   )
// }

// function ExerciseImpactChart() {
//   // Combined data for heart rate, blood oxygen, exercise
//   const data = [
//     { time: "6 AM", heartRate: 65, bloodOxygen: 97, exercise: 0 },
//     { time: "7 AM", heartRate: 68, bloodOxygen: 97, exercise: 0 },
//     { time: "8 AM", heartRate: 110, bloodOxygen: 96, exercise: 1 },
//     { time: "9 AM", heartRate: 115, bloodOxygen: 95, exercise: 1 },
//     { time: "10 AM", heartRate: 75, bloodOxygen: 98, exercise: 0 },
//     { time: "11 AM", heartRate: 72, bloodOxygen: 98, exercise: 0 },
//     { time: "12 PM", heartRate: 70, bloodOxygen: 98, exercise: 0 },
//     { time: "1 PM", heartRate: 68, bloodOxygen: 98, exercise: 0 },
//     { time: "2 PM", heartRate: 70, bloodOxygen: 98, exercise: 0 },
//     { time: "3 PM", heartRate: 105, bloodOxygen: 96, exercise: 1 },
//     { time: "4 PM", heartRate: 112, bloodOxygen: 95, exercise: 1 },
//     { time: "5 PM", heartRate: 78, bloodOxygen: 97, exercise: 0 },
//     { time: "6 PM", heartRate: 72, bloodOxygen: 98, exercise: 0 },
//   ]

//   return (
//     <AreaChart
//       data={data}
//       categories={["heartRate", "bloodOxygen", "exercise"]}
//       index="time"
//       colors={["#e11d48", "#0ea5e9", "#bbf7d0"]}
//       valueFormatter={(value, category) => {
//         if (category === "heartRate") return `${value} bpm`
//         if (category === "bloodOxygen") return `${value}%`
//         return value ? "Active" : "Rest"
//       }}
//       showAnimation
//       showLegend
//       className="h-[300px]"
//     />
//   )
// }