import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface MotoDatabase {
  public: {
    Tables: {
      motorcycles: {
        Row: {
          id:string;
          user_id:string;
          brand:string;
          model:string;
          variant:string|null;
          production_year:number|null;
          plate_number:string|null;
          purchase_date:string|null;
          initial_usage_date:string|null;
          initial_kilometers:number;
          current_kilometers:number;
          manual_reference:string|null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      maintenance_tasks: {
        Row: { id:string };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      maintenance_records: {
        Row: {
          id:string;
          motorcycle_id:string;
          task_id:string;
          service_date:string;
          kilometers:number;
          work_description:string;
          work_type:string;
          cost:number|null;
          workshop:string|null;
          notes:string|null;
          created_at:string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      odometer_records: {
        Row: {
          id:string;
          motorcycle_id:string;
          previous_kilometers:number;
          kilometers:number;
          recorded_at:string;
          correction:boolean;
          reason:string|null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

let browserClient: SupabaseClient<MotoDatabase> | null = null;

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key || !/^https?:\/\//i.test(url)) return false;
  if (key.startsWith("sb_secret_")) return false;
  if (key.startsWith("eyJ")) {
    try {
      const base64 = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const decoded = typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (payload.role === "service_role") return false;
    } catch {
      return false;
    }
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  try {
    new URL(url);
  } catch {
    return null;
  }
  browserClient ??= createClient<MotoDatabase>(url, key);
  return browserClient;
}
