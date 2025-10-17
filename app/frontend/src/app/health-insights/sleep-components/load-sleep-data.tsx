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
    console.log("Fetched BPM data:", data_json);
    return data_json;
  } catch (err) {
    toast.error("Error: Could not load user data");
    console.error("Error fetching BPM data:", err);
    return [];
  }
}