import { scaleTime, scaleBand } from "@visx/scale";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { SpO2DataPoint } from "./load-spo2-data";

export function RespiratoryHealthChart({ data, timeframe = 7 }: {data : SpO2DataPoint[], timeframe? : number }) {
    const height = 250;
    const width = 700;
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeframe * 24 * 60 * 60 * 1000);
    const filteredData = data.filter(
        (d) => new Date(d.end) >= cutoff
    );
    const stages = ["Normal", "Insufficient", "Decreased", "Severe"];
    const color = {
        Normal: "#84cc16",
        Insufficient: "#d9f99d",
        Decreased: "#facc15",
        Severe: "#f87171",
    };
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
    const xScale = scaleTime({
      domain: [Math.min(...filteredData.map((d) => d.start)), Math.max(...filteredData.map((d) => d.end))],
      range: [100, width - 40],
    });
  
    const yScale = scaleBand({
      domain: stages,
      range: [40, height - 40],
      padding: 0.25,
    });
  
    return (
      <div className="w-full max-w-2xl flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4 text-center text-slate-700">
          SpO2 Timeline ({timeframe <= 1 ? `${24 * timeframe}h` : `${timeframe}d`})
        </h3>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Sleep timeline visualization"
          className="w-full h-auto"
        >
          <title>Sleep Timeline showing sleep stages over time</title>
          <AxisBottom top={height - 40} scale={xScale} />
          <AxisLeft left={100} scale={yScale} />
          <Group>
            {filteredData.map((d, i) => (
              <rect
                key={i}
                x={xScale(d.start)}
                y={yScale(d.category)}
                width={Math.max(1, xScale(d.end) - xScale(d.start))}
                height={yScale.bandwidth()}
                fill={color[d.category]}
                rx={4}
              />
            ))}
          </Group>
        </svg>
      </div>
    );
}

export function RespiratoryHealthSummary({ data, timeframe = 7 }: {data : SpO2DataPoint[], timeframe? : number }) {
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

    // ✅ Step 2: Compute total time in each stage (in hours)
    const stageTotals: Record<string, number> = { Normal: 0, Insufficient: 0, Decreased: 0, Severe: 0 };

    filteredData.forEach((d) => {
        const start = new Date(d.start).getTime();
        const end = new Date(d.end).getTime();
        const durationHrs = (end - start) / (1000 * 60 * 60);
        stageTotals[d.category] += durationHrs;
    });

    // ✅ Compute total tracked time across all categories
    const totalTrackedHours = Object.values(stageTotals).reduce((sum, val) => sum + val, 0);

    // ✅ Step 4: Format and render
    const stages = ["Normal", "Insufficient", "Decreased", "Severe"] as const;
    const color = {
        Normal: "#84cc16",
        Insufficient: "#d9f99d",
        Decreased: "#facc15",
        Severe: "#f87171",
    };

    return (
        <div className="w-full max-w-2xl mx-auto border border-slate-200 rounded-lg p-4 sm:p-6 bg-white shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-center">
                SpO2 Summary (Last{" "}
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
                Total Tracked Time: {totalTrackedHours.toFixed(2)} hrs
            </div>
        </div>
    );
}