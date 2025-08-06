import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { AlertCircle, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ProfileSecurity() {
    return (
        <TabsContent value="security" className="space-y-4 pt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-teal-700" aria-hidden="true" />
                        <span>Password</span>
                    </CardTitle>
                    <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                            id="current-password"
                            type="password"
                            className="bg-white"
                            aria-required="true"
                            aria-describedby="password-requirements"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" className="bg-white" aria-required="true" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" className="bg-white" aria-required="true" />
                        <p id="password-requirements" className="text-xs text-slate-600 mt-2">
                            Password must be at least 8 characters long and include a mix of letters, numbers, and special
                            characters
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" aria-label="Cancel password change">
                        Cancel
                    </Button>
                    <Button className="bg-teal-700 hover:bg-teal-800 text-white" aria-label="Update password">
                        Update Password
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-red-600">
                        <AlertCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                        <span>Delete Account</span>
                    </CardTitle>
                    <CardDescription>Permanently delete your account and all data</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-700">
                        Once you delete your account, there is no going back. This action cannot be undone and all your data
                        will be permanently removed.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button variant="destructive" aria-describedby="delete-warning">
                        Delete Account
                    </Button>
                    <p id="delete-warning" className="sr-only">
                        Warning: This will permanently delete your account and all associated data
                    </p>
                </CardFooter>
            </Card>
        </TabsContent>
    );
}