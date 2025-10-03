"use client"

import React, { useState, useEffect } from "react"
import { Calendar, CalendarClock, Eye, EyeOff, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import HealthScreeningTimeline, { getTimelineStatus, TimelineItem } from "./health-screenings-timeline"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

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

function formatDateForInput(dateStr?: string) {
  if (!dateStr) return "";
  // Handle dd/mm/yyyy format
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // Fallback for ISO or other formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
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

  // Pagination state
  const [page, setPage] = React.useState(1);
  const pageSize = 4;
  const [totalCount, setTotalCount] = React.useState(0);

  // Compute if there is a next page (based on totalCount from server)
  const hasNext = page * pageSize < totalCount;

  // Fetch timeline items from backend
  const fetchTimelineItems = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/scheduled`);
      const data = await res.json();
      // Map backend data to TimelineItem[]
      setTimelineItems(
        Array.isArray(data)
          ? data.map((item: TimelineItem) => ({
            scheduledScreeningId: item.scheduledScreeningId,
            guidelineId: item.guidelineId,
            guidelineName: item.guidelineName,
            scheduledDate: item.scheduledDate,
            month: new Date(item.scheduledDate).toLocaleString("default", { month: "long" }),
            status: getTimelineStatus(
              item.scheduledDate
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

  // Fetch visible (non-hidden) screenings with backend pagination
  const fetchAllScreenings = React.useCallback(async (): Promise<number> => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/?page=${page}&pageSize=${pageSize}`);
      const payload = await res.json(); // { items, totalCount, page, pageSize }
      const data = Array.isArray(payload.items) ? payload.items : [];
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

      setVisibleScreenings(screenings);
      setAllScreenings(screenings);
      const newTotal = payload.totalCount ?? 0;
      setTotalCount(newTotal);

      // If page emptied after an action (e.g., hiding), step back a page
      const totalPages = Math.max(1, Math.ceil(newTotal / pageSize));
      if (page > totalPages) {
        setPage(totalPages);
      } else if (screenings.length === 0 && page > 1) {
        setPage(page - 1);
      }

      return newTotal;
    } catch (err) {
      console.error("Failed to fetch screenings", err);
      setVisibleScreenings([]);
      setAllScreenings([]);
      setTotalCount(0);
      return 0;
    }
  }, [page]);

  useEffect(() => {
    fetchAllScreenings();
  }, [fetchAllScreenings, page]);

  // Fetch hidden screenings only when showHidden is true
  const fetchHiddenScreenings = React.useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/hidden`);
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const screenings = (Array.isArray(data) ? data : []).map((item: any) => ({
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
      setHiddenScreenings(screenings);
    } catch {
      setHiddenScreenings([]);
    }
  }, []);

  // Drive fetches from showHidden/page
  useEffect(() => {
    if (showHidden) {
      fetchHiddenScreenings();
    } else {
      fetchAllScreenings();
    }
  }, [showHidden, page, fetchAllScreenings, fetchHiddenScreenings]);

  // Handle scheduling a screening
  const handleSchedule = (screening: ScreeningItem) => {
    setErrorMessage("")
    setDatePickerOpen({ open: true, screening })
    setSelectedDate(formatDateForInput(screening.lastScheduled))
  }

  // Handle editing a timeline item
  const handleEditTimelineItem = (item: TimelineItem) => {
    setErrorMessage("")
    setDatePickerOpen({ open: true, timelineItemId: item.scheduledScreeningId })
    setSelectedDate(formatDateForInput(item.scheduledDate))
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

  // Archive a timeline item (scheduled screening)
  const handleArchiveTimelineItem = async (scheduledScreeningId: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/schedule/${scheduledScreeningId}/archive`, {
        method: "PUT"
      });
      if (!res.ok) throw new Error();
      // Refresh timeline and lists so UI updates (archived item disappears)
      await fetchTimelineItems();
      await fetchAllScreenings();
      
      if (showHidden) {
        await fetchHiddenScreenings();
      }
    } catch {
      setErrorMessage("Failed to archive scheduled screening.");
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
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/hide/${screening.guidelineId}`, { method: "PUT" });
      if (!res.ok) throw new Error();
      await fetchAllScreenings();
      await fetchHiddenScreenings();
    } catch {
      setErrorMessage("Failed to hide screening.");
    }
  };

  // Unhide a screening
  const handleUnhideScreening = async (screening: ScreeningItem) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/unhide/${screening.guidelineId}`, { method: "PUT" });
      if (!res.ok) throw new Error();
      await fetchHiddenScreenings();
      await fetchAllScreenings();
      if (showHidden && hiddenScreenings.length <= 1) setShowHidden(false);
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

  const screenings = visibleScreenings.filter(
    (screening) =>
      selectedType === "allcategories" ||
      (screening.screeningType?.toLowerCase().replace(/\s+/g, "") === selectedType)
  )

  // Build filter options
  const screeningTypes: string[] = [
    "All Categories",
    ...Array.from(new Set(allScreenings.map(s => s.screeningType).filter((type): type is string => typeof type === "string")))
  ];

  const [showArchived, setShowArchived] = useState(false);
  const [archivedTimelineItems, setArchivedTimelineItems] = useState<TimelineItem[]>([]);

  const fetchArchivedScreenings = React.useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/archived`);
      const data = await res.json();
      const items: TimelineItem[] = [];
      Object.values(data).forEach((value: unknown) => {
        if (Array.isArray(value)) {
          value.forEach((ss: Record<string, unknown>) => {
            items.push({
              scheduledScreeningId: ss.scheduledScreeningId as string,
              guidelineId: ss.guidelineId as string,
              guidelineName: ss.guidelineName as string,
              scheduledDate: ss.scheduledDate as string,
              month: new Date(ss.scheduledDate as string).toLocaleString("default", { month: "long" })
            });
          });
        }
      });
      items.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
      setArchivedTimelineItems(items);
    } catch {
      setArchivedTimelineItems([]);
    }
  }, []);

  useEffect(() => {
    if (showArchived) {
      fetchArchivedScreenings();
    }
  }, [showArchived, fetchArchivedScreenings]);

  // Handle delete of an archived screening
  const handleDeleteArchivedScreening = async (scheduledScreeningId: string) => {
    await fetch(
      `${apiBaseUrl}/api/UserScreenings/schedule/${scheduledScreeningId}`,
      { method: "DELETE" }
    );
    await fetchArchivedScreenings();
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Recommended Health Screenings</h2>
              <p className="text-sm text-muted-foreground">
                Your personalised health screening recommendations based on your profile. We try to keep the information in this list up to date, but please check the official guidelines for the most current information.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Disclaimer: This is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Button
                  variant="outline"
                  aria-label="Check for new screenings"
                  onClick={async () => {
                    setFeedbackMessage("");
                    try {
                      const prevTotal = totalCount;

                      const res = await fetch(`${apiBaseUrl}/api/UserScreenings/new-screenings`, { method: "POST" });
                      const data = await res.json();
                      const addedCount = Array.isArray(data) ? data.length : 0;

                      // Refetch to get the latest total after adds/removals
                      const newTotal = await fetchAllScreenings();

                      // Refresh the timeline because removals may delete scheduled items
                      await fetchTimelineItems();

                      // removed = prev + added - new
                      const removedCount = Math.max(0, prevTotal + addedCount - newTotal);

                      if (addedCount === 0 && removedCount === 0) {
                        setFeedbackMessage("No changes to your screenings.");
                      } else {
                        const parts: string[] = [];
                        if (addedCount > 0) parts.push(`${addedCount} new screening${addedCount > 1 ? "s" : ""} added`);
                        if (removedCount > 0) parts.push(`${removedCount} screening${removedCount > 1 ? "s" : ""} removed`);
                        setFeedbackMessage(parts.join(", ") + ".");
                      }
                    } catch {
                      setFeedbackMessage("Failed to check for new screenings.");
                    }
                  }}
                >
                  <RefreshCcw className="w-4 h-4" />
                </Button>
                <span
                  className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
                >
                  Update screenings list
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
                  disabled={!hasNext}
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
        onEdit={showArchived ? undefined : handleEditTimelineItem}
        onRemove={showArchived ? undefined : handleRemoveTimelineItem}
        onArchive={showArchived ? undefined : handleArchiveTimelineItem}
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived(!showArchived)}
        archivedTimelineItems={archivedTimelineItems}
        onDeleteArchived={handleDeleteArchivedScreening}
      />
    </>
  )
}
