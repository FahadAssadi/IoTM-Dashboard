"use client"

import { useState } from "react"
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

export default function OnboardingForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [onboardingForm, setOnboardingForm] = useState<OnboardingFormType>(
        onboardingScaffold as OnboardingFormType);

    const totalSteps = 3
    const progressPercentage = (currentStep / totalSteps) * 100

    const nextStep = () => {
        if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
        }
    }

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
                item.factor === factor ? { ...item, selection: selection} : item
            );
            console.log("LifestyleFactor: " + factor + " has been set to " + selection);
            return {
                ...prevForm,
                lifestyleFactors: updatedLifestyleFactors
            };
        });
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to HealthTrack</h1>
            <p className="text-gray-600">{"Let's set up your profile to personalize your health journey"}</p>
        </div>

        <Card className="text-left">
            <CardHeader>
            <CardTitle className="text-xl">Getting Started</CardTitle>
            <p className="text-gray-600">{"We'll guide you through a few quick steps to set up your account"}</p>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                <h3 className="font-medium">{"What we'll cover:"}</h3>
                <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full" />
                    <span>Personal information</span>
                </li>
                <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full" />
                    <span>Health conditions (optional)</span>
                </li>
                </ul>
            </div>
            </CardContent>
        </Card>

        <Button onClick={nextStep} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3">
            {"Let's Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        </div>
    )

    const renderStep2 = () => (
        <div className="text-center space-y-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h1>
            <p className="text-gray-600">Tell us a bit about yourself to personalise the experience</p>
        </div>

        <Card className="text-left">
            <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <p className="text-sm text-gray-600">This information helps us provide personalised health reccomendations</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 pb-2">
                    <div className="flex flex-col">
                        <label
                            htmlFor="firstName"
                            className="font-medium text-gray-700 ml-1">
                            First Name
                        </label>
                        <div className="relative mt-1">
                            <Input
                                id="firstName"
                                type="text"
                                autoCorrect="off"
                                value={onboardingForm.firstName}
                                onChange={(e) => handleStringChange("firstName", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label
                            htmlFor="lastName"
                            className="font-medium text-gray-700 ml-1">
                            Last Name
                        </label>
                        <div className="relative mt-1">
                            <Input
                                id="lastName"
                                type="text"
                                autoCorrect="off"
                                value={onboardingForm.lastName}
                                onChange={(e) => handleStringChange("lastName", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="pb-2">
                    <label
                        htmlFor="email"
                        className="font-medium text-gray-700 ml-1">
                        Email
                    </label>
                    <div className="relative mt-1">
                        <Input
                            id="email"
                            type="email"
                            autoCorrect="off"
                            autoCapitalize="none"
                            autoComplete="email"
                            value={onboardingForm.email}
                            onChange={(e) => handleStringChange("email", e.target.value)}
                        />
                    </div>
                </div>
                <div className="pb-2">
                    <label
                        htmlFor="date"
                        className="font-medium text-gray-700 ml-1">
                        Date
                    </label>
                    <div className="relative mt-1">
                        <Input
                            id="date"
                            type="date"
                            value={onboardingForm.dob}
                            onChange={(e) => handleStringChange("dob", e.target.value)}
                        />
                    </div>
                </div>
                <div className="pb-2">
                    <label
                        htmlFor="sex"
                        className="font-medium text-gray-700 ml-1">
                        Sex
                    </label>
                    <div className="relative mt-1">
                        <RadioGroup value={onboardingForm.sex} onValueChange={(sex) => handleStringChange("sex", sex)}>
                            <div className="flex items-center space-x-3 p-1">
                                {/* Should this also be generated? */}
                                <RadioGroupItem value="male" id="male"/>
                                <Label htmlFor="male">Male</Label>
                                <RadioGroupItem value="female" id="female"/>
                                <Label htmlFor="female">Female</Label>
                                <RadioGroupItem value="other" id="other"/>
                                <Label htmlFor="other">Other/Prefer not to say</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pb-2">
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
                            State/Territory
                        </label>
                        <div className="relative mt-1">
                            <Input
                                id="state"
                                type="state"
                                autoCorrect="state"
                                value={onboardingForm.state}
                                onChange={(e) => handleStringChange("state", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label
                            htmlFor="postcode"
                            className="font-medium text-gray-700 ml-1">
                            Postcode
                        </label>
                        <div className="relative mt-1">
                            <Input
                                id="postcode"
                                type="number"
                                autoCorrect="off"
                                value={onboardingForm.postcode}
                                onChange={(e) => handleNumberChange("postcode", e.target.value)}
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
                        <RadioGroup value={lifestyleFactor.selection} onValueChange={(lifestyleValue) => handleLifestyleChange(lifestyleFactor.factor, lifestyleValue)}>
                            {lifestyleFactor.options.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={option}/>
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
            <Button onClick={prevStep} variant="outline" className="flex-1">
            Back
            </Button>
            <Button variant="outline" className="flex-1">
            Skip
            </Button>
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
            Continue
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