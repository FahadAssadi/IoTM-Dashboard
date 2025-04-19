import Header from "../components/header";
import HealthScreenings from "../components/health-screenings"
import Sidebar from "../components/sidebar";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <HealthScreenings />
        </main>
      </div>
    </div>
  )
}
