// sleep-tab.tsx

/**
 * @file Provides the `HealthInsightsSleepTab` component – displays user sleep insights
 * including 24-hour and 7-day analyses.
 *
 * @remarks
 * This component handles:
 * - Visualizing sleep stage timelines via `SleepTimeline`
 * - Summarizing total and stage-specific sleep metrics via `SleepSummary`
 * - Rendering responsive cards for daily and weekly insights
 *
 * Used within the health insights dashboard to present recent sleep patterns
 * and trends in a structured, easy-to-read layout.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SleepDataPoint } from "./sleep-components/load-sleep-data";
import SleepTimeline from "./sleep-components/sleep-timeline";
import SleepSummary from "./sleep-components/sleep-summary";

export default function SleepTab({ data = [] } : { data?: SleepDataPoint[]}) {
	const chartData: SleepDataPoint[] = data.map(d => ({
		start: new Date(d.start).getTime(),
		end: new Date(d.end).getTime(),
		category: d.category,
	}));

	return (
		<>
		<Card className="border-slate-200 shadow-sm">
			<CardHeader>
			<CardTitle> 24 Hour Sleep Analysis</CardTitle>
			<CardDescription className="text-slate-600">
				Sleep stages and quality over the past 24 hours
			</CardDescription>
			</CardHeader>
			<CardContent>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
				<SleepTimeline data={chartData}/>
				<SleepSummary data={chartData}/>
			</div>
			</CardContent>
		</Card>

		<Card className="border-slate-200 shadow-sm">
			<CardHeader>
			<CardTitle>7 day Sleep Analysis</CardTitle>
			<CardDescription className="text-slate-600">
				Sleep stages and quality over the past 7 days
			</CardDescription>
			</CardHeader>
			<CardContent>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
				<SleepTimeline data={chartData} timeframe={7}/>           
				<SleepSummary data={chartData} timeframe={7}/>
			</div>
			</CardContent>
		</Card>
		</>
	);
}
