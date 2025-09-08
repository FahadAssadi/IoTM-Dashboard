import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { LineChart } from "@/components/ui/chart"

export default function HealthInsightsRespiratoryTab () {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Respiratory Health</CardTitle>
                    <CardDescription>Blood oxygen and breathing rate</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <RespiratoryHealthChart />
                </CardContent>
            </Card>
        </div>
    )
}

function RespiratoryHealthChart() {
  // Respiratory stats for 24 hours
  const data = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    bloodOxygen: Math.floor(Math.random() * 4) + 95,
    breathingRate: Math.floor(Math.random() * 4) + 14,
  }))

  return (
    <LineChart
      data={data}
      categories={["bloodOxygen", "breathingRate"]}
      index="hour"
      colors={["#0ea5e9", "#8b5cf6"]}
      valueFormatter={(value, category) => (category === "bloodOxygen" ? `${value}%` : `${value} br/min`)}
      showAnimation
      showLegend
      className="h-[400px]"
    />
  )
}