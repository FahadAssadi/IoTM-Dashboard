import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";

export type BPMDataPoint = {
  start: string;                // ISO datetime string
  end: string;                  // ISO datetime string
  points: number;
  averageBpm: number;
  standardDeviation: number;
  durationHours: number;
  category: string;
};

export async function loadBPM(): Promise<BPMDataPoint[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!user) {
      console.error("Unable to retrieve userId");
      return [];
    }

    const response = await fetch(`http://localhost:5225/api/HealthConnect/bpm/${user.id}`, {
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