"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GoogleButton from "./google-button"
import { supabase } from '@/lib/supabase/client'
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { ErrorAlert, PasswordInput, ShowPasswordButton } from "@/components/form-components"

type SignUpFormProps = {
    setTab: (tab: string) => void;
};

type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    terms: boolean;
}

export default function SignUpForm({ setTab }: SignUpFormProps){
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter();

    const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({
        mode: "onChange"
    });

    function switchToLoginForm () {
        setTab("login");
        return;
    }

    function switchToForgotPasswordForm () {
        setTab("forgotPassword");
        return;
    }

    const onSubmit = async (formData: FormData) => {
        console.log("Form submitted:", formData);
        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.firstName + " " + formData.lastName,
                    first_name: formData.firstName,
                    last_name: formData.lastName
                }
            }
        })

        if (error) {
            setError("email", {
                type: "manual",
                message: "An error has occured: " + error.message
            })
        } else {
            toast.success("An authentication link has been sent to your email")
            router.refresh() // refresh to update server-side session
            switchToLoginForm();
        }
    };

    

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Create an account</h1>
                <p className="text-sm">Enter your information to get started</p>
            </div>
            <div className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* First Name Last name - on the same line*/}
                    <div className="grid grid-cols-2 gap-4 pb-2">
                        <div className="flex flex-col">
                            <label 
                                htmlFor="firstName" 
                                className="font-medium text-gray-700 mb-1">
                                First name
                            </label>
                            <div className="relative">
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    {...register("firstName", { required: "First name is required" })}
                                    type="text"
                                    className={`${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                    autoCapitalize="none"
                                    autoCorrect="off"                      
                                />
                                {errors.firstName && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                                )}
                            </div>
                            <ErrorAlert error={errors.firstName}/>
                        </div>
                        <div className="flex flex-col">
                            <label 
                            htmlFor="lastName" 
                            className="font-medium text-gray-700 mb-1">
                            Last name
                            </label>
                            <div className="relative">
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    {...register("lastName", { required: "Last name is required" })}
                                    type="text"
                                    className={`${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                />
                                {errors.lastName && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                                )}
                            </div>
                            <ErrorAlert error={errors.lastName}/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label 
                        htmlFor="email"
                        className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Email
                        </label>
                        <div className="relative">
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Please enter a valid email address" } })}
                                type="email"
                                className={`${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                            />
                            {errors.email && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                            )}
                        </div>
                        <ErrorAlert error={errors.email}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Password
                            </label>
                            <button type="button" onClick={switchToForgotPasswordForm} className="text-sm text-teal-600 hover:text-teal-500">
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <PasswordInput 
                                id="password"
                                showPassword={showPassword}
                                passwordError={errors.password}
                                registerFunc={register}
                                name="password"
                            />
                            <ShowPasswordButton
                             setShowPassword={setShowPassword}
                             showPassword={showPassword}
                            />
                        </div>
                        <ErrorAlert error={errors.password} defaultMessage="Password must be at least 8 characters long"/>
                    </div>
                    <label className="flex items-center space-x-2 pt-3">
                        <Input
                            type="checkbox"
                            className="h-4 w-4 text-primary border-red-300 "
                            {...register("terms", { required: "You must accept the terms and conditions" })}
                            // className={`${errors.terms ? ' h-4 w-4 text-primaryborder-red-500 focus:border-red-500 rounded' : 'h-4 w-4 text-primary border-gray-300 rounded'}`}
                        />
                        { errors.terms ? ( 
                            <span className="text-sm text-red-500">I agree to the{' '}
                            <button type="button" className="text-teal-800 hover:text-teal-600">Terms of Service</button> and{' '}
                            <button type="button" className="text-teal-800 hover:text-teal-600"> Privacy Policy</button></span>
                            ) : (
                            <span className="text-sm text-gray-700">I agree to the{' '}
                            <button type="button" className="text-teal-800 hover:text-teal-600">Terms of Service</button> and{' '}
                            <button type="button" className="text-teal-800 hover:text-teal-600"> Privacy Policy</button></span>
                        )}
                    </label>
                    <div className="py-1">
                        <ErrorAlert error={errors.terms} />
                    </div>
                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                        Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-gray-600">
                        <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                <GoogleButton/>
                <div className="text-center text-sm">
                    Already have an account?{" "}
                    <button type="button" onClick={switchToLoginForm} className="text-teal-600 hover:text-teal-500">
                    Log in
                    </button>
                </div>
            </div>
          </div>
    )
}