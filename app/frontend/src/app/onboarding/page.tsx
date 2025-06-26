"use client"

import OnboardingForm from "./onboarding-form"

export default function OnboardingPage() {
    return (
        <main id="main-content" className="w-full flex flex-col gap-4 p-4 md:gap-8 md:p-6 bg-slate-50" role="main">
            <div className="pt-12">
                <OnboardingForm/>
            </div>
        </main>
    )
}