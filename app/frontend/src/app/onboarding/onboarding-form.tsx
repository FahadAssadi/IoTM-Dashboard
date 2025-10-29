"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { toast } from "react-toastify"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowRight, ArrowLeft } from "lucide-react"
import onboardingScaffold from "./onboarding-scaffold.json";
import type { OnboardingFormType } from "./onboarding-interfaces"
import { Input } from "@/components/ui/input"

// Implementation of this may be overcomplicated for our use case - sorry
const healthConditionColumns = 2;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5225/api'

export default function OnboardingForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const [onboardingForm, setOnboardingForm] = useState<OnboardingFormType>(
        onboardingScaffold as OnboardingFormType);

    const totalSteps = 3
    const progressPercentage = (currentStep / totalSteps) * 100

    // Validate age is at least 13 years old
    const validateAge = (dob: string): boolean => {
        if (!dob) return false
        
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        
        return age >= 13
    }

    // Validate Step 1 fields
    const validateStep1 = (): boolean => {
        if (!onboardingForm.firstName?.trim()) {
            toast.error("Please enter your first name")
            return false
        }
        
        if (!onboardingForm.lastName?.trim()) {
            toast.error("Please enter your last name")
            return false
        }
        
        if (!onboardingForm.dob) {
            toast.error("Please enter your date of birth")
            return false
        }
        
        if (!validateAge(onboardingForm.dob)) {
            toast.error("You must be at least 13 years old to use this service")
            return false
        }
        
        if (!onboardingForm.sex) {
            toast.error("Please select your sex")
            return false
        }
        
        return true
    }

    // Validate Step 2 fields
    const validateStep2 = (): boolean => {
        if (!onboardingForm.state?.trim()) {
            toast.error("Please enter your state/territory")
            return false
        }
        
        if (!onboardingForm.postcode?.trim()) {
            toast.error("Please enter your postcode")
            return false
        }
        
        return true
    }

    const nextStep = () => {
        if (currentStep === 1 && !validateStep1()) {
            return
        }
        
        if (currentStep === 2 && !validateStep2()) {
            return
        }
        
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setCurrentUserId(user.id)
                } else {
                    toast.error("Please log in to continue")
                    router.push('/login')
                }
            } catch (error) {
                console.error("Error getting current user:", error)
                toast.error("Authentication error")
            }
        }

        getCurrentUser()
    }, [router])

    // Fetch user profile data when userId is available
    useEffect(() => {
        if (!currentUserId) return

        const fetchUserProfile = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/profile`)
                
                if (response.ok) {
                    const profileResponse = await response.json()
                    
                    if (profileResponse.success && profileResponse.user) {
                        const user = profileResponse.user
                        
                        // Update form with fetched user data
                        setOnboardingForm(prev => ({
                            ...prev,
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                        }))
                    }
                } else {
                    console.log("Profile not found or error fetching, using empty form")
                }
            } catch (error) {
                console.error("Error fetching user profile:", error)
                // Continue with empty form if fetch fails
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserProfile()
    }, [currentUserId])

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    // There's probably a better way to do this...
    const handleStringChange = (category: string, text: string | null) => {
        setOnboardingForm((prevForm) => {
            const updatedText = text
            console.log(onboardingForm)
            return {
                ...prevForm,
                [category]: updatedText,
            }
        });
    }

    const handleNumberChange = (category: string, number: string) => {
        setOnboardingForm((prevForm) => {
            let updatedNumber: number;
            try {
                updatedNumber = parseInt(number);
            } catch {
                updatedNumber = NaN;
            }
            return {
                ...prevForm,
                [category]: updatedNumber,
            }
        });
    }

    const handleConditionChange = (condition: string, checked: boolean) => {
        setOnboardingForm((prevForm) => {
            const updatedHealthConditions = prevForm.healthConditions.map((item) =>
                item.condition === condition ? { ...item, status: checked } : item
            );
            return {
                ...prevForm,
                healthConditions: updatedHealthConditions,
            };
        });
    }

    const handleLifestyleChange = (factor: string, selection: string) => {
        setOnboardingForm((prevForm) => {
            const updatedLifestyleFactors = prevForm.lifestyleFactors.map((item) =>
                item.factor === factor ? { ...item, selection: selection } : item
            );
            console.log("LifestyleFactor: " + factor + " has been set to " + selection);
            return {
                ...prevForm,
                lifestyleFactors: updatedLifestyleFactors
            };
        });
    }

    const handleSubmit = async () => {
        if (!currentUserId) {
            toast.error("User not authenticated")
            return
        }

        // Validate required fields
        if (!validateStep1()) {
            return
        }

        if (!validateStep2()) {
            return
        }

        setIsSubmitting(true)

        try {
            console.log("Submitting onboarding data:", onboardingForm)

            // Transform camelCase to PascalCase for C# backend
            const payload = {
                FirstName: onboardingForm.firstName,
                LastName: onboardingForm.lastName,
                Email: onboardingForm.email,
                Dob: onboardingForm.dob,
                Sex: onboardingForm.sex,
                Height: isNaN(onboardingForm.height) ? null : onboardingForm.height,
                Weight: isNaN(onboardingForm.weight) ? null : onboardingForm.weight,
                State: onboardingForm.state,
                Postcode: onboardingForm.postcode,
                HealthConditions: onboardingForm.healthConditions.map(hc => ({
                    Condition: hc.condition,
                    Status: hc.status
                })),
                LifestyleFactors: onboardingForm.lifestyleFactors.map(lf => ({
                    Factor: lf.factor,
                    Selection: lf.selection
                }))
            }

            console.log("Sending payload to backend:", payload)

            const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/onboarding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error("Error response:", errorData)
                throw new Error(errorData.message || `HTTP ${response.status}`)
            }

            const data = await response.json()
            console.log("Onboarding response:", data)

            toast.success("Welcome! Your profile has been set up successfully")

            // Redirect to home page after successful onboarding
            setTimeout(() => {
                router.push('/')
            }, 1000)

        } catch (error) {
            console.error("Onboarding error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to complete onboarding. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSkip = async () => {
        if (!currentUserId) {
            toast.error("User not authenticated")
            return
        }

        // Still validate required fields from Steps 1 and 2
        if (!validateStep1()) {
            return
        }

        if (!validateStep2()) {
            return
        }

        setIsSubmitting(true)

        try {
            console.log("Skipping Step 3, submitting with empty health data")

            // Transform camelCase to PascalCase for C# backend
            const payload = {
                FirstName: onboardingForm.firstName,
                LastName: onboardingForm.lastName,
                Email: onboardingForm.email,
                Dob: onboardingForm.dob,
                Sex: onboardingForm.sex,
                Height: isNaN(onboardingForm.height) ? null : onboardingForm.height,
                Weight: isNaN(onboardingForm.weight) ? null : onboardingForm.weight,
                State: onboardingForm.state,
                Postcode: onboardingForm.postcode,
                HealthConditions: [],
                LifestyleFactors: []
            }

            console.log("Sending payload to backend:", payload)

            const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/onboarding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error("Error response:", errorData)
                throw new Error(errorData.message || `HTTP ${response.status}`)
            }

            const data = await response.json()
            console.log("Onboarding response:", data)

            toast.success("Welcome! Your profile has been set up successfully")

            // Redirect to home page after successful onboarding
            setTimeout(() => {
                router.push('/')
            }, 1000)

        } catch (error) {
            console.error("Onboarding error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to complete onboarding. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderProgressBar = () => (
        <div className="w-full mb-8">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    )

    const renderStep1 = () => (
        <div className="text-center space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
                <p className="text-gray-600">{"Let's get started by setting up your profile"}</p>
            </div>

            <Card className="text-left">
                <CardHeader>
                    <CardTitle className="text-xl">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label
                                htmlFor="firstName"
                                className="font-medium text-gray-700 ml-1">
                                First Name<span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="firstName"
                                    type="text"
                                    autoCorrect="off"
                                    value={onboardingForm.firstName}
                                    onChange={(e) => handleStringChange("firstName", e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label
                                htmlFor="lastName"
                                className="font-medium text-gray-700 ml-1">
                                Last Name<span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="lastName"
                                    type="text"
                                    autoCorrect="off"
                                    value={onboardingForm.lastName}
                                    onChange={(e) => handleStringChange("lastName", e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label
                            htmlFor="email"
                            className="font-medium text-gray-700 ml-1">
                            Email<span className="text-sm text-gray-500"> (change if required)</span>
                        </label>
                        <div className="relative mt-1">
                            <Input
                                id="email"
                                type="email"
                                autoCorrect="off"
                                value={onboardingForm.email}
                                onChange={(e) => handleStringChange("email", e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label
                            htmlFor="dob"
                            className="font-medium text-gray-700 ml-1">
                            Date of Birth<span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1">
                            <Input
                                id="dob"
                                type="date"
                                autoCorrect="off"
                                value={onboardingForm.dob}
                                onChange={(e) => handleStringChange("dob", e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-1">You must be at least 13 years old</p>
                    </div>

                    <div className="flex flex-col">
                        <label className="font-medium text-gray-700 ml-1 mb-2">
                            Sex<span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="male"
                                    name="sex"
                                    value="Male"
                                    checked={onboardingForm.sex === "Male"}
                                    onChange={(e) => handleStringChange("sex", e.target.value)}
                                    disabled={isLoading}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="male" className="text-sm">Male</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="female"
                                    name="sex"
                                    value="Female"
                                    checked={onboardingForm.sex === "Female"}
                                    onChange={(e) => handleStringChange("sex", e.target.value)}
                                    disabled={isLoading}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="female" className="text-sm">Female</label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button 
                onClick={nextStep} 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isLoading}
            >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Additional Information</h1>
                <p className="text-gray-600">Help us personalize your experience</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Health Metrics & Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label
                                htmlFor="height"
                                className="font-medium text-gray-700 ml-1">
                                Height (cm)<span className="text-sm text-gray-500"> (optional)</span>
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="height"
                                    type="number"
                                    autoCorrect="off"
                                    // value doesn't like getting a NaN input so when there's no value put it as ""
                                    value={isNaN(onboardingForm.height) ? "" : onboardingForm.height}
                                    onChange={(e) => handleNumberChange("height", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label
                                htmlFor="weight"
                                className="font-medium text-gray-700 ml-1">
                                Weight (kg)<span className="text-sm text-gray-500"> (optional)</span>
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="weight"
                                    type="number"
                                    autoCorrect="off"
                                    // value doesn't like getting a NaN input so when there's no value put it as ""
                                    value={isNaN(onboardingForm.weight) ? "" : onboardingForm.weight}
                                    onChange={(e) => handleNumberChange("weight", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label
                                htmlFor="state"
                                className="font-medium text-gray-700 ml-1">
                                State/Territory<span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="state"
                                    type="text"
                                    autoCorrect="off"
                                    value={onboardingForm.state}
                                    onChange={(e) => handleStringChange("state", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label
                                htmlFor="postcode"
                                className="font-medium text-gray-700 ml-1">
                                Postcode<span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="postcode"
                                    type="text"
                                    autoCorrect="off"
                                    value={onboardingForm.postcode}
                                    onChange={(e) => handleStringChange("postcode", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex space-x-4">
                <Button onClick={prevStep} variant="outline" className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button onClick={nextStep} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Information</h1>
                <p className="text-gray-600">This information is optional but helps us provide better recommendations</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Health Conditions</CardTitle>
                    <p className="text-sm text-gray-600">Select any conditions that apply to you</p>
                </CardHeader>
                <CardContent>
                    <div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* This creates an array [0, 1, ... columns - 1] and iterates through it*/}
                            {Array.from({ length: healthConditionColumns }, (_, column) => (
                                <div className="space-y-3" key={column}>
                                    {/* This loop populates the columns with the conditions split relatively evenly*/}
                                    {onboardingForm.healthConditions.slice(
                                        column * onboardingForm.healthConditions.length / healthConditionColumns // (column * segment) to (column + 1 * segment)
                                        , (column + 1) * onboardingForm.healthConditions.length / healthConditionColumns).map((item) => (
                                            <div key={item.condition} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={item.condition}
                                                    checked={item.status}
                                                    onCheckedChange={(checked) => handleConditionChange(item.condition, checked as boolean)}
                                                />
                                                <Label htmlFor={item.condition} className="text-sm">
                                                    {item.condition}
                                                </Label>
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lifestyle Factors</CardTitle>
                    <p className="text-sm text-gray-600">Select the condition that most applies to you</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {onboardingForm.lifestyleFactors.map((lifestyleFactor) => (
                        <div key={lifestyleFactor.factor}>
                            <h4 className="mb-2">{lifestyleFactor.factor}</h4>
                            <RadioGroup value={lifestyleFactor.selection ?? undefined} onValueChange={(lifestyleValue) => handleLifestyleChange(lifestyleFactor.factor, lifestyleValue)}>
                                {lifestyleFactor.options.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={option} />
                                        <Label htmlFor={option} className="text-sm">
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex space-x-4">
                <Button 
                    onClick={prevStep} 
                    variant="outline" 
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button 
                    onClick={handleSkip} 
                    variant="outline" 
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    Skip
                </Button>
                <Button 
                    onClick={handleSubmit}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Complete"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {renderProgressBar()}

                <div className="bg-white rounded-lg shadow-sm p-8">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>
            </div>
        </div>
    )
}