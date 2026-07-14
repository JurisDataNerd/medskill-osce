import { supabase } from "@/supabase/client";

export function subscribePresence(callback) {
  return supabase
    .channel("presence")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "osce_presence",
      },
      callback
    )
    .subscribe();
}