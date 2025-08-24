"use client"

import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"

type FormData = {
        password1: string;
        password2: string;
    }

export default function PasswordResetPage(){

    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false)
    const router = useRouter()

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
                                        <Input
                                            id="password"
                                            type={showPassword1 ? "text" : "password"}
                                            {...register("password1", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                                            autoCapitalize="none"
                                            className={`${errors.password1 ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            autoComplete="current-password"
                                            autoCorrect="off"
                                        />
                                        {errors.password1 && (
                                            <AlertCircle className="absolute right-9 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword1(!showPassword1)}
                                        >
                                            {showPassword1 ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span className="sr-only">{showPassword1 ? "Hide password" : "Show password"}</span>
                                        </Button>
                                    </div>
                                    <div>
                                        {errors.password1 ? (
                                            <p className="mt-1 text-sm text-red-700 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" /> 
                                                {errors.password1.message}
                                            </p>
                                            ) : (
                                            <span className="text-sm text-gray-500 pt-1">Password must be at least 8 characters long</span>
                                        )}
                                    </div>
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
                                        <Input
                                            id="password"
                                            type={showPassword2 ? "text" : "password"}
                                            {...register("password2", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                                            autoCapitalize="none"
                                            className={`${errors.password2 ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                            autoComplete="current-password"
                                            autoCorrect="off"
                                        />
                                        {errors.password2 && (
                                            <AlertCircle className="absolute right-9 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword2(!showPassword2)}
                                        >
                                            {showPassword2 ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span className="sr-only">{showPassword2 ? "Hide password" : "Show password"}</span>
                                        </Button>
                                    </div>
                                    <div>
                                        {errors.password2 && (
                                            <p className="mt-1 text-sm text-red-700 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" /> 
                                                {errors.password2.message}
                                            </p>
                                        )}
                                    </div>
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