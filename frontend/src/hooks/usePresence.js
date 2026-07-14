import { useEffect } from "react";
import { updatePresence } from "@/services/presence.service";

export default function usePresence() {
  useEffect(() => {
    updatePresence("online");

    const interval = setInterval(() => {
      updatePresence("online");
    }, 10000);

    return () => clearInterval(interval);
  }, []);
}