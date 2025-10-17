import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, Clock }  from "lucide-react"

export function AiHealthInsights() {
    return (
		<div className="w-full gap-6">
			<Card>
			<CardHeader>
				<CardTitle>Health Insights</CardTitle>
				<CardDescription>AI-powered analysis of your health data</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
				<Card>
					<div className="flex items-start gap-4 rounded-lg p-4">
					<div className="rounded-full bg-green-100 p-2">
						<Activity className="h-4 w-4 text-green-600" />
					</div>
					<div>
						<h4 className="text-sm font-medium">Improved Cardiovascular Health</h4>
						<p className="text-sm text-muted-foreground mt-1">
						Your resting heart rate has decreased by 5 bpm over the past month, indicating improved
						cardiovascular fitness.
						</p>
					</div>
					</div>
				</Card>

				<Card>
					<div className="flex items-start gap-4 rounded-lg p-4">
					<div className="rounded-full bg-blue-100 p-2">
						<Clock className="h-4 w-4 text-blue-600" />
					</div>
					<div>
						<h4 className="text-sm font-medium">Consistent Sleep Schedule</h4>
						<p className="text-sm text-muted-foreground mt-1">
						You&apos;ve maintained a consistent sleep schedule for 14 days. This regularity benefits your overall
						health.
						</p>
					</div>
					</div>
				</Card>

				<Card>
					<div className="flex items-start gap-4 rounded-lg p-4">
					<div className="rounded-full bg-amber-100 p-2">
						<Calendar className="h-4 w-4 text-amber-600" />
					</div>
					<div>
						<h4 className="text-sm font-medium">Activity Pattern</h4>
						<p className="text-sm text-muted-foreground mt-1">
						You&apos;re most active on Thursdays and Saturdays. Consider adding light activity on your less active
						days.
						</p>
					</div>
					</div>
				</Card>
				</div>
			</CardContent>
			</Card>
		</div>
    );
}