import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";

export type BPMCategory = "220+"|"0 - 60"|"60 - 80"|"80 - 100"|"100 - 120"|"120 - 140"|"140 - 160"|"160 - 180"|"180 - 200"|"200 - 220"

export type BPMDataPoint = {
    start: number;                // ISO datetime string
    end: number;                  // ISO datetime string
    points: number;
    averageBpm: number;
    standardDeviation: number;
    durationHours: number;
    category: BPMCategory;
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
		return data_json;
	} catch (err) {
		toast.error("Error: Could not load user BPM data");
		console.error("Error fetching BPM data:", err);
		return [];
	}
	}