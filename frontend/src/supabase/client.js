import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://djigelqahkzfmwvpncvr.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWdlbHFhaGt6Zm13dnBuY3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODY3MzUsImV4cCI6MjA3NTY2MjczNX0.YPdfVwwW4VbrZ8fkteErd_canO1NUWrT0DYJHE1N4DI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);