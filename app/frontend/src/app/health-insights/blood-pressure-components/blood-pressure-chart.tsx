// blood-pressure-chart.tsx

/**
 * @file Provides the `BloodPressureChart` component – renders a line chart
 * showing systolic and diastolic blood pressure trends over a specified timeframe.
 *
 * @remarks
 * This component handles:
 * - Filtering blood pressure data points by a given timeframe (default 14 days)
 * - Displaying average systolic/diastolic values and overall deviation
 * - Rendering a custom tooltip with period length, risk category, and deviations
 * - Handling empty datasets with a user-friendly message
 * - Rendering a responsive chart using Recharts
 *
 * Used within the heart health tab  to visualize blood pressure trends
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts";
import { BloodPressureDataPoint } from "./load-blood-pressure-data";

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload; // your data point object
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p>{new Date(label).toLocaleString()}</p>
        <p className="text-black-700">Period Length: {dataPoint.durationHours.toFixed(2)} hours</p>
        <p className="text-red-600">systolic: {dataPoint.averageSystolic}</p>
        <p className="text-blue-600">diastolic: {dataPoint.averageDiastolic}</p>
        <p className="text-black-600">Deviation: {((dataPoint.systolicStandardDeviation + dataPoint.diastolicStandardDeviation) / 2).toFixed(2)}</p>
        <p className="text-orange-300">RiskLevel: {dataPoint.category}</p>
      </div>
    );
  }
  return null;
}

export default function BloodPressureChart({ data, timeframe = 14 }: { data: BloodPressureDataPoint[] , timeframe?: number}) {
    const height = 250;
    const timeframeMs = timeframe * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - timeframeMs);
    const filteredData = data.filter((d) => new Date(d.end) >= cutoffDate);

    if (filteredData.length === 0) {
        return (
        <div
            className="flex items-center justify-center border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
            style={{ width: "100%", height }}
        >
            <p className="text-sm text-center px-4">
            {timeframe <= 1
                ? `No data available for the last ${24 * timeframe} hours.`
                : `No data available for the last ${timeframe} days.`}
            </p>
        </div>
        );
    }

  return (
    <div className="w-full h-full min-h-[240px] sm:min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
            data={filteredData}
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