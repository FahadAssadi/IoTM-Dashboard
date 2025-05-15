import HealthScreenings from "./health-screenings"
import HealthScreeningTimeline from "./health-screenings-timeline";

export default function Home() {
  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Health Screenings</h1>
        </div>
        <p className="text-muted-foreground mb-8">Track and manage your recommended health screenings and checkups.</p>
        <HealthScreenings />
        <HealthScreeningTimeline />
      </div>
    </main>
  )
}
