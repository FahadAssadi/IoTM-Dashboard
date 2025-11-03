// calendar.ts

/**
 * @file Calendar utilities for building Google Calendar event URLs.
 *
 * @remarks
 * Exposes helpers used by multiple components to generate a Google Calendar
 * "Add event" URL from a simple event object, avoiding duplication.
 */

// Google Calendar helper: format Date to YYYYMMDDTHHMMSSZ
export function formatGoogleDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export type CalEvent = {
  title: string
  description?: string
  startTime: string
  endTime?: string
  location?: string
  timezone?: string
}

// Build a Google Calendar "Add event" URL (opens Google Calendar UI in a new tab)
export function getGoogleCalendarUrl(event: CalEvent): string {
  const start = formatGoogleDate(new Date(event.startTime));
  const end = event.endTime ? formatGoogleDate(new Date(event.endTime)) : start;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "",
    details: event.description || "",
    location: event.location || "",
    dates: `${start}/${end}`,
    ctz: event.timezone || "UTC",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
