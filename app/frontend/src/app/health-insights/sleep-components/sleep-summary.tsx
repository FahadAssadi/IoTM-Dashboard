// sleep-summary.tsx

/**
 * @file Provides the `SleepSummary` component – summarizes the user’s sleep data over a specified timeframe.
 *
 * @remarks
 * This component handles:
 * - Filtering sleep data points to the specified timeframe (default 1 day)
 * - Calculating total duration spent in each sleep stage ("AWAKE", "REM", "LIGHT", "DEEP")
 * - Computing total sleep time (excluding "AWAKE")
 * - Rendering a color-coded summary list of stages with corresponding durations
 * - Displaying a placeholder message if no data is available
 *
 * Used within sleep health sections of the dashboard to give users a clear overview of their sleep patterns and quality.
 */

import React from "react";
import { SleepDataPoint } from "./load-sleep-data";

export default function SleepSummary({data, timeframe=1}: { data: SleepDataPoint[], timeframe?: number }) {
    // ✅ Step 1: Filter data within timeframe
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeframe * 24 * 60 * 60 * 1000);

    const filteredData = data.filter(
        (d) => new Date(d.end) >= cutoff
    );

    if (filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-md w-full h-[250px]">
                <p className="text-slate-500 text-sm sm:text-base">
                    No data available for the last {timeframe <= 1 ? `${24 * timeframe} hours` : `${timeframe} days`}.
                </p>
            </div>
        );
    }

    // ✅ Step 2: Compute total time in each sleep stage (in hours)
    const stageTotals: Record<string, number> = { AWAKE: 0, REM: 0, LIGHT: 0, DEEP: 0 };

    filteredData.forEach((d) => {
        const start = new Date(d.start).getTime();
        const end = new Date(d.end).getTime();
        const durationHrs = (end - start) / (1000 * 60 * 60);
        stageTotals[d.category] += durationHrs;
    });

    // ✅ Step 3: Compute total sleep (exclude AWAKE)
    const totalSleepHours = stageTotals.REM + stageTotals.LIGHT + stageTotals.DEEP;

    // ✅ Step 4: Format and render
    const stages = ["DEEP", "LIGHT", "REM", "AWAKE"] as const;
    const color = {
        AWAKE: "#fca5a5",
        REM: "#d8b4fe",
        LIGHT: "#bfdbfe",
        DEEP: "#93c5fd",
    };

    return (
        <div className="w-full max-w-2xl mx-auto border border-slate-200 rounded-lg p-4 sm:p-6 bg-white shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-center">
                Sleep Summary (Last{" "}
                {timeframe <= 1 ? `${24 * timeframe} hours` : `${timeframe} days`})
            </h3>

            <div className="flex flex-col gap-2 text-sm sm:text-base">
                {stages.map((stage) => (
                <div
                    key={stage}
                    className="flex justify-between items-center border-b border-slate-100 py-1"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm" style={{ backgroundColor: color[stage] }} />
                        <span className="font-medium text-slate-700">{stage}</span>
                    </div>
                    <span className="text-slate-600">
                    {stageTotals[stage].toFixed(2)} hrs
                    </span>
                </div>
                ))}
            </div>

            <div className="mt-4 text-center font-semibold text-slate-800">
                Total Sleep Time: {totalSleepHours.toFixed(2)} hrs
            </div>
        </div>
    );
}