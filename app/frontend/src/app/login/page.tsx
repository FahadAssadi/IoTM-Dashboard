// page.tsx

/**
 * @file Defines the login page of the application.
 *
 * Renders the `LoginSignUpForm` component with the "login" tab selected by default.
 * Acts as the entry point for user authentication in the Next.js app.
 */

import LoginSignUpForm from "./auth-tabs"

export default function LoginPage() {
    return (
        <main id="main-content" className="w-full flex flex-col gap-4 p-4 md:gap-8 md:p-6 bg-slate-50" role="main">
            <div className="pt-12">
                <LoginSignUpForm tabProp="login"/>
            </div>
        </main>
    )
}