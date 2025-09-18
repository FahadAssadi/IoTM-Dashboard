import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { TooltipProps } from "recharts";
import { toast } from "react-toastify";

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
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!user){
          console.error("Unable to retrieve userId");
          return;
        }
        try {
          const response = await fetch(`http://localhost:5225/api/HealthConnect/bpm/${user.id}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          if (response.status === 404){
            console.warn("No BPM data found");
            setBpmData([]); // keep empty chart
            return;
          }
          const BPM_json = await response.json();
          console.log("Fetched BPM data:", BPM_json);
          setBpmData(BPM_json)
        } catch (err) {
          toast.error("Error: Could not load user data")
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