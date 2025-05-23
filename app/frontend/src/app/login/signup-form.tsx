import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GoogleButton from "./google-button"

type SignUpFormProps = {
    setTab: (tab: string) => void;
};

export default function SignUpForm({ setTab }: SignUpFormProps){

    const [showPassword, setShowPassword] = useState(false)

    function switchToLoginForm () {
        setTab("login");
        return;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Create an account</h1>
                <p className="text-sm">Enter your information to get started</p>
            </div>
            <div className="space-y-4">
                {/* First Name Last name - on the same line*/}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label 
                          htmlFor="firstName" 
                          className="font-medium text-gray-700 mb-1">
                          First name
                        </label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          type="text"
                          autoCapitalize="none"
                          autoCorrect="off"                      
                        />
                    </div>
                    <div className="flex flex-col">
                        <label 
                          htmlFor="lastName" 
                          className="font-medium text-gray-700 mb-1">
                          Last name
                        </label>
                        <Input
                        id="lastName"
                        placeholder="Doe"
                        type="text"
                        autoCapitalize="none"
                        autoCorrect="off"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label 
                    htmlFor="email"
                    className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email
                    </label>
                    <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    />
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
                            autoCapitalize="none"
                            autoComplete="current-password"
                            autoCorrect="off"
                        />
                        <p className="text-sm text-gray-500 pt-1">
                            Password must be at least 8 characters long
                        </p>
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
                </div>
                <label className="flex items-center space-x-2">
                <Input
                    type="checkbox"
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">I agree to the Terms of Service and Privacy Policy</span>
                </label>
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
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