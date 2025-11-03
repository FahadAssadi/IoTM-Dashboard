// login-form.tsx

/**
 * @file Provides the 'loginForm' component - a user registration form
 * that integrates with Supabase authentication
 * 
 * @remarks
 * This component handles:
 * - Client-side form validation via `react-hook-form`
 * - Supabase email/password login
 * - Displaying field-specific validation and API errors
 * - Redirects and UI state changes after successful signup
 *
 * Used within the authentication tab view to switch between sign-up,
 * login, and password recovery forms.
 */

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GoogleButton from "./google-button"
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/supabase/client'
import { toast } from "react-toastify"

type LoginFormProps = {
    setTab: (tab: string) => void;
};

type FormData = {
  email: string;
  password: string;
}

export default function LoginForm({ setTab }: LoginFormProps){
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter();

    const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({
        mode: "onChange"
    }); 

    const onSubmit = async (formData: FormData) => {
      	// console.log("Form submitted:", formData);

		const { error } = await supabase.auth.signInWithPassword({
			email: formData.email,
			password: formData.password
		})

		if (error) {
			setError("email", {
					type: "manual",
					message: "An error has occured: " + error.message
			})
			console.error(error)
		} else {
			toast.success("Login Successful")
			router.refresh() // Refresh to update server-side session
			router.push("/");
		}   
    };

    function switchToSignUpForm () {
        setTab("signup");
        return;
    }

    function switchToForgotPasswordForm () {
      setTab("forgotPassword");
      return;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
				<h1 className="text-2xl font-semibold">Welcome back</h1>
				<p className="text-sm">Enter your credentials to access your account</p>
            </div>
            <div className="space-y-4">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-3">
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
					<div className="space-y-3">
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
						<Input
						id="password"
						type={showPassword ? "text" : "password"}
						{...register("password", { required: "Password is required"})}
						className={`${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
						autoCapitalize="none"
						autoComplete="current-password"
						autoCorrect="off"
						/>
						{errors.password && (
						<AlertCircle className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
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
					<div className="pb-3">
						{errors.password &&
						<p className="mt-1 text-sm text-red-700 flex items-center">
									<AlertCircle className="h-3 w-3 mr-1" /> 
									{errors.password.message}
								</p>}
					</div>
					</div>
					<Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
					Login
					<ArrowRight className="ml-2 h-4 w-4" />
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
					Don&apos;t have an account?{" "}
					<button type="button" onClick={switchToSignUpForm} className="text-teal-600 hover:text-teal-500">
					Sign up
					</button>
				</div>
            </div>
        </div>
    )
}