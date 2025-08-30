"use client"

import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShowPasswordButton, PasswordInput, ErrorAlert } from "@/components/form-components"
import { toast } from "react-toastify"
// import { redirect } from "next/navigation"
// import { useSupabaseUser } from "@/lib/supabase/useSupabaseUser"

type FormData = {
        password1: string;
        password2: string;
    }

export default function PasswordResetPage(){

    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false)
    const router = useRouter()

    // Protect the page from being accessed when no user is logged in
    // const user = useSupabaseUser()
    // if (!user) {
    //     // The notification doesn't work yet...
    //     toast.error("Unathourised Navigation: Please login to access profile page")
    //     redirect("/login")
    // }

    const { register, handleSubmit, setError, formState: {errors} } = useForm<FormData>({
        mode: "onChange"
    });

    const onSubmit = async (formData: FormData) => {
        //check if the passwords match
        if (formData.password1 !== formData.password2){
            setError("password2", {
                type: "manual",
                message: "Error: Passwords do not match"
            })
            // Break because there is an error
            return
        }

        const { error } = await supabase.auth.updateUser({
            password: formData.password1
        })
        if (error) {
            // Notification error
            toast.error("An error occurred: " + error.message)
            // Error appears in the UI
            setError("password2", {
                type: "manual",
                message: "An Error has occured: " + error.message
            })
        } else {
            // Success notification
            toast.success("Password Changed Succesfully")
            router.push("/")
        }
    };



    return (
        <main id="main-content" className="w-full flex flex-col gap-4 p-4 md:gap-8 md:p-6 bg-slate-50" role="main">
            <div className="pt-12">
                <div className="mx-auto w-full max-w-md">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        {/* Title Block */}
                        <div className="mb-6">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-semibold">Reset Password</h1>
                                <p className="text-sm">Please Input your new password</p>
                            </div>
                        </div>
                        {/* Form */}
                        <div className="space-y-4">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <PasswordInput
                                            id="password1"
                                            showPassword={showPassword1} 
                                            passwordError={errors.password1} 
                                            registerFunc={register}
                                            name={"password1"}
                                        />
                                        <ShowPasswordButton setShowPassword={setShowPassword1} showPassword={showPassword1}/>
                                    </div>
                                        <ErrorAlert
                                            error={errors.password1}
                                            defaultMessage="Password must be at least 8 characters long"
                                        />
                                    {/* PASSWORD INPUT 2 */}
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Confirm Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <PasswordInput 
                                            id="password2"
                                            showPassword={showPassword2} 
                                            passwordError={errors.password2} 
                                            registerFunc={register}
                                            name={"password2"}
                                        />
                                        <ShowPasswordButton setShowPassword={setShowPassword2} showPassword={showPassword2}/>
                                    </div>
                                    <ErrorAlert error={errors.password2}/>
                                </div>
                                <div className="mt-4">
                                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                                        Reset Password <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}