"use client"

import React, { useState, useEffect } from "react"
import { Calendar, CalendarClock, Eye, EyeOff, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import HealthScreeningTimeline, { TimelineItem } from "./health-screenings-timeline"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log("API Base URL:", apiBaseUrl);

export interface ScreeningItem {
  guidelineId: string
  name: string
  lastScheduled?: string
  status?: string
  isRecurring: boolean
  screeningType?: string
  recommendedFrequency?: string
  description?: string
  eligibility?: string
  minAge?: number
  maxAge?: number
  cost?: string
  delivery?: string
  link?: string
}

function getTimelineStatus(scheduledDate?: string, recommendedFrequency?: number): "due-soon" | "overdue" | "upcoming" | undefined {
  if (!scheduledDate || !recommendedFrequency) return undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(scheduledDate)
  target.setHours(0, 0, 0, 0)

  if (target < today) return "overdue"

  const twoWeeksFromNow = new Date(today)
  twoWeeksFromNow.setDate(today.getDate() + 14)

  if (target >= today && target <= twoWeeksFromNow) return "due-soon"

  return "upcoming"
}

function formatDateForInput(dateStr?: string) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 10)
}

function formatDateDDMMYYYY(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function HealthScreenings() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [datePickerOpen, setDatePickerOpen] = useState<{ open: boolean; screening?: ScreeningItem; timelineItemId?: string }>({ open: false })
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [hiddenScreenings, setHiddenScreenings] = useState<ScreeningItem[]>([])
  const [showHidden, setShowHidden] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const [selectedType, setSelectedType] = useState<string>("allcategories")

  const [allScreenings, setAllScreenings] = useState<ScreeningItem[]>([])

  const [visibleScreenings, setVisibleScreenings] = useState<ScreeningItem[]>([]);

  const [feedbackMessage, setFeedbackMessage] = useState<string>("") // feedback message for fetching new screenings

  const [page, setPage] = useState(1);
  const pageSize = 4;

  // Fetch timeline items from backend
  const fetchTimelineItems = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/scheduled`);
      const data = await res.json();
      // Map backend data to TimelineItem[]
      setTimelineItems(
        Array.isArray(data)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? data.map((item: any) => ({
              id: item.scheduledScreeningId,
              guidelineId: item.guidelineId,
              name: item.guidelineName,
              dueDate: item.scheduledDate,
              month: new Date(item.scheduledDate).toLocaleString("default", { month: "long" }),
              status: getTimelineStatus(
                item.scheduledDate,
                item.defaultFrequencyMonths
              ) ?? "upcoming",
            }))
          : []
      );
    } catch {
      setTimelineItems([]);
    }
  };

  useEffect(() => {
    fetchTimelineItems();
  }, []);

  // Fetch all screenings
  const fetchAllScreenings = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/?page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const screenings = data.map((item: any) => ({
        screeningId: item.screeningId,
        guidelineId: item.guidelineId,
        name: item.guideline?.name ?? "",
        lastScheduled: formatDateDDMMYYYY(item.lastScheduledDate),
        isRecurring: item.guideline?.isRecurring ?? false,
        screeningType: item.guideline?.screeningType,
        recommendedFrequency: item.guideline?.recommendedFrequency,
        description: item.guideline?.description,
        cost: item.guideline?.cost,
        delivery: item.guideline?.delivery,
        link: item.guideline?.link,
        scheduledScreenings: item.scheduledScreenings ?? [],
        status: item.status,
        completedDate: item.completedDate,
        nextDueDate: item.nextDueDate,
        reminderSent: item.reminderSent,
      }));

      setAllScreenings(screenings);
      setHiddenScreenings(screenings.filter((s: ScreeningItem) => s.status === "skipped"));
      setVisibleScreenings(screenings.filter((s: ScreeningItem) => s.status !== "skipped"));
    } catch (err) {
      console.error("Failed to fetch screenings", err);
    }
  };

  useEffect(() => {
    fetchAllScreenings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Filter out hidden screenings for visible list
  // Visible screenings: status !== "skipped"
  const screenings = visibleScreenings.filter(
    (screening) =>
      selectedType === "allcategories" ||
      (screening.screeningType?.toLowerCase().replace(/\s+/g, "") === selectedType)
  )

  const screeningTypes: string[] = [
    "All Categories",
    ...Array.from(new Set(allScreenings.map(s => s.screeningType).filter((type): type is string => typeof type === "string")))
  ];

  // Handle scheduling a screening
  const handleSchedule = (screening: ScreeningItem) => {
    setErrorMessage("")
    setDatePickerOpen({ open: true, screening })
    setSelectedDate(formatDateForInput(screening.lastScheduled))
  }

  // Handle editing a timeline item
  const handleEditTimelineItem = (item: TimelineItem) => {
    setErrorMessage("")
    setDatePickerOpen({ open: true, timelineItemId: item.id })
    setSelectedDate(formatDateForInput(item.dueDate))
  }

  // Handle removing a timeline item
  const handleRemoveTimelineItem = async (id: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/schedule/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setErrorMessage("Failed to remove scheduled screening.");
        return;
      }
      setErrorMessage("");

      // Refetch timeline and all screenings to update lastScheduled
      await fetchTimelineItems();
      await fetchAllScreenings();
    } catch {
      setErrorMessage("Failed to remove scheduled screening.");
    }
  };

  // Handle date selection and add/update timeline
  const handleDateSelect = async () => {
    if (!selectedDate) return;

    if (datePickerOpen.timelineItemId) {
      // Editing an existing timeline item
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/UserScreenings/schedule/${datePickerOpen.timelineItemId}?newDate=${selectedDate}`,
          { method: "PUT" }
        );
        if (!res.ok) {
          setErrorMessage("Failed to update scheduled screening.");
          return;
        }
        setErrorMessage("");
        // Refetch timeline and all screenings to update lastScheduled
        await fetchTimelineItems();
        await fetchAllScreenings();
      } catch {
        setErrorMessage("Failed to update scheduled screening.");
      }
      setDatePickerOpen({ open: false });
      setSelectedDate("");
    } else if (datePickerOpen.screening) {
      const screeningId = datePickerOpen.screening.guidelineId;
      const dueDate = selectedDate;

      try {
        const res = await fetch(
          `${apiBaseUrl}/api/UserScreenings/schedule?guidelineId=${screeningId}&scheduledDate=${dueDate}`,
          { method: "POST" }
        );
        if (!res.ok) {
          setErrorMessage("Failed to schedule screening.");
          return;
        }
        setErrorMessage("");

        // Refetch timeline and all screenings to update lastScheduled
        await fetchTimelineItems();
        await fetchAllScreenings();
      } catch {
        setErrorMessage("Failed to schedule screening.");
      }

      setDatePickerOpen({ open: false });
      setSelectedDate("");
    }
  }

  // Hide a screening
  const handleHideScreening = async (screening: ScreeningItem) => {
    try {
      await fetch(`${apiBaseUrl}/api/UserScreenings/hide/${screening.guidelineId}`, { method: "PUT" });
      await fetchAllScreenings();
    } catch {
      setErrorMessage("Failed to hide screening.");
    }
  };

  // Unhide a screening
  const handleUnhideScreening = async (screening: ScreeningItem) => {
    try {
      await fetch(`${apiBaseUrl}/api/UserScreenings/unhide/${screening.guidelineId}`, { method: "PUT" });
      await fetchAllScreenings();
    } catch {
      setErrorMessage("Failed to unhide screening.");
    }
  };

  // Unhide all hidden screenings
  const handleUnhideAll = async () => {
    try {
      // Unhide each hidden screening via backend
      await Promise.all(
        hiddenScreenings.map(screening =>
          fetch(`${apiBaseUrl}/api/UserScreenings/unhide/${screening.guidelineId}`, { method: "PUT" })
        )
      );
      await fetchAllScreenings();
      setShowHidden(false);
    } catch {
      setErrorMessage("Failed to unhide all screenings.");
    }
  }

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Recommended Health Screenings</h2>
              <p className="text-sm text-muted-foreground">
                Your personalised health screening timeline based on your profile
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Button
                  variant="outline"
                  aria-label="Check for new screenings"
                  onClick={async () => {
                    setFeedbackMessage("")
                    try {
                      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/new-screenings`, { method: "POST" })
                      const data = await res.json()
                      if (!Array.isArray(data) || data.length === 0) {
                        setFeedbackMessage("No new screenings available.")
                      } else {
                        setFeedbackMessage(`${data.length} new screening${data.length > 1 ? "s" : ""} added.`)
                        await fetchAllScreenings();
                      }
                    } catch {
                      setFeedbackMessage("Failed to check for new screenings.")
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <span
                  className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
                >
                  Fetch new screenings
                </span>
              </div>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {screeningTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type?.toLowerCase().replace(/\s+/g, "")}
                    >{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fetch screenings feedback Message */}
          {feedbackMessage && (
            <div className="mb-2 text-sm text-teal-700">{feedbackMessage}</div>
          )}

          {/* Visible Screenings */}
          {!showHidden && (
            <div className="space-y-4">
              {screenings.length === 0 && (
                <div className="text-center text-slate-500 py-8">No screenings to show.</div>
              )}
              {screenings.map((screening) => (
                <Card key={screening.guidelineId} className="p-2 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100">
                        <Calendar className="h-4 w-4 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{screening.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span>Last scheduled: {screening.lastScheduled || "Not recorded"}</span>
                          {screening.status === "overdue" && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Overdue</Badge>
                          )}
                          {screening.status === "due-soon" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Due Soon</Badge>
                          )}
                        </div>
                        {screening.description && (
                          <div className="text-xs text-gray-500 mt-1">{screening.description}</div>
                        )}
                        {screening.recommendedFrequency && (
                          <div className="text-xs text-gray-500 mt-1">Recommended frequency: {screening.recommendedFrequency}</div>
                        )}
                        {screening.cost && (
                          <div className="text-xs text-gray-500 mt-1">Cost: {screening.cost}</div>
                        )}
                        {screening.delivery && (
                          <div className="text-xs text-gray-500 mt-1">Delivery: {screening.delivery}</div>
                        )}
                        {screening.link && (
                          <a href={screening.link} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 underline mt-1 block">
                            Learn more
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" aria-label="Hide" onClick={() => handleHideScreening(screening)}>
                        <EyeOff className="w-5 h-5" />
                      </Button>
                      <Button variant="default" onClick={() => handleSchedule(screening)}>
                        Schedule
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Hidden Screenings */}
          {showHidden && (
            <div className="space-y-4">
              {hiddenScreenings.length === 0 && (
                <div className="text-center text-slate-500 py-8">No hidden screenings.</div>
              )}
              {hiddenScreenings.map((screening) => (
                <Card key={screening.guidelineId} className="p-2 rounded bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-200">
                        <Calendar className="h-4 w-4 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{screening.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span>Last scheduled: {screening.lastScheduled || "Not recorded"}</span>
                          {screening.status === "overdue" && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">Overdue</Badge>
                          )}
                          {screening.status === "due-soon" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Due Soon</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="ml-2">Frequency: {screening.recommendedFrequency}</span>
                        </div>
                        {screening.description && (
                          <div className="text-xs text-gray-500 mt-1">{screening.description}</div>
                        )}
                        {screening.cost && (
                          <div className="text-xs text-gray-500 mt-1">Cost: {screening.cost}</div>
                        )}
                        {screening.delivery && (
                          <div className="text-xs text-gray-500 mt-1">Delivery: {screening.delivery}</div>
                        )}
                        {screening.link && (
                          <a href={screening.link} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 underline mt-1 block">
                            Learn more
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" aria-label="Unhide" onClick={() => handleUnhideScreening(screening)}>
                        <Eye className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {hiddenScreenings.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full border-teal-700 text-teal-800 hover:bg-teal-50 mt-4"
                  onClick={handleUnhideAll}
                >
                  Unhide All
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {!showHidden ? (
            <>
              <div className="flex justify-between w-full mb-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={visibleScreenings.length < pageSize}
                >
                  Next
                </Button>
              </div>
              <div className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-teal-700 text-teal-800 hover:bg-teal-50"
                  onClick={() => setShowHidden(true)}
                >
                  View Hidden Screenings
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full">
              <Button
                variant="outline"
                className="w-full border-teal-700 text-teal-800 hover:bg-teal-50"
                onClick={() => setShowHidden(false)}
              >
                Show Screenings
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Date Picker Modal */}
      {datePickerOpen.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-4 min-w-[320px]">
            <h3 className="font-semibold text-lg mb-2">
              {datePickerOpen.timelineItemId ? "Edit Due Date" : "Select Due Date"}
            </h3>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value)
                setErrorMessage("")
              }}
            />
            {errorMessage && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDatePickerOpen({ open: false })}>Cancel</Button>
              <Button
                variant="default"
                onClick={handleDateSelect}
                disabled={!selectedDate || !!errorMessage}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Health Screenings Timeline */}
      <HealthScreeningTimeline
        timelineItems={timelineItems}
        onEdit={handleEditTimelineItem}
        onRemove={handleRemoveTimelineItem}
      />
    </>
  )
}
