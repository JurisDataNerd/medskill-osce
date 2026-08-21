import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calcRemaining,
  openWaitingRoom,
  startOsceSession,
  updateTimerPhase,
  setSessionCompletedWaiting,
  pauseTimer,
  resumeTimer,
  sendBroadcast,
  sendBellBroadcast,
  finishSession,
  subscribeToSession,
} from "@/services/realtimeTimerService";
import { supabase } from "@/lib/supabaseClient";

// In-Memory Database Simulator for Supabase OSCE Schema
function createMockSupabaseDatabase() {
  const db = {
    sessions: new Map(),
    session_timer_state: new Map(),
    broadcast_messages: [],
    session_participants: new Map(),
    session_examiners: new Map(),
    participant_answers: new Map(),
    channels: new Map(),
  };

  const channelSubscribers = new Map(); // topic -> { postgres_changes: [], broadcast: [], presence: [] }

  const mockClient = {
    _db: db,
    _subscribers: channelSubscribers,

    getChannels: vi.fn(() => Array.from(db.channels.values())),
    removeChannel: vi.fn((ch) => {
      const topic = ch.topic || `realtime:${ch.name}`;
      db.channels.delete(topic);
      channelSubscribers.delete(topic);
    }),

    channel: vi.fn((name, config = {}) => {
      const topic = `realtime:${name}`;
      if (!channelSubscribers.has(topic)) {
        channelSubscribers.set(topic, { postgres_changes: [], broadcast: [], presence: [] });
      }

      const subs = channelSubscribers.get(topic);

      const ch = {
        name,
        topic,
        config,
        on: vi.fn((type, filter, handler) => {
          if (type === "postgres_changes") {
            subs.postgres_changes.push({ filter, handler });
          } else if (type === "broadcast") {
            subs.broadcast.push({ event: filter.event, handler });
          } else if (type === "presence") {
            subs.presence.push({ event: filter.event, handler });
          }
          return ch;
        }),
        subscribe: vi.fn((cb) => {
          if (cb) cb("SUBSCRIBED");
          return ch;
        }),
        send: vi.fn(async ({ type, event, payload }) => {
          if (type === "broadcast") {
            const handlers = subs.broadcast.filter((h) => h.event === event);
            handlers.forEach((h) => h.handler({ payload }));
          }
          return {};
        }),
        presenceState: vi.fn(() => ({})),
        track: vi.fn().mockResolvedValue({}),
      };

      db.channels.set(topic, ch);
      return ch;
    }),

    schema: vi.fn((schemaName) => {
      return {
        from: (tableName) => {
          const query = {
            _selected: "*",
            _where: {},
            select: vi.fn((cols = "*") => {
              query._selected = cols;
              return query;
            }),
            eq: vi.fn((col, val) => {
              query._where[col] = val;
              return query;
            }),
            update: vi.fn((payload) => {
              return {
                eq: vi.fn((col, val) => {
                  const table = db[tableName];
                  if (table && table.has(val)) {
                    const current = table.get(val);
                    const updated = { ...current, ...payload };
                    table.set(val, updated);

                    // Trigger postgres_changes subscribers
                    for (const [, subs] of channelSubscribers.entries()) {
                      subs.postgres_changes
                        .filter((sub) => sub.filter.table === tableName)
                        .forEach((sub) => sub.handler({ new: updated, old: current }));
                    }

                    return {
                      select: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
                        maybeSingle: vi.fn().mockResolvedValue({ data: updated, error: null }),
                      })),
                      single: vi.fn().mockResolvedValue({ data: updated, error: null }),
                      maybeSingle: vi.fn().mockResolvedValue({ data: updated, error: null }),
                    };
                  }
                  return {
                    select: vi.fn(() => ({
                      single: vi.fn().mockResolvedValue({ data: null, error: null }),
                      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                    })),
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                  };
                }),
              };
            }),
            upsert: vi.fn((rows, opts = {}) => {
              const row = Array.isArray(rows) ? rows[0] : rows;
              const key = row.session_id || row.id;
              const table = db[tableName];
              const old = table ? table.get(key) : null;
              if (table) table.set(key, row);

              // Trigger postgres_changes subscribers
              for (const [, subs] of channelSubscribers.entries()) {
                subs.postgres_changes
                  .filter((sub) => sub.filter.table === tableName)
                  .forEach((sub) => sub.handler({ new: row, old }));
              }

              return {
                select: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ data: row, error: null }),
                  maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
                })),
                single: vi.fn().mockResolvedValue({ data: row, error: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
              };
            }),
            insert: vi.fn((rows) => {
              const row = Array.isArray(rows) ? rows[0] : rows;
              if (tableName === "broadcast_messages") {
                db.broadcast_messages.push(row);
              }
              return {
                select: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ data: row, error: null }),
                  maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
                })),
                single: vi.fn().mockResolvedValue({ data: row, error: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
              };
            }),
          };
          return query;
        },
      };
    }),
  };

  return mockClient;
}

describe("OSCE 1-Session Lifecycle & Realtime State Machine Simulation", () => {
  let mockSupabase;
  const SESSION_ID = "sess-osce-2026-wave1";
  const TOTAL_ROUNDS = 6;
  const STATION_MINUTES = 12;
  const TRANSITION_MINUTES = 2;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-21T08:00:00.000Z"));

    mockSupabase = createMockSupabaseDatabase();

    // Initialize mock session row in DB
    mockSupabase._db.sessions.set(SESSION_ID, {
      id: SESSION_ID,
      title: "Ujian OSCE Komprehensif Gelombang 1",
      status: "scheduled",
      total_stations: TOTAL_ROUNDS,
      station_duration_minutes: STATION_MINUTES,
      transition_duration_minutes: TRANSITION_MINUTES,
    });

    // Replace supabase module methods with simulated DB
    vi.spyOn(supabase, "getChannels").mockImplementation(mockSupabase.getChannels);
    vi.spyOn(supabase, "removeChannel").mockImplementation(mockSupabase.removeChannel);
    vi.spyOn(supabase, "channel").mockImplementation(mockSupabase.channel);
    vi.spyOn(supabase, "schema").mockImplementation(mockSupabase.schema);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should run 1 full OSCE testing session from Waiting Room to Completed according to NEED_FIX.md & REALTIME.md", async () => {
    // Track Participant & Examiner & Admin client-side states
    let participantView = "waiting_room";
    let participantIsLocked = false;
    let examinerGracePeriodActive = false;
    let examinerFormUnlocked = true;
    let adminSessionFinishedReady = false;

    let currentClientTimerState = null;
    let currentSessionStatus = "scheduled";
    const broadcastEventsReceived = [];

    // ─────────────────────────────────────────────────────────────────
    // 1. Participant, Examiner, and Admin subscribe to realtime channel
    // ─────────────────────────────────────────────────────────────────
    const unsubscribe = subscribeToSession(SESSION_ID, {
      onSessionUpdate: (sess) => {
        if (sess) {
          currentSessionStatus = sess.status;
          if (sess.status === "completed") {
            participantView = "finished_redirect";
          }
        }
      },
      onTimerUpdate: (timer) => {
        if (timer) {
          currentClientTimerState = timer;

          // Participant UI State Transition Logic (from ParticipantSessionPage.jsx)
          if (timer.phase === "standby" || currentSessionStatus === "waiting_room") {
            participantView = "waiting_room";
          } else if (timer.phase === "initial_transition" || timer.phase === "transition") {
            participantView = "transit";
          } else if (timer.phase === "action") {
            participantView = "live_round";
            participantIsLocked = false;
          } else if (timer.phase === "completed_waiting") {
            // [NEED_FIX.md Point 1]: Redirect to Thank You / OSCE Completion & Lock form
            participantView = "completed";
            participantIsLocked = true;
          }

          // Examiner UI State Transition Logic (from ExaminerStagePage.jsx)
          if (timer.phase === "completed_waiting") {
            // [NEED_FIX.md Point 2]: Grading Grace Period active, form remains unlocked!
            examinerGracePeriodActive = true;
            examinerFormUnlocked = true;
          }

          // Admin UI State Transition Logic (from LiveMonitorPage.jsx)
          if (timer.phase === "completed_waiting") {
            // [NEED_FIX.md Point 3 & 4]: Session ready to finish indicator & button active
            adminSessionFinishedReady = true;
          }
        }
      },
      onBroadcast: (bcast) => {
        broadcastEventsReceived.push(bcast);
      },
    });

    // ─────────────────────────────────────────────────────────────────
    // Phase 1: Admin Opens Waiting Room (Zoom-like standby)
    // ─────────────────────────────────────────────────────────────────
    await openWaitingRoom(SESSION_ID);

    expect(mockSupabase._db.sessions.get(SESSION_ID).status).toBe("waiting_room");
    expect(mockSupabase._db.session_timer_state.get(SESSION_ID).phase).toBe("standby");
    expect(mockSupabase._db.session_timer_state.get(SESSION_ID).target_end_time).toBeNull();
    expect(participantView).toBe("waiting_room");

    // ─────────────────────────────────────────────────────────────────
    // Phase 2: Admin Starts OSCE Simulation (Timer Begins with Initial Transition)
    // ─────────────────────────────────────────────────────────────────
    await startOsceSession(SESSION_ID, STATION_MINUTES, TRANSITION_MINUTES);

    const initTimer = mockSupabase._db.session_timer_state.get(SESSION_ID);
    expect(mockSupabase._db.sessions.get(SESSION_ID).status).toBe("ongoing");
    expect(initTimer.phase).toBe("initial_transition");
    expect(initTimer.round_number).toBe(1);
    expect(participantView).toBe("transit");

    // Initial transition is 2 minutes (120s)
    expect(calcRemaining(initTimer.target_end_time)).toBe(120);

    // Fast-forward 2 minutes to end of initial transition
    vi.advanceTimersByTime(120 * 1000);
    expect(calcRemaining(initTimer.target_end_time)).toBe(0);

    // ─────────────────────────────────────────────────────────────────
    // Phase 3: Round 1 Action Phase (12 Minutes)
    // ─────────────────────────────────────────────────────────────────
    await updateTimerPhase(SESSION_ID, "action", STATION_MINUTES, { roundNumber: 1 });
    const r1Timer = mockSupabase._db.session_timer_state.get(SESSION_ID);

    expect(r1Timer.phase).toBe("action");
    expect(r1Timer.round_number).toBe(1);
    expect(participantView).toBe("live_round");
    expect(participantIsLocked).toBe(false);
    expect(calcRemaining(r1Timer.target_end_time)).toBe(720); // 12 mins = 720s

    // Fast-forward 10 minutes (600s) -> 2 minutes remaining
    vi.advanceTimersByTime(600 * 1000);
    expect(calcRemaining(r1Timer.target_end_time)).toBe(120); // 2-min warning threshold

    // ─────────────────────────────────────────────────────────────────
    // Phase 4: Admin Pause & Resume Handling
    // ─────────────────────────────────────────────────────────────────
    // Admin clicks Pause at 120s remaining
    await pauseTimer(SESSION_ID, 120);
    const pausedState = mockSupabase._db.session_timer_state.get(SESSION_ID);

    expect(mockSupabase._db.sessions.get(SESSION_ID).status).toBe("paused");
    expect(pausedState.phase).toBe("paused");
    expect(pausedState.target_end_time).toBeNull();
    expect(pausedState.paused_remaining_ms).toBe(120000);

    // Time elapses while paused (e.g. 3 minutes pause)
    vi.advanceTimersByTime(180 * 1000);
    // Timer must remain frozen at exactly 120 seconds!
    expect(calcRemaining(null, pausedState.paused_remaining_ms, true)).toBe(120);

    // Admin clicks Resume
    await resumeTimer(SESSION_ID, 120);
    const resumedState = mockSupabase._db.session_timer_state.get(SESSION_ID);

    expect(mockSupabase._db.sessions.get(SESSION_ID).status).toBe("ongoing");
    expect(resumedState.phase).toBe("action");
    expect(calcRemaining(resumedState.target_end_time)).toBe(120);

    // Fast forward remaining 120s to end of Round 1 Action
    vi.advanceTimersByTime(120 * 1000);
    expect(calcRemaining(resumedState.target_end_time)).toBe(0);

    // ─────────────────────────────────────────────────────────────────
    // Phase 5: Broadcast Announcements & Bells
    // ─────────────────────────────────────────────────────────────────
    await sendBroadcast(SESSION_ID, "Perhatian: Harap perhatikan waktu!", "warning", "all");
    await sendBellBroadcast(SESSION_ID, "warning");

    expect(broadcastEventsReceived.length).toBeGreaterThanOrEqual(1);

    // ─────────────────────────────────────────────────────────────────
    // Phase 6: Simulate Circuit Auto-Rolling (Rounds 2 through 5)
    // ─────────────────────────────────────────────────────────────────
    for (let round = 2; round <= 5; round++) {
      // 1. Transition phase (2 mins)
      await updateTimerPhase(SESSION_ID, "transition", TRANSITION_MINUTES, { roundNumber: round - 1 });
      let transState = mockSupabase._db.session_timer_state.get(SESSION_ID);
      expect(transState.phase).toBe("transition");
      expect(participantView).toBe("transit");

      vi.advanceTimersByTime(TRANSITION_MINUTES * 60 * 1000);

      // 2. Action phase for next round (12 mins)
      await updateTimerPhase(SESSION_ID, "action", STATION_MINUTES, { roundNumber: round });
      let actState = mockSupabase._db.session_timer_state.get(SESSION_ID);
      expect(actState.phase).toBe("action");
      expect(actState.round_number).toBe(round);
      expect(participantView).toBe("live_round");

      vi.advanceTimersByTime(STATION_MINUTES * 60 * 1000);
    }

    // ─────────────────────────────────────────────────────────────────
    // Phase 7: Final Round 6 Action Expiry & End-of-Exam State ([NEED_FIX.md])
    // ─────────────────────────────────────────────────────────────────
    // Enter Round 6 Action
    await updateTimerPhase(SESSION_ID, "action", STATION_MINUTES, { roundNumber: 6 });
    let r6State = mockSupabase._db.session_timer_state.get(SESSION_ID);
    expect(r6State.round_number).toBe(6);

    // Fast-forward 12 minutes to reach 00:00 on Final Round 6
    vi.advanceTimersByTime(STATION_MINUTES * 60 * 1000);
    expect(calcRemaining(r6State.target_end_time)).toBe(0);

    // Final Round expires: Trigger setSessionCompletedWaiting
    await setSessionCompletedWaiting(SESSION_ID, TOTAL_ROUNDS);

    const finalCompletedWaitingState = mockSupabase._db.session_timer_state.get(SESSION_ID);

    // [NEED_FIX.md Check 1]: Phase must be completed_waiting & Round must NOT loop back to 1 or advance to 7
    expect(finalCompletedWaitingState.phase).toBe("completed_waiting");
    expect(finalCompletedWaitingState.round_number).toBe(6);
    expect(finalCompletedWaitingState.target_end_time).toBeNull();
    expect(finalCompletedWaitingState.paused_remaining_ms).toBe(0);

    // [NEED_FIX.md Check 2]: Timer display is frozen at 00:00 (0 seconds)
    expect(calcRemaining(finalCompletedWaitingState.target_end_time, finalCompletedWaitingState.paused_remaining_ms, true)).toBe(0);

    // [NEED_FIX.md Check 3]: Participant screen redirected to 'completed' (Thank You) & form locked
    expect(participantView).toBe("completed");
    expect(participantIsLocked).toBe(true);

    // [NEED_FIX.md Check 4]: Examiner screen has Grading Grace Period active, form NOT locked
    expect(examinerGracePeriodActive).toBe(true);
    expect(examinerFormUnlocked).toBe(true);

    // [NEED_FIX.md Check 5]: Admin Control Room shows Finish OSCE ready indicator
    expect(adminSessionFinishedReady).toBe(true);

    // ─────────────────────────────────────────────────────────────────
    // Phase 8: Admin Finishes OSCE Session (finishSession)
    // ─────────────────────────────────────────────────────────────────
    await finishSession(SESSION_ID);

    expect(mockSupabase._db.sessions.get(SESSION_ID).status).toBe("completed");
    expect(mockSupabase._db.session_timer_state.get(SESSION_ID).phase).toBe("finished");
    expect(currentSessionStatus).toBe("completed");

    unsubscribe();
  });
});
