"use client"

import { useEffect, useState } from "react"
import { Download, Heart, Trees as Lungs, Share2, Footprints as Shoe, ThermometerSnowflake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { VitalCard } from "./general-components/vital-card"

import HealthInsightsOverviewTab from "./health-insights-overview-tab"
import HealthInsightsHeartTab from "./health-insights-heart-tab"
import HealthInsightsRespiratoryTab from "./health-insights-respiratory-tab"
import HealthInsightsActivityTab from "./health-insights-activity-tab"
import HealthInsightsSleepTab from "./health-insights-sleep-tab"

import { loadRecentSummary, RecentSummary } from "./backend"
import { loadBPM, BPMDataPoint } from "./activity-components/load-bpm-data"
import { loadSpO2, SpO2DataPoint } from "./respiratory-components/load-spo2-data"
import { loadSleepData, SleepDataPoint } from "./sleep-components/load-sleep-data"
import { loadBloodPressure, BloodPressureDataPoint } from "./blood-pressure-components/load-blood-pressure-data"
import { AiHealthInsights } from "./general-components/ai-health-insights"
import { HealthSummaryPoint, loadSummaryData } from "./summary-components/load-summary-data"

// Renamed the component and main heading to "Health Insights"
export default function HealthInsightsPage() {

	const [timeRange, setTimeRange] = useState("24h")
	const [bpmData, setBpmData] = useState<BPMDataPoint[]>([]);
	const [spO2Data, setSpO2Data] = useState<SpO2DataPoint[]>([]);
	const [sleepData, setSleepData ] = useState<SleepDataPoint[]>([]);
	const [bloodPressureData, setBloodPressureData ] = useState<BloodPressureDataPoint[]>([]);
	const [summaryData, setSummaryData] = useState<HealthSummaryPoint[]>([]);

	const [recentSummary, setRecentSummary ] = useState<RecentSummary>({
		bpm: "loading",
		spO2: "loading",
		systolicBloodPressure: "loading",
		diastolicBloodPressure: "loading"
	});

	useEffect(() => {
		async function fetchData() {
			const recentSummaryData = await loadRecentSummary();
			setRecentSummary(recentSummaryData);
			const bpmData = await loadBPM();
			setBpmData(bpmData);
			const spO2Data = await loadSpO2();
			setSpO2Data(spO2Data);
			const sleepData = await loadSleepData();
          	setSleepData(sleepData);
			const bloodPressureData = await loadBloodPressure();
			setBloodPressureData(bloodPressureData);
			const summaryData = await loadSummaryData();
			setSummaryData(summaryData);
		}
		fetchData();
  	}, []);


	return (
		<main id="main-content" className="w-full flex flex-col gap-4 p-4 md:gap-8 md:p-6 bg-slate-50" role="main">
		<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
			<h1 className="text-2xl font-bold tracking-tight text-slate-900">Health Insights Dashboard</h1>
			<p className="text-slate-600">Monitor your vital signs and health metrics</p>
			</div>
			<div className="flex flex-col gap-2 sm:flex-row">
			<Select value={timeRange} onValueChange={setTimeRange}>
				<SelectTrigger className="w-[180px] bg-white">
				<SelectValue placeholder="Select time range" />
				</SelectTrigger>
				<SelectContent>
				<SelectItem value="24h">Last 24 Hours</SelectItem>
				<SelectItem value="7d">Last 7 Days</SelectItem>
				<SelectItem value="30d">Last 30 Days</SelectItem>
				<SelectItem value="90d">Last 90 Days</SelectItem>
				</SelectContent>
			</Select>
			<div className="flex gap-2">
				<Button variant="outline" className="bg-white" aria-label="Export data">
				<Download className="h-4 w-4 mr-2" />
				Export
				</Button>
				<Button variant="outline" className="bg-white" aria-label="Share dashboard">
				<Share2 className="h-4 w-4 mr-2" />
				Share
				</Button>
			</div>
			</div>
		</div>

		{/* Vitals summary */}
		<div className="grid gap-4 md:grid-cols-4">
			<VitalCard
			title="Heart Rate"
			value={recentSummary.bpm}
			unit="bpm"
			status="normal"
			change="-3"
			icon={<Heart className="h-4 w-4 text-rose-500" />}
			/>
			<VitalCard
			title="Blood Oxygen"
			value={recentSummary.spO2}
			unit="%"
			status="normal"
			change="+1"
			icon={<Lungs className="h-4 w-4 text-sky-500" />}
			/>
			<VitalCard
			title="Steps"
			value="8,742"
			unit="steps"
			status="good"
			change="+1,254"
			icon={<Shoe className="h-4 w-4 text-green-500" />}
			/>
			<VitalCard
			title="Temperature"
			value="37.0"
			unit="°C"
			status="normal"
			change="0"
			icon={<ThermometerSnowflake className="h-4 w-4 text-amber-500" />}
			/>
		</div>

		{/* Tabs for different health metrics */}
		<Tabs defaultValue="overview" className="w-full">
			<TabsList className="grid w-full grid-cols-5 bg-slate-100">
			<TabsTrigger value="overview" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
				Overview
			</TabsTrigger>
			<TabsTrigger value="heart" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
				Heart
			</TabsTrigger>
			<TabsTrigger
				value="respiratory"
				className="data-[state=active]:bg-teal-700 data-[state=active]:text-white"
			>
				Respiratory
			</TabsTrigger>
			<TabsTrigger value="activity" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
				Activity
			</TabsTrigger>
			<TabsTrigger value="sleep" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
				Sleep
			</TabsTrigger>
			</TabsList>

			{/* Overview tab */}
			<TabsContent value="overview" className="space-y-6">
				<HealthInsightsOverviewTab data={summaryData} />
			</TabsContent>

			{/* Heart tab */}
			<TabsContent value="heart" className="space-y-6">
				<HealthInsightsHeartTab data={bloodPressureData} />
			</TabsContent>

			{/* Respiratory tab */}
			<TabsContent value="respiratory">
				<HealthInsightsRespiratoryTab data={spO2Data}/>
			</TabsContent>

			{/* Activity tab */}
			<TabsContent value="activity">
				<HealthInsightsActivityTab data={bpmData}/>
			</TabsContent>

			{/* Sleep tab */}
			<TabsContent value="sleep" className="space-y-4 pt-4">
				<HealthInsightsSleepTab data={sleepData} />
			</TabsContent>
		</Tabs>
		<AiHealthInsights />
		</main>
	)
}