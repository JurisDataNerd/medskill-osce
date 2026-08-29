import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { joinPresence } from "@/services/realtimeTimerService";
import { getSessionParticipants } from "@/services/session.service";

export function useParticipantPresence(sessionId) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [candidateApprovalStatus, setCandidateApprovalStatus] = useState("approved");

  // Real-time Presence Tracking for Waiting Room
  useEffect(() => {
    if (!sessionId) return;

    let cleanupPresence = null;
    async function initPresence() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let full_name =
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email ||
          "Tidak ada data";
        let nim = user?.user_metadata?.nim || "";

        if (user?.id) {
          const { data: prof } = await supabase
            .schema("public")
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          if (prof?.full_name) full_name = prof.full_name;

          const { data: partData } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("nim")
            .eq("session_id", sessionId)
            .or(`user_id.eq.${user.id},email.eq.${user.email}`)
            .maybeSingle();

          if (partData?.nim) nim = partData.nim;
        }

        const userState = {
          user_id: user?.id || user?.email || `participant-${Date.now()}`,
          full_name,
          role: "participant",
          nim,
          email: user?.email,
        };

        cleanupPresence = joinPresence(sessionId, userState, (users) => {
          setOnlineUsers(users || []);
        });
      } catch (err) {
        console.error("Presence tracking error:", err);
      }
    }

    initPresence();

    return () => {
      if (cleanupPresence) cleanupPresence();
    };
  }, [sessionId]);

  // Approval Guard State Check
  useEffect(() => {
    async function checkApprovalGuard() {
      if (!sessionId) return;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const list = await getSessionParticipants(sessionId);
        const p = list.find(
          (item) =>
            (user?.id && item.user_id === user.id) ||
            (user?.email && item.email === user.email)
        );
        if (p) {
          setCandidateApprovalStatus((p.status || "pending").toLowerCase());
        }
      } catch (e) {
        console.warn("Approval guard error:", e);
      }
    }
    checkApprovalGuard();
  }, [sessionId]);

  return {
    onlineUsers,
    candidateApprovalStatus,
  };
}
