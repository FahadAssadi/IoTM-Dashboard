import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { useEffect, useState } from "react"
import { SpO2DataPoint, loadSpO2} from "./backend"

export default function HealthInsightsRespiratoryTab () {
  const [spO2Data, setSpO2Data ] = useState<SpO2DataPoint[]>([]);
      useEffect(() => {
        async function fetchData() {
          const data = await loadSpO2();
          setSpO2Data(data);
        }
        fetchData();
      }, []);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Respiratory Health</CardTitle>
                    <CardDescription>Blood oxygen and breathing rate</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <RespiratoryHealthChart spO2Data={spO2Data}/>
                </CardContent>
            </Card>
        </div>
    )
}

function RespiratoryHealthChart({ spO2Data }: {spO2Data : SpO2DataPoint[] }) {
  // Respiratory stats for 24 hours
  // const sortedData = Array.from({ length: 24 }, (_, i) => ({
  //   hour: `${i}:00`,
  //   bloodOxygen: Math.floor(Math.random() * 4) + 95,
  //   breathingRate: Math.floor(Math.random() * 4) + 14,
  // }))
  const sortedData = [...spO2Data].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return (
    <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sortedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="start" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis domain={[50, 100]}
              >
                <Label value="Oxygen Percentage" angle={-90} position="insideLeft" />
              </YAxis>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="averageSpO2" stroke="#0ea5e9" />
              {/* <Line type="monotone" dataKey="breathingRate" stroke="#8b5cf6" /> */}
            </LineChart>
          </ResponsiveContainer>
        </div>
  )
}