import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://djigelqahkzfmwvpncvr.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.s6Z1..."; // Fallback placeholder if env not set

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "osce",
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseEnabled = () => {
  return import.meta.env.VITE_USE_SUPABASE === "true";
};
