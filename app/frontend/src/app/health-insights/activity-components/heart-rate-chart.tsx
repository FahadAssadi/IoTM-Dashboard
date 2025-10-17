import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { TooltipProps } from "recharts";
import { BPMDataPoint } from "./load-bpm-data";

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload; // your data point object
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p>{new Date(label).toLocaleString()}</p>
        <p className="text-purple-700">Period Length: {dataPoint.durationHours.toFixed(2)} hours</p>
        <p className="text-purple-600">Average BPM: {dataPoint.averageBpm}</p>
        <p className="text-purple-400">Deviation: {dataPoint.standardDeviation}</p>
        <p className="text-purple-300">Activity Level: {dataPoint.category}</p>
      </div>
    );
  }
  return null;
}

export function HeartRateDetailedChart({ bpmData }: { bpmData: BPMDataPoint[] }) {
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