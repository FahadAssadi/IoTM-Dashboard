// Temporary Location
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5225/api";

// BPM STUFF
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

    const response = await fetch(`${API_BASE_URL}/healthconnect/bpm/${user.id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 404) {
      console.warn("No heart rate (BPM) data found");
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

    const response = await fetch(`${API_BASE_URL}/healthconnect/bloodPressure/${user.id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 404) {
      console.warn("No blood pressure data found");
      return [];
    }

    const data_json = await response.json();
    console.log("Fetched blood pressure data:", data_json);
    return data_json;
  } catch (err) {
    toast.error("Error: Could not load user data");
    console.error("Error fetching blood pressure data:", err);
    return [];
  }
}

// SpO2

export type SpO2DataPoint = {
  start: string;                // ISO datetime string
  end: string;                  // ISO datetime string
  points: number;
  averageSpO2: number;
  standardDeviation: number;
  durationHours: number;
  category: string;
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

    const response = await fetch(`${API_BASE_URL}/healthconnect/spo2/${user.id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 404) {
      console.warn("No SpO2 data found");
      return [];
    }

    const data_json = await response.json();
    console.log("Fetched SpO2 data:", data_json);
    return data_json;
  } catch (err) {
    toast.error("Error: Could not load user data");
    console.error("Error fetching SpO2 data:", err);
    return [];
  }
}