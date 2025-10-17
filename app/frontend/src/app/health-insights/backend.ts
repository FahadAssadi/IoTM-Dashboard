// Temporary Location
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";

// Blood Pressure

export type BloodPressureDataPoint = {
  start: string;                // ISO datetime string
  end: string;                  // ISO datetime string
  points: number;
  averageSystolic: number;
  averageDiastolic: number;
  systolicStandardDeviation: number;
  diastolicStandardDeviation: number;
  durationHours: number;
  category: string;
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
    console.log("Fetched BPM data:", data_json);
    return data_json;
  } catch (err) {
    toast.error("Error: Could not load user data");
    console.error("Error fetching BPM data:", err);
    return [];
  }
}

export type RecentSummary = {
  bpm: number | string
  spO2: number | string
  systolicBloodPressure: number | string
  diastolicBloodPressure: number | string
}

export async function loadRecentSummary(): Promise<RecentSummary> {
  const blankRecentSummary : RecentSummary = {
    bpm: "no data",
    spO2: "no data",
    systolicBloodPressure: "no data",
    diastolicBloodPressure: "no data"
  };
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!user) {
      console.error("Unable to retrieve userId");
      return blankRecentSummary;
    }

    const response = await fetch(`http://localhost:5225/api/HealthConnect/HealthSummary/recent/${user.id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 404) {
      console.warn("No BPM data found");
      return blankRecentSummary;
    }

    const data_json = await response.json();
    console.log("Fetched BPM data:", data_json);
    // Ensure all values are defined — fallback to "no data" if missing
    const summary: RecentSummary = {
      bpm: data_json.bpm ?? "no data",
      spO2: data_json.spO2 ?? "no data",
      systolicBloodPressure: data_json.systolicBloodPressure ?? "no data",
      diastolicBloodPressure: data_json.diastolicBloodPressure ?? "no data"
    };
    return summary;
    
  } catch (err) {
    toast.error("Error: Could not load user data");
    console.error("Error fetching BPM data:", err);
    return blankRecentSummary;
  }
}