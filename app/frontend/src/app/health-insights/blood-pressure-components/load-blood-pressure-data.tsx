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
