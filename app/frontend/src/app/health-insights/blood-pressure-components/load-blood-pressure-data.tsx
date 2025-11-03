// load-blood-pressure-data.tsx

/**
 * @file Provides the `loadBloodPressure` function – retrieves the user’s blood pressure data
 * including systolic and diastolic readings, variability, and category.
 *
 * @remarks
 * This module handles:
 * - Authenticating requests with the current Supabase session token
 * - Fetching blood pressure data points with start/end times, averages, standard deviations, duration, and category
 * - Returning an empty array if no data is available or an error occurs
 * - Displaying error notifications via `react-toastify`
 *
 * Used within heart health dashboard components to visualize blood pressure trends
 * and assess cardiovascular risk over time.
 */

import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";

export type BloodPressureCategory = "Optimal"| "Normal" | "High - Normal" | "Grade 1 (mild) Hypertension" | "Grade 2 (moderate) Hypertension" | "Grade 3 (severe) Hypertension" ;

export type BloodPressureDataPoint = {
  start: number;                // ISO datetime string
  end: number;                  // ISO datetime string
  points: number;
  averageSystolic: number;
  averageDiastolic: number;
  systolicStandardDeviation: number;
  diastolicStandardDeviation: number;
  durationHours: number;
  category: BloodPressureCategory;
};

export async function loadBloodPressure(): Promise<BloodPressureDataPoint[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!user) {
      console.error("Unable to retrieve userId");
      return [];
    }

    const response = await fetch(`http://localhost:5225/api/HealthConnect/bloodPressure/${user.id}`, {
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
    toast.error("Error: Could not load user Blood Pressure data");
    console.error("Error fetching BPM data:", err);
    return [];
  }
}
