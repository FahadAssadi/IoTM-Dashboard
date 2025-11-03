// load-sleep-data.tsx

/**
 * @file Provides the `loadSleepData` function – fetches the user’s sleep data from HealthConnect.
 *
 * @remarks
 * This module handles:
 * - Authenticating requests using the current Supabase session token
 * - Returning structured sleep data points with start/end times, stage category, duration, and numeric stage value
 * - Returning an empty array if no data is available or an error occurs
 * - Logging errors and displaying notifications via `react-toastify`
 *
 * Used within sleep health components to visualize sleep patterns and summarize time spent in each sleep stage.
 */

import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";

export type SleepStageName = "DEEP" | "LIGHT" | "AWAKE" | "REM";

export const sleepStageMap: Record<SleepStageName, number> = {
  REM: 4,
  DEEP: 3,
  LIGHT: 2,
  AWAKE: 1
};

export type SleepDataPoint = {
  start: number;
  end: number;
  durationHours?: number;
  category: SleepStageName;
  stage?: number;
}

export async function loadSleepData(): Promise<SleepDataPoint[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!user) {
      console.error("Unable to retrieve userId");
      return [];
    }

    const response = await fetch(`http://localhost:5225/api/HealthConnect/sleep/${user.id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 404) {
      console.warn("No BPM data found");
      return [];
    }

    const data_json = await response.json();
    return data_json;
  } catch (err) {
    toast.error("Error: Could not load user sleep data");
    console.error("Error fetching BPM data:", err);
    return [];
  }
}