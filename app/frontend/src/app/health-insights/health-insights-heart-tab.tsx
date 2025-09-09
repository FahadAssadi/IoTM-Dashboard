"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";

type BPMDataPoint = {
  start: string;                // ISO datetime string
  end: string;                  // ISO datetime string
  points: number;
  averageBpm: number;
  standardDeviation: number;
  durationHours: number;
};

export default function HealthInsightsHeartTab () {

  const [bpmData, setBpmData ] = useState<BPMDataPoint[]>([]);

  useEffect(() => {
    async function loadBPM() {
      const { data: { user }, } = await supabase.auth.getUser();
      if (!user){
        console.error("Unable to retrieve userId");
        return;
      }
      try {
        const response = await fetch(`http://localhost:5225/api/HealthConnect/${user.id}`);
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
                    <CardTitle>Heart Rate Detailed Analysis</CardTitle>
                    <CardDescription>Comprehensive view of your heart rate patterns</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <HeartRateDetailedChart bpmData={bpmData}/>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resting Heart Rate</CardTitle>
                <CardDescription>30-day trend</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <RestingHeartRateChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heart Rate Variability</CardTitle>
                <CardDescription>Measure of heart health</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <HeartRateVariabilityChart />
              </CardContent>
            </Card>
          </div>

    )
}


function HeartRateDetailedChart({ bpmData }: { bpmData: BPMDataPoint[] }) {
  // const testData = [
  //   {
  //     start: "2025-09-07T18:47:06Z", end: "2025-09-07T18:47:06Z",
  //     points: 1, averageBpm: 110,
  //     standardDeviation: 1, durationHours: 1
  //   },
  //   {
  //     start: "2025-09-06T18:47:06Z", end: "2025-09-07T18:47:06Z",
  //     points: 1, averageBpm: 120,
  //     standardDeviation: 1, durationHours: 1
  //   },
  //   {
  //     start: "2025-09-05T18:47:06Z", end: "2025-09-07T18:47:06Z",
  //     points: 1, averageBpm: 100,
  //     standardDeviation: 1, durationHours: 1
  //   },
  // ];
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={bpmData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="start" 
            tickFormatter={(value) => new Date(value).toLocaleDateString()} 
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="averageBpm" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RestingHeartRateChart() {
  // 30-day resting heart rate trend
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 10) + 60,
  }))

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#e11d48" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function HeartRateVariabilityChart() {
  // Heart rate variability data
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 20) + 40,
  }))

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day">
            <Label value="X Axis Label" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8b5cf6" />
        </LineChart>
      </ResponsiveContainer>
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