"use client"

import { Card, CardContent, CardHeader, CardFooter, CardDescription, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { ShowPasswordButton, PasswordInput, ErrorAlert } from "@/components/form-components"
import { supabase } from "@/lib/supabase/client"
import { toast } from "react-toastify"

type FormData = {
    newPassword: string
    confirmPassword: string
}

export default function ProfileResetPassword(){

    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { register, handleSubmit, setError, reset, formState: {errors} } = useForm<FormData>({
        mode: "onChange"
    });

    const onSubmit = async (formData: FormData) => {
        // Check if the passwords match
        if ( formData.newPassword !== formData.confirmPassword ){
            setError("confirmPassword", {
                type: "manual",
                message: "Error: Passwords do not match"
            })
            return 
        }
        // Supabase call
        // TODO: // Do we even need the current password?
        const { error } = await supabase.auth.updateUser({
                    password: formData.newPassword
                })
        if (error) {
            // Notification error
            toast.error("An error occurred: " + error.message)
            // Error appears in the UI
            setError("confirmPassword", {
                type: "manual",
                message: "An Error has occured: " + error.message
            })
        } else {
            // Success notification
            reset();
            toast.success("Password Changed Succesfully")
        }
    }

    return(
        <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-teal-700" aria-hidden="true" />
                        <span>Password</span>
                    </CardTitle>
                    <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                            <PasswordInput
                                id="new-password"
                                showPassword={showNewPassword}
                                passwordError={errors.newPassword}
                                registerFunc={register}
                                name={"newPassword"}
                            />
                            <ShowPasswordButton
                                setShowPassword={setShowNewPassword}
                                showPassword={showNewPassword}
                            />
                        </div>
                        <ErrorAlert 
                            error={errors.newPassword}
                            defaultMessage="Password must be at least 8 characters long"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <div className="relative">
                            <PasswordInput
                                id="confirm-password"
                                showPassword={showConfirmPassword}
                                passwordError={errors.confirmPassword}
                                registerFunc={register}
                                name={"confirmPassword"}
                            />
                            <ShowPasswordButton
                                setShowPassword={setShowConfirmPassword}
                                showPassword={showConfirmPassword}
                            />
                        </div>
                        <ErrorAlert error={errors.confirmPassword}/>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="outline" aria-label="Cancel password change">
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white" aria-label="Update password">
                        Update Password
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}