import Link from "next/link"
import { Shield, Heart, Calendar, Activity, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// TODO: link get started button to signup page instead of login

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1">
        {/* Welcome Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
                    Take control of your preventative health
                  </h1>
                  <p className="max-w-[600px] text-slate-700 md:text-xl">
                    HealthTrack helps you stay on top of recommended health screenings, track your vital signs, and
                    receive personalized health insights.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-teal-700 hover:bg-teal-800 text-white" size="lg" asChild>
                    <Link href="/login">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/login">Log in to your account</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Calendar className="h-5 w-5 text-teal-700 mr-2" />
                        Health Screenings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700">
                        Track and schedule recommended health screenings based on your age, sex, and health profile.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Heart className="h-5 w-5 text-teal-700 mr-2" />
                        Vital Monitoring
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700">
                        Connect with your health devices to monitor vital signs and receive alerts for abnormal
                        readings.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Activity className="h-5 w-5 text-teal-700 mr-2" />
                        Health Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700">
                        Get personalised health insights and recommendations based on your health data.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Shield className="h-5 w-5 text-teal-700 mr-2" />
                        Privacy First
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700">
                        Your health data is secure and private. We use industry-standard encryption and never share your data.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
                  Why choose HealthTrack?
                </h2>
                <p className="max-w-[900px] text-slate-700 md:text-xl">
                  Our platform is designed to help you take a proactive approach to your health
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-teal-100 p-3">
                  <Calendar className="h-6 w-6 text-teal-700" />
                </div>
                <h3 className="text-center text-xl font-bold text-slate-900">Personalised Screening Timeline</h3>
                <p className="text-center text-slate-700">
                  Get a personalised timeline of recommended health screenings based on your age, sex, and health
                  profile.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-teal-100 p-3">
                  <Heart className="h-6 w-6 text-teal-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Device Integration</h3>
                <p className="text-center text-slate-700">
                  Connect with your health devices to automatically track vital signs and health metrics.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-teal-100 p-3">
                  <Activity className="h-6 w-6 text-teal-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Health Alerts</h3>
                <p className="text-center text-slate-700">
                  Receive alerts when your vital signs are outside normal ranges or when a health screening is due.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button className="bg-teal-700 hover:bg-teal-800 text-white" size="lg" asChild>
                <Link href="/login">
                  Create Your Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t bg-white px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-700" aria-hidden="true" />
          <p className="text-sm text-slate-900">© 2025 HealthTrack. All rights reserved.</p>
        </div>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm text-slate-700 hover:underline" href="#">
            Terms of Service
          </Link>
          <Link className="text-sm text-slate-700 hover:underline" href="#">
            Privacy
          </Link>
          <Link className="text-sm text-slate-700 hover:underline" href="#">
            About
          </Link>
        </nav>
      </footer> */}
    </div>
  )
}
