import { Bell, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="w-full border-b bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded border border-primary flex items-center justify-center">
          <Heart className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold text-primary text-lg">HealthTrack</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-gray-100"></div>
      </div>
    </header>
  )
}
