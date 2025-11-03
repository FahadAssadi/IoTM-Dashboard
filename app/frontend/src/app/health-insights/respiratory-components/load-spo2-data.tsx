// load-spo2-data.tsx

/**
 * @file Provides the `loadSpO2` function – fetches the user’s SpO₂ (blood oxygen) data.
 *
 * @remarks
 * This module handles:
 * - Authenticating requests using the current Supabase session token
 * - Returning structured SpO₂ data points with start/end times, averages, standard deviation, duration, and category
 * - Returning an empty array if no data is available or an error occurs
 * - Logging errors and displaying notifications via `react-toastify`
 *
 * Used within respiratory health components to visualize blood oxygen levels and trends.
 */

import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";

export type SpO2Category = "Normal" | "Insufficient" | "Decreased" | "Severe";

export type SpO2DataPoint = {
  start: number;                // ISO datetime string
  end: number;                  // ISO datetime string
  points: number;
  averageSpO2: number;
  standardDeviation: number;
  durationHours: number;
  category: SpO2Category;
}

export async function loadSpO2(): Promise<SpO2DataPoint[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!user) {
      console.error("Unable to retrieve userId");
      return [];
    }

    const response = await fetch(`http://localhost:5225/api/HealthConnect/spo2/${user.id}`, {
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
    toast.error("Error: Could not load user SpO2 data");
    console.error("Error fetching BPM data:", err);
    return [];
  }
}