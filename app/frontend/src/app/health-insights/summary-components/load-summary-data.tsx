import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";

export type HealthSummaryPoint = {
    start: number;
    end: number;
    durationHours?: number;
    averageSpO2?: number;
    averageBpm?: number;
    averageDiastolic?: number;
    averageSystolic?: number;
}

export async function loadSummaryData(): Promise<HealthSummaryPoint[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!user) {
      console.error("Unable to retrieve userId");
      return [];
    }

    const response = await fetch(`http://localhost:5225/api/HealthConnect/healthSummary/${user.id}`, {
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
    console.log("Fetched Summary data:", data_json);
    return data_json;
  } catch (err) {
    toast.error("Error: Could not load user healthSummary data");
    console.error("Error fetching BPM data:", err);
    return [];
  }
}