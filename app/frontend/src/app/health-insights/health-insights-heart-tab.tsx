"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, TooltipProps } from "recharts";
import { loadBloodPressure, BloodPressureDataPoint } from "./backend";
import { useEffect, useState } from "react";

export default function HealthInsightsHeartTab () {
  const [bloodPressureData, setBloodPressureData ] = useState<BloodPressureDataPoint[]>([]);
    useEffect(() => {
      async function fetchData() {
        const data = await loadBloodPressure();
        setBloodPressureData(data);
      }
      fetchData();
    }, []);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Blood Pressure Detailed Analysis</CardTitle>
                    <CardDescription>Comprehensive view of your blood pressure patterns</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <BloodPressureChart bloodPressureData={bloodPressureData}/>
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
                <CardTitle>Blood Pressure Variability</CardTitle>
                <CardDescription>Measure of heart health</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <HeartRateVariabilityChart bloodPressureData={bloodPressureData}/>
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
        <p className="text-black-700">Period Length: {dataPoint.durationHours.toFixed(2)} hours</p>
        <p className="text-red-600">systolic: {dataPoint.averageSystolic}</p>
        <p className="text-blue-600">diastolic: {dataPoint.averageDiastolic}</p>
        <p className="text-black-600">Deviation: {(dataPoint.systolicStandardDeviation + dataPoint.diastolicStandardDeviation) / 2}</p>
        <p className="text-orange-300">RiskLevel: {dataPoint.category}</p>
      </div>
    );
  }
  return null;
}

function BloodPressureChart({ bloodPressureData }: { bloodPressureData: BloodPressureDataPoint[] }) {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={bloodPressureData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="start" 
            tickFormatter={(value) => new Date(value).toLocaleDateString()} />
          <YAxis />
          <Tooltip content={<CustomTooltip />}/>
          <Legend />
          <Line type="monotone" name="Systolic Blood Pressure" dataKey="averageSystolic" stroke="#726cf5" />
          <Line type="monotone" name="Diastolic Blood Pressure" dataKey="averageDiastolic" stroke="#f76e4f" />
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

function HeartRateVariabilityChart({ bloodPressureData }: { bloodPressureData: BloodPressureDataPoint[] }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={bloodPressureData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day"/>
          <YAxis>
            <Label value="Variance" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip />
          <Legend />
          <Line type="monotone" name="Blood Pressure Variance" dataKey="systolicStandardDeviation" stroke="#8b5cf6" />
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