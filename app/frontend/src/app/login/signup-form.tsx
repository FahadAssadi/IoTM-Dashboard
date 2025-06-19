"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GoogleButton from "./google-button"

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

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        mode: "onChange"
    });

    function switchToLoginForm () {
        setTab("login");
        return;
    }

    const onSubmit = (data: FormData) => {
      console.log("Form submitted:", data);
      // Send to API, etc.
      switchToLoginForm();
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
                            <div>
                                {errors.firstName && 
                                <p className="mt-1 text-sm text-red-700 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" /> 
                                    {errors.firstName.message}
                                </p>}
                            </div>
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
                            
                            <div>
                                {errors.lastName && 
                                <p className="mt-1 text-sm text-red-700 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" /> 
                                    {errors.lastName.message}
                                </p>}
                            </div>
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
                        <div>
                            {errors.email && 
                            <p className="mt-1 text-sm text-red-700 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> 
                                {errors.email.message}
                            </p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Password
                            </label>
                            <Link href="#" className="text-sm text-teal-600 hover:text-teal-500">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                                autoCapitalize="none"
                                className={`${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                autoComplete="current-password"
                                autoCorrect="off"
                            />
                            {errors.password && (
                                <AlertCircle className="absolute right-9 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                            </Button>
                        </div>
                        <div>
                            {errors.password ? (
                                <p className="mt-1 text-sm text-red-700 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" /> 
                                    {errors.password.message}
                                </p>
                                ) : (
                                <span className="text-sm text-gray-500 pt-1">Password must be at least 8 characters long</span>
                            )}
                        </div>
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
                            <button className="text-teal-800 hover:text-teal-600">Terms of Service</button> and{' '}
                            <button className="text-teal-800 hover:text-teal-600"> Privacy Policy</button></span>
                            ) : (
                            <span className="text-sm text-gray-700">I agree to the{' '}
                            <button className="text-teal-800 hover:text-teal-600">Terms of Service</button> and{' '}
                            <button className="text-teal-800 hover:text-teal-600"> Privacy Policy</button></span>
                        )}
                    </label>
                    <div className="py-1">
                        {errors.terms && 
                        <p className="mt-1 text-sm text-red-700 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> 
                                You must accept the terms and conditions
                            </p>}
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
                    <button onClick={switchToLoginForm} className="text-teal-600 hover:text-teal-500">
                    Log in
                    </button>
                </div>
            </div>
          </div>
    )
}