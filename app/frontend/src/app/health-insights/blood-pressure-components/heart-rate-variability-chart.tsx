// heart-rate-variability-chart.tsx

/**
 * @file Provides the `HeartRateVariabilityChart` component – renders a line chart
 * showing blood pressure variability (heart rate variance) over a specified timeframe.
 *
 * @remarks
 * This component handles:
 * - Filtering blood pressure data points by a given timeframe (default 14 days)
 * - Displaying systolic standard deviation as a measure of heart rate variability
 * - Rendering a responsive chart using Recharts
 * - Handling empty datasets with a user-friendly message
 *
 * Used within the heart health dashboard to visualize trends in blood pressure
 * variability and assess cardiovascular stability over time.
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { BloodPressureDataPoint } from "./load-blood-pressure-data";

export default function HeartRateVariabilityChart({ data, timeframe = 14 }: { data: BloodPressureDataPoint[], timeframe? : number }) {
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
        <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
            data={data}
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