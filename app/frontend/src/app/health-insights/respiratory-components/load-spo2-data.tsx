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
    console.log("Fetched BPM data:", data_json);
    return data_json;
  } catch (err) {
    toast.error("Error: Could not load user SpO2 data");
    console.error("Error fetching BPM data:", err);
    return [];
  }
}