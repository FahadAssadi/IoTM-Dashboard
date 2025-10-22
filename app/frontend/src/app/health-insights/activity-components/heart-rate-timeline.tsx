import { scaleTime, scaleBand } from "@visx/scale";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { BPMDataPoint } from "./load-bpm-data";

export function HeartRateTimeline({ data, timeframe = 7 }: { data: BPMDataPoint[]; timeframe?: number }) {
	const width = 700;
	const height = 250;

	const chartCategories = [
		"220+",
		"200 - 220",
		"180 - 200",
		"160 - 180",
		"140 - 160",
		"120 - 140",
		"100 - 120",
		"80 - 100",
		"60 - 80",
		"0 - 60",
	]
	const color = {
		"220+": "#93c5fd",
		"0 - 60": "#93c5fd",
		"60 - 80": "#93c5fd",
		"80 - 100": "#93c5fd",
		"100 - 120": "#93c5fd",
		"120 - 140": "#93c5fd",
		"140 - 160": "#93c5fd",
		"160 - 180": "#93c5fd",
		"180 - 200": "#93c5fd",
		"200 - 220": "#93c5fd",
	};

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

	const xScale = scaleTime({
		domain: [Math.min(...filteredData.map((d) => d.start)), Math.max(...filteredData.map((d) => d.end))],
		range: [100, width - 40],
	});

	const yScale = scaleBand({
		domain: chartCategories,
		range: [40, height - 40],
		padding: 0.25,
	});

  	console.log("Filtered data:", filteredData);
	console.log("xScale domain:", [
	Math.min(...filteredData.map(d => d.start)),
	Math.max(...filteredData.map(d => d.end)),
	]);
	console.log("yScale domain:", yScale.domain());


	return (
		<div className="w-full max-w-2xl flex flex-col items-center">
		<h3 className="text-lg font-semibold mb-4 text-center text-slate-700">
			BPM Timeline ({timeframe <= 1 ? `${24 * timeframe}h` : `${timeframe}d`})
		</h3>
		<svg
			viewBox={`0 0 ${width} ${height}`}
			preserveAspectRatio="xMidYMid meet"
			role="img"
			aria-label="Sleep timeline visualization"
			className="w-full h-auto"
		>
			<title>BPM Timeline showing BPM stages over time</title>
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