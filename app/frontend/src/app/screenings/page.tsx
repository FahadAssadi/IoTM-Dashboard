// page.tsx

/**
 * @file Provides the `/screenings` page component that renders the
 * `HealthScreenings` feature with heading and description.
 * 
 * @remarks
 * This page:
 * - Wraps the `HealthScreenings` component in the route layout
 * - Provides page-level heading and introductory copy
 * - Leaves data fetching and interactions to `HealthScreenings`
 *
 * Used as the Next.js route entry point for viewing and managing screenings.
 */

import HealthScreenings from "./health-screenings"

export default function Home() {
  return (
    <main className="min-h-screen flex-1 overflow-auto bg-slate-50">
      <div className="p-6 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Health Screenings</h1>
        </div>
        <p className="text-muted-foreground mb-8">Track and manage your recommended health screenings and checkups.</p>
        <HealthScreenings />
      </div>
    </main>
  )
}
