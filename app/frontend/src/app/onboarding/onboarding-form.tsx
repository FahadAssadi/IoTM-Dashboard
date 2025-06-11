"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowRight, ArrowLeft } from "lucide-react"
import onboardingScaffold from "./onboarding-scaffold.json";

// Implementation of this may be overcomplicated for our use case - sorry
const healthConditionColumns = 2;

export default function OnboardingForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [onboardingForm, setOnboardingForm] = useState(onboardingScaffold);

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
            <p className="text-gray-600">This step is intentionally left blank as requested</p>
        </div>

        <Card className="text-center py-16">
            <CardContent>
            <p className="text-gray-500">Personal information form would go here</p>
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