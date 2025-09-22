import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { TooltipProps } from "recharts";

type BPMDataPoint = {
  start: string;                // ISO datetime string
  end: string;                  // ISO datetime string
  points: number;
  averageBpm: number;
  standardDeviation: number;
  durationHours: number;
};

export default function HealthInsightsActivityTab () {

    const [bpmData, setBpmData ] = useState<BPMDataPoint[]>([]);
    useEffect(() => {
      async function loadBPM() {
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user){
          console.error("Unable to retrieve userId");
          return;
        }
        try {
          const response = await fetch(`http://localhost:5225/api/HealthConnect/bpm/${user.id}`);
          if (response.status === 404){
            console.warn("No BPM data found");
            setBpmData([]); // keep empty chart
            return;
          }
          const BPM_json = await response.json();
          console.log("Fetched BPM data:", BPM_json);
          setBpmData(BPM_json)
        } catch (err) {
          console.error("Error fetching BPM data:", err);
        }
      }
      // Function calls
      loadBPM()
    }, [])

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Activity Tracking</CardTitle>
                <CardDescription>Steps, distance, and active minutes</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <HeartRateDetailedChart bpmData={bpmData}/>
              </CardContent>
            </Card>
          </div>
    )
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload; // your data point object
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p>{new Date(label).toLocaleString()}</p>
        <p className="text-purple-700">Period Length: {dataPoint.durationHours.toFixed(2)} hours</p>
        <p className="text-purple-600">Average BPM: {dataPoint.averageBpm}</p>
        <p className="text-purple-400">Deviation: {dataPoint.standardDeviation}</p>
        <p className="text-purple-300">Activity Level: Undefined</p>
      </div>
    );
  }
  return null;
}

function HeartRateDetailedChart({ bpmData }: { bpmData: BPMDataPoint[] }) {
  const sortedData = [...bpmData].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return (
    <div className="w-full h-92">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sortedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="start" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
          <YAxis >
            <Label value="Heart Rate (BPM)" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip content={<CustomTooltip />}/>
          <Legend />
          <Line type="monotone" name="Average Heart Rate BPM" dataKey="averageBpm" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// function ActivityTrackingChart() {
//   // Weekly activity data
//   const data = [
//     { day: "Mon", steps: 5234, distance: 3.2, activeMinutes: 35 },
//     { day: "Tue", steps: 7891, distance: 4.8, activeMinutes: 52 },
//     { day: "Wed", steps: 6543, distance: 4.0, activeMinutes: 43 },
//     { day: "Thu", steps: 9876, distance: 6.1, activeMinutes: 65 },
//     { day: "Fri", steps: 8742, distance: 5.4, activeMinutes: 58 },
//     { day: "Sat", steps: 4321, distance: 2.7, activeMinutes: 28 },
//     { day: "Sun", steps: 3456, distance: 2.1, activeMinutes: 23 },
//   ]

//   return (
//     <BarChart
//       data={data}
//       categories={["steps", "distance", "activeMinutes"]}
//       index="day"
//       colors={["#22c55e", "#3b82f6", "#f97316"]}
//       valueFormatter={(value, category) => {
//         if (category === "steps") return `${value.toLocaleString()} steps`
//         if (category === "distance") return `${value} km`
//         return `${value} min`
//       }}
//       showAnimation
//       showLegend
//       className="h-[400px]"
//     />
//   )
// }

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