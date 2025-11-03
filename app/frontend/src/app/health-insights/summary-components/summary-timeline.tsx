import { HealthSummaryPoint } from "./load-summary-data";
// import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Label, Tooltip, Legend, Line} from "recharts";

export function HealthSummary({data, timeframe = 30}:{data: HealthSummaryPoint[], timeframe?: number}) {
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
	return (
		<DailySummary data={filteredData} />
	)
}

// function GenericChart({ data, datakey, colour="FF4500" }: { data: HealthSummaryPoint[], datakey: string, colour?: string}) {
// 	return (
// 	  <div className="w-full h-92">
// 		<ResponsiveContainer width="100%" height="100%">
// 			<LineChart
// 				data={data}
// 				margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
// 			>
// 				<CartesianGrid strokeDasharray="3 3" />
// 				<XAxis dataKey="start" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
// 				<YAxis >
// 				<Label value="Heart Rate (BPM)" angle={-90} position="insideLeft" />
// 				</YAxis>
// 				<Tooltip/>
// 				<Legend />
// 				<Line type="monotone" name="Average BPM" dataKey={datakey} stroke={colour} />
// 			</LineChart>
// 		</ResponsiveContainer>
// 	  </div>
//   );
// }

export function DailySummary({ data }: { data: HealthSummaryPoint[] }) {
  // helper to format timestamp -> readable date
	const today = Date.now();
	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
		});
	};
  

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      	<div className="flex space-x-4 p-4 snap-x snap-mandatory">
        	{data.map((point, i) => (
				<div
				key={i}
				className="min-w-[280px] bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex-shrink-0 snap-start"
				>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
					{Math.floor(Math.floor((today - point.start)/(1000 * 60 * 60 * 24)))} days ago
					</h3>

					<div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
						<p>
							<span className="font-medium">Start:</span>{" "}
							{point.start ? formatTime(point.start) : "N/A"}
						</p>
						<p>
							<span className="font-medium">End:</span>{" "}
							{point.end ? formatTime(point.end) : "N/A"}
						</p>
						</div>

						<div className="grid grid-cols-2 gap-y-2 text-gray-800 dark:text-gray-200">
						<p className="text-blue-800">
							<span className="font-medium">SpO₂:</span>{" "}
							{point.averageSpO2 != null ? `${point.averageSpO2.toFixed(1)}%` : "—"}
						</p>
						<p className="text-red-800">
							<span className="font-medium">BPM:</span>{" "}
							{point.averageBpm != null ? point.averageBpm.toFixed(0) : "—"}
						</p>
						<p className="text-red-600">
							<span className="font-medium">BP:</span>{" "}
							{point.averageSystolic != null && point.averageDiastolic != null
							? `${point.averageSystolic.toFixed(0)}/${point.averageDiastolic.toFixed(0)}`
							: "—"}
						</p>
						<p className="text-green-800">
							<span className="font-medium">Duration:</span>{" "}
							{point.durationHours != null ? `${point.durationHours.toFixed(1)} h` : "—"}
						</p>
					</div>

				</div>
			))}
      	</div>
    </div>
  );
}
