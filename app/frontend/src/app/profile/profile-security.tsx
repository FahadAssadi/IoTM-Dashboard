import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import ProfileResetPassword from "./profile-reset-password";

export default function ProfileSecurity() {
    return (
        <TabsContent value="security" className="space-y-4 pt-4">
            <ProfileResetPassword/>
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