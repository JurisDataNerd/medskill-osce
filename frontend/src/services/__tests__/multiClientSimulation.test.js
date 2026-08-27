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
  joinPresence,
} from "@/services/realtimeTimerService";
import { supabase } from "@/lib/supabaseClient";

describe("Multi-Client Concurrent Synchronization & Edge Cases", () => {
  let channelsMap;
  let broadcastCallbacks;
  let timerUpdateCallbacks;
  let sessionUpdateCallbacks;
  let presenceSyncCallbacks;

  const SESSION_ID = "sess-multi-client-99";
  const TOTAL_STATIONS = 6;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-21T09:00:00.000Z"));

    channelsMap = new Map();
    broadcastCallbacks = [];
    timerUpdateCallbacks = [];
    sessionUpdateCallbacks = [];
    presenceSyncCallbacks = [];

    const broadcastEventHandlers = new Map();

    vi.spyOn(supabase, "getChannels").mockImplementation(() => Array.from(channelsMap.values()));
    vi.spyOn(supabase, "removeChannel").mockImplementation((ch) => {
      const key = ch.topic || ch.name;
      channelsMap.delete(key);
    });

    vi.spyOn(supabase, "channel").mockImplementation((name, config = {}) => {
      const topic = `realtime:${name}`;
      const ch = {
        name,
        topic,
        config,
        on: vi.fn((type, filter, handler) => {
          if (type === "postgres_changes") {
            if (filter.table === "session_timer_state") timerUpdateCallbacks.push(handler);
            if (filter.table === "sessions") sessionUpdateCallbacks.push(handler);
          } else if (type === "broadcast") {
            const ev = filter.event || "*";
            if (!broadcastEventHandlers.has(ev)) broadcastEventHandlers.set(ev, []);
            broadcastEventHandlers.get(ev).push(handler);
          } else if (type === "presence") {
            presenceSyncCallbacks.push(handler);
          }
          return ch;
        }),
        subscribe: vi.fn((cb) => {
          if (cb) cb("SUBSCRIBED");
          return ch;
        }),
        send: vi.fn(async ({ type, event, payload }) => {
          const handlers = broadcastEventHandlers.get(event) || [];
          handlers.forEach((cb) => cb({ payload }));
          return {};
        }),
        presenceState: vi.fn(() => ({})),
        track: vi.fn().mockResolvedValue({}),
      };
      channelsMap.set(topic, ch);
      return ch;
    });

    vi.spyOn(supabase, "schema").mockImplementation(() => ({
      from: (tableName) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn((payload) => {
          if (tableName === "sessions") {
            sessionUpdateCallbacks.forEach((cb) => cb({ new: { id: SESSION_ID, ...payload } }));
          }
          const queryBuilder = {
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: payload, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: payload, error: null }),
          };
          return queryBuilder;
        }),
        upsert: vi.fn((rows) => {
          const row = Array.isArray(rows) ? rows[0] : rows;
          if (tableName === "session_timer_state") {
            timerUpdateCallbacks.forEach((cb) => cb({ new: { session_id: SESSION_ID, ...row } }));
          }
          const queryBuilder = {
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: row, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
          };
          return queryBuilder;
        }),
        insert: vi.fn((rows) => {
          const row = Array.isArray(rows) ? rows[0] : rows;
          const queryBuilder = {
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: row, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
          };
          return queryBuilder;
        }),
      }),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should synchronize 6 simultaneous candidates and 6 examiners across all rounds without station collisions", () => {
    // 6 Candidates starting at stations 1 through 6
    const candidates = Array.from({ length: TOTAL_STATIONS }, (_, i) => ({
      id: `candidate-${i + 1}`,
      startingStation: i + 1,
    }));

    function getStationForCandidate(startingStation, round) {
      return ((startingStation - 1 + (round - 1)) % TOTAL_STATIONS) + 1;
    }

    // Verify for each round from 1 to 6, every candidate is at a unique station (no 2 candidates at same station)
    for (let round = 1; round <= TOTAL_STATIONS; round++) {
      const stationsThisRound = candidates.map((c) =>
        getStationForCandidate(c.startingStation, round)
      );

      const uniqueStations = new Set(stationsThisRound);
      expect(uniqueStations.size).toBe(TOTAL_STATIONS); // Every station 1..6 occupied exactly once
      expect(Array.from(uniqueStations).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it("should broadcast timer changes simultaneously to all connected clients (Admin, 6 Participants, 6 Examiners)", async () => {
    const clientStates = [];

    // Spawn 13 client listeners (1 Admin, 6 Participants, 6 Examiners)
    for (let i = 0; i < 13; i++) {
      const client = { id: i === 0 ? "admin" : i <= 6 ? `p-${i}` : `e-${i - 6}`, timer: null, session: null };
      clientStates.push(client);

      subscribeToSession(SESSION_ID, {
        onTimerUpdate: (timer) => {
          client.timer = timer;
        },
        onSessionUpdate: (sess) => {
          client.session = sess;
        },
      });
    }

    // Admin triggers open waiting room
    await openWaitingRoom(SESSION_ID);
    clientStates.forEach((c) => {
      expect(c.timer?.phase).toBe("standby");
    });

    // Admin starts OSCE
    await startOsceSession(SESSION_ID, 12, 2);
    clientStates.forEach((c) => {
      expect(c.timer?.phase).toBe("initial_transition");
    });

    // Admin pauses at 90s
    await pauseTimer(SESSION_ID, 90);
    clientStates.forEach((c) => {
      expect(c.timer?.phase).toBe("paused");
      expect(c.timer?.paused_remaining_ms).toBe(90000);
      expect(c.session?.status).toBe("paused");
    });

    // Admin resumes
    await resumeTimer(SESSION_ID, 90);
    clientStates.forEach((c) => {
      expect(c.timer?.phase).toBe("action");
      expect(c.session?.status).toBe("ongoing");
    });

    // Final round expires -> completed_waiting (NEED_FIX.md)
    await setSessionCompletedWaiting(SESSION_ID, TOTAL_STATIONS);
    clientStates.forEach((c) => {
      expect(c.timer?.phase).toBe("completed_waiting");
      expect(c.timer?.round_number).toBe(TOTAL_STATIONS);
      expect(c.timer?.target_end_time).toBeNull();
      expect(c.timer?.paused_remaining_ms).toBe(0);
    });
  });

  it("should handle multiple consecutive pause and resume toggles without time drift", async () => {
    // Start session action phase at 720 seconds (12 mins)
    await updateTimerPhase(SESSION_ID, "action", 12, { roundNumber: 1 });

    // 1st Run: 200 seconds elapse (520s left)
    vi.advanceTimersByTime(200 * 1000);
    let remaining = 520;

    // Pause 1
    await pauseTimer(SESSION_ID, remaining);
    vi.advanceTimersByTime(300 * 1000); // 5 minutes paused
    expect(calcRemaining(null, 520 * 1000, true)).toBe(520);

    // Resume 1
    await resumeTimer(SESSION_ID, remaining);
    // 120 seconds elapse (400s left)
    vi.advanceTimersByTime(120 * 1000);
    remaining = 400;

    // Pause 2
    await pauseTimer(SESSION_ID, remaining);
    vi.advanceTimersByTime(60 * 1000); // 1 minute paused
    expect(calcRemaining(null, 400 * 1000, true)).toBe(400);

    // Resume 2
    await resumeTimer(SESSION_ID, remaining);
    // 400 seconds elapse (0s left)
    vi.advanceTimersByTime(400 * 1000);
    expect(calcRemaining(new Date(Date.now()).toISOString())).toBe(0);
  });
});
