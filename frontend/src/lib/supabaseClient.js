export { supabase } from "@/supabase/client";

export const isSupabaseEnabled = () => {
  return import.meta.env.VITE_USE_SUPABASE === "true";
};
