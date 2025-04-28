import Header from "../../components/views/header";
import Sidebar from "../../components/views/sidebar";
import HealthScreenings from "./health-screenings"
import HealthScreeningTimeline from "./health-screenings-timeline";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Health Screenings</h1>
          <Button variant="ghost" size="icon">
            <CalendarDays className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">Track and manage your recommended health screenings and checkups.</p>
        <HealthScreenings />
        <HealthScreeningTimeline />
      </div>
    </main>
  )
}
