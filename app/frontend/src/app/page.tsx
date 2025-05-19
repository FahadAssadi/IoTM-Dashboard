import {
  Activity,
  Calendar,
  Clock,
  Heart,
  ArrowRight,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {

  return (
    <main className="flex flex-col gap-4 p-4 md:gap-8 md:p-6 w-full bg-slate-50">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Welcome back, Jane</h1>
        <p className="text-slate-600">Here&apos;s an overview of your health status and upcoming checkups.</p>
      </div>

      {/* Health Status Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Upcoming Checkups</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">2</div>
            <p className="mt-2 text-xs text-slate-600">You have 2 upcoming health screenings in the next 30 days</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 ">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Vitals Status</CardTitle>
            <Heart className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">Normal</div>
            <p className="mt-2 text-xs text-slate-600">All your vital signs are within normal ranges</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 ">
        <CardHeader>
          <CardTitle className="text-slate-800">Upcoming Health Screenings</CardTitle>
          <CardDescription className="text-slate-600">
            Your personalized health screening timeline based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium text-slate-800">Flu Vaccine</p>
              <div className="flex items-center text-sm text-slate-600">
                <Clock className="mr-1 h-4 w-4" />
                <span>May 20, 2025</span>
              </div>
            </div>
            <Badge variant="outline" className="ml-auto bg-amber-100 text-amber-700 border-amber-200">
              Due Soon
            </Badge>
            <Button variant="default">
              Export
            </Button>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium text-slate-800">Annual Physical Examination</p>
              <div className="flex items-center text-sm text-slate-600">
                <Clock className="mr-1 h-4 w-4" />
                <span>June 30, 2025</span>
              </div>
            </div>
            <Badge variant="outline" className="ml-auto bg-teal-100 text-teal-700 border-teal-200">
              Upcoming
            </Badge>
            <Button variant="default">
              Export
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full border-teal-700 text-teal-800 hover:bg-teal-50">
            View All Screenings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Connected Devices */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Connected Health Devices</CardTitle>
          <CardDescription className="text-slate-600">
            Devices currently syncing data with your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                <Zap className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Apple Watch Series 9</p>
                <p className="text-sm text-slate-600">Last synced: 2 hours ago</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
              Connected
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                <Activity className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Fitbit Charge 5</p>
                <p className="text-sm text-slate-600">Last synced: 1 day ago</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
              Connected
            </Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full border-teal-700 text-teal-800 hover:bg-teal-50">
            Connect New Device
          </Button>
        </CardFooter>
      </Card>
    </main >
  )
}
