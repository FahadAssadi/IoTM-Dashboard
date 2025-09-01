"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GoogleButton from "./google-button"
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/supabase/client'
import { toast } from "react-toastify"
import { ErrorAlert, PasswordInput, ShowPasswordButton } from "@/components/form-components"

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
              <ErrorAlert error={errors.email} />
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
              <div className="pb-3">
                  <ErrorAlert error={errors.password}/>
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