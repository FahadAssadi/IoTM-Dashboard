/**
 * Timeline badge rendering tests
 * - overdue: date in the past => Overdue badge
 * - due-soon: within or equal to 14 days => Due Soon badge
 * - upcoming: beyond 14 days => no badge
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import HealthScreeningTimeline, { type TimelineItem } from "../src/app/screenings/health-screenings-timeline"

function buildItem(offsetDays: number, overrides: Partial<TimelineItem> = {}): TimelineItem {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + offsetDays)
  const iso = date.toISOString()
  return {
    scheduledScreeningId: `id-${offsetDays}-${Math.random().toString(36).slice(2, 7)}`,
    guidelineName: `Check ${offsetDays}`,
    guidelineId: `g-${offsetDays}`,
    scheduledDate: iso,
    month: "",
    ...overrides,
  }
}

describe("HealthScreeningTimeline badges", () => {
  test("renders Overdue badge for past dates", () => {
    const items: TimelineItem[] = [buildItem(-1)]
    render(<HealthScreeningTimeline timelineItems={items} />)
    // Group title exists
    expect(screen.getByText(/Upcoming Screenings/i)).toBeInTheDocument()
    // Badge text
    expect(screen.getByText(/Overdue/i)).toBeInTheDocument()
  })

  test("renders Due Soon badge for dates within 14 days", () => {
    const items: TimelineItem[] = [buildItem(7)]
    render(<HealthScreeningTimeline timelineItems={items} />)
    expect(screen.getByText(/Due Soon/i)).toBeInTheDocument()
  })

    test("renders Due Soon badge for dates equal to 14 days", () => {
    const items: TimelineItem[] = [buildItem(14)]
    render(<HealthScreeningTimeline timelineItems={items} />)
    expect(screen.getByText(/Due Soon/i)).toBeInTheDocument()
  })

  test("renders no badge for upcoming dates beyond 14 days", () => {
    const items: TimelineItem[] = [buildItem(30)]
    render(<HealthScreeningTimeline timelineItems={items} />)
    // Should show item title but no badge text
    expect(screen.getByText(/Check 30/i)).toBeInTheDocument()
    expect(screen.queryByText(/Overdue/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Due Soon/i)).not.toBeInTheDocument()
  })
})
