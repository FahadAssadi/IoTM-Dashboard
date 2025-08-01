import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { TabsContent } from "@radix-ui/react-tabs";
import { Bell, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function ProfilePreferences() {
    return (
        < TabsContent value = "preferences" className = "space-y-4 pt-4" >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5 text-teal-700" aria-hidden="true" />
                    <span>Notifications</span>
                  </CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <fieldset className="space-y-4">
                    <legend className="sr-only">Notification preferences</legend>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900" id="screening-reminders-label">
                          Health Screening Reminders
                        </p>
                        <p className="text-sm text-slate-700" id="screening-reminders-description">
                          Receive reminders about upcoming health screenings
                        </p>
                      </div>
                      <Switch
                        defaultChecked
                        aria-labelledby="screening-reminders-label"
                        aria-describedby="screening-reminders-description"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900" id="news-updates-label">
                          Health News Updates
                        </p>
                        <p className="text-sm text-slate-700" id="news-updates-description">
                          Receive updates about relevant health news
                        </p>
                      </div>
                      <Switch
                        defaultChecked
                        aria-labelledby="news-updates-label"
                        aria-describedby="news-updates-description"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900" id="vital-alerts-label">
                          Abnormal Vital Alerts
                        </p>
                        <p className="text-sm text-slate-700" id="vital-alerts-description">
                          Receive alerts when your vitals are outside normal ranges
                        </p>
                      </div>
                      <Switch
                        defaultChecked
                        aria-labelledby="vital-alerts-label"
                        aria-describedby="vital-alerts-description"
                      />
                    </div>
                  </fieldset>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    className="bg-teal-700 hover:bg-teal-800 text-white"
                    aria-label="Save notification preferences"
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-teal-700" aria-hidden="true" />
                    <span>Display Settings</span>
                  </CardTitle>
                  <CardDescription>Customize your display preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900" id="dark-mode-label">
                        Dark Mode
                      </p>
                      <p className="text-sm text-slate-700" id="dark-mode-description">
                        Use dark theme for the application
                      </p>
                    </div>
                    <Switch aria-labelledby="dark-mode-label" aria-describedby="dark-mode-description" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="bg-teal-700 hover:bg-teal-800 text-white" aria-label="Save display settings">
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent >
    );
}