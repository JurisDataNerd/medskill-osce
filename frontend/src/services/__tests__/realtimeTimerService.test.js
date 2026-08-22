import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calcRemaining,
  calcRemainingSeconds,
  subscribeToSession,
  joinPresence,
  openWaitingRoom,
  startOsceSession,
  updateTimerPhase,
  setSessionCompletedWaiting,
  pauseTimer,
  resumeTimer,
  sendBroadcast,
  sendBellBroadcast,
  finishSession,
} from "@/services/realtimeTimerService";
import { supabase } from "@/lib/supabaseClient";

// Mock Supabase Client
vi.mock("@/lib/supabaseClient", () => {
  const channels = [];
  const mockChannel = {
    topic: "",
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn((cb) => {
      if (cb) cb("SUBSCRIBED");
      return mockChannel;
    }),
    send: vi.fn().mockResolvedValue({}),
    track: vi.fn().mockResolvedValue({}),
    presenceState: vi.fn(() => ({})),
  };

  return {
    supabase: {
      getChannels: vi.fn(() => channels),
      removeChannel: vi.fn((ch) => {
        const idx = channels.indexOf(ch);
        if (idx !== -1) channels.splice(idx, 1);
      }),
      channel: vi.fn((name, config) => {
        const ch = {
          ...mockChannel,
          topic: `realtime:${name}`,
          name,
          config,
          on: vi.fn(function () {
            return this;
          }),
        };
        channels.push(ch);
        return ch;
      }),
      schema: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  };
});

describe("Realtime Timer Service - Future Timestamp Pattern & Calculations", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should calculate remaining seconds accurately from target_end_time", () => {
    const now = new Date("2026-08-21T10:00:00.000Z").getTime();
    vi.setSystemTime(now);

    const targetTime = new Date("2026-08-21T10:12:00.000Z").toISOString(); // +12 minutes (720 seconds)
    const remaining = calcRemaining(targetTime);

    expect(remaining).toBe(720);
    expect(calcRemainingSeconds(targetTime)).toBe(720); // Alias compatibility
  });

  it("should return 0 when target_end_time is in the past or expired", () => {
    const now = new Date("2026-08-21T10:15:00.000Z").getTime();
    vi.setSystemTime(now);

    const pastTarget = new Date("2026-08-21T10:12:00.000Z").toISOString();
    expect(calcRemaining(pastTarget)).toBe(0);
  });

  it("should return 0 if target_end_time is null or undefined", () => {
    expect(calcRemaining(null)).toBe(0);
    expect(calcRemaining(undefined)).toBe(0);
  });

  it("should handle background tab sleep/throttling without drift (Future Timestamp Immunity)", () => {
    const startTime = new Date("2026-08-21T10:00:00.000Z").getTime();
    vi.setSystemTime(startTime);

    const targetTime = new Date("2026-08-21T10:10:00.000Z").toISOString(); // 10 mins = 600s
    expect(calcRemaining(targetTime)).toBe(600);

    // Simulate browser sleeping/backgrounded for 4 minutes (240s)
    vi.advanceTimersByTime(240 * 1000);

    // Upon wakeup, remaining must be exactly 360 seconds without needing per-second ticks
    expect(calcRemaining(targetTime)).toBe(360);
  });

  it("should calculate paused state remaining seconds from paused_remaining_ms", () => {
    const now = new Date("2026-08-21T10:00:00.000Z").getTime();
    vi.setSystemTime(now);

    // When paused, target_end_time is null, paused_remaining_ms is 450,000ms (7.5 mins = 450s)
    const pausedMs = 450000;
    const remaining = calcRemaining(null, pausedMs, true);

    expect(remaining).toBe(450);

    // Even if time advances while paused, remaining must stay frozen
    vi.advanceTimersByTime(60 * 1000);
    expect(calcRemaining(null, pausedMs, true)).toBe(450);
  });
});

describe("Candidate Station Rotation Algorithm", () => {
  // Sesuai rumus OSCE Circuit: ((starting_station - 1 + (round - 1)) % total_stations) + 1
  function getCandidateStation(startingStation, roundNumber, totalStations = 6) {
    return ((startingStation - 1 + (roundNumber - 1)) % totalStations) + 1;
  }

  it("should compute correct station sequence for candidate starting at Station 1", () => {
    const starting = 1;
    const total = 6;

    expect(getCandidateStation(starting, 1, total)).toBe(1);
    expect(getCandidateStation(starting, 2, total)).toBe(2);
    expect(getCandidateStation(starting, 3, total)).toBe(3);
    expect(getCandidateStation(starting, 4, total)).toBe(4);
    expect(getCandidateStation(starting, 5, total)).toBe(5);
    expect(getCandidateStation(starting, 6, total)).toBe(6);
  });

  it("should compute correct wrapping station sequence for candidate starting at Station 4", () => {
    const starting = 4;
    const total = 6;

    expect(getCandidateStation(starting, 1, total)).toBe(4);
    expect(getCandidateStation(starting, 2, total)).toBe(5);
    expect(getCandidateStation(starting, 3, total)).toBe(6);
    expect(getCandidateStation(starting, 4, total)).toBe(1); // Wrapped
    expect(getCandidateStation(starting, 5, total)).toBe(2);
    expect(getCandidateStation(starting, 6, total)).toBe(3);
  });

  it("should compute correct station sequence for candidate starting at Station 6", () => {
    const starting = 6;
    const total = 6;

    expect(getCandidateStation(starting, 1, total)).toBe(6);
    expect(getCandidateStation(starting, 2, total)).toBe(1);
    expect(getCandidateStation(starting, 3, total)).toBe(2);
    expect(getCandidateStation(starting, 4, total)).toBe(3);
    expect(getCandidateStation(starting, 5, total)).toBe(4);
    expect(getCandidateStation(starting, 6, total)).toBe(5);
  });
});

describe("Channel Subscriptions & Deduplication", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should clean up previous channels before creating a new subscription", () => {
    const sessionId = "session-123";
    const existingChannel = { topic: `realtime:osce-session:${sessionId}` };
    supabase.getChannels.mockReturnValueOnce([existingChannel]);

    const cleanup = subscribeToSession(sessionId);

    expect(supabase.removeChannel).toHaveBeenCalledWith(existingChannel);
    expect(supabase.channel).toHaveBeenCalledWith(`osce-session:${sessionId}`);

    cleanup();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });

  it("should deduplicate rapid broadcast messages within 6-second window", () => {
    const sessionId = "session-456";
    let broadcastHandler = null;

    supabase.channel.mockImplementationOnce(() => {
      const ch = {
        topic: `realtime:osce-session:${sessionId}`,
        on: vi.fn((type, filter, handler) => {
          if (type === "broadcast" && filter.event === "announcement") {
            broadcastHandler = handler;
          }
          return ch;
        }),
        subscribe: vi.fn().mockReturnThis(),
      };
      return ch;
    });

    const onBroadcastMock = vi.fn();
    subscribeToSession(sessionId, { onBroadcast: onBroadcastMock });

    // Emit first broadcast
    broadcastHandler({ message: "Peringatan Waktu Ujian!" });
    expect(onBroadcastMock).toHaveBeenCalledTimes(1);

    // Duplicate emission immediately (e.g. from both WebSocket & DB Change Data Capture)
    broadcastHandler({ message: "Peringatan Waktu Ujian!" });
    expect(onBroadcastMock).toHaveBeenCalledTimes(1); // Deduped!

    // Advance 7 seconds past dedupe window
    vi.advanceTimersByTime(7000);

    // Emission after dedupe window expires should be accepted
    broadcastHandler({ message: "Peringatan Waktu Ujian!" });
    expect(onBroadcastMock).toHaveBeenCalledTimes(2);
  });

  it("should deduplicate online users in Presence sync", () => {
    const sessionId = "session-789";
    let syncHandler = null;

    const mockPresenceState = {
      user_1: [
        { user_id: "u1", full_name: "dr. Andi", role: "examiner", email: "andi@med.id" },
        { user_id: "u1", full_name: "dr. Andi", role: "examiner", email: "andi@med.id" }, // Duplicate tab
      ],
      user_2: [
        { user_id: "u2", full_name: "Budi (Peserta)", role: "participant", email: "budi@med.id" },
      ],
    };

    supabase.channel.mockImplementationOnce((name, config) => {
      const ch = {
        topic: `realtime:${name}`,
        on: vi.fn((type, filter, handler) => {
          if (type === "presence" && filter.event === "sync") {
            syncHandler = handler;
          }
          return ch;
        }),
        presenceState: vi.fn(() => mockPresenceState),
        subscribe: vi.fn((cb) => {
          if (cb) cb("SUBSCRIBED");
          return ch;
        }),
        track: vi.fn().mockResolvedValue({}),
      };
      return ch;
    });

    const onSyncMock = vi.fn();
    joinPresence(sessionId, { user_id: "u1", full_name: "dr. Andi", role: "examiner" }, onSyncMock);

    // Trigger sync
    syncHandler();

    expect(onSyncMock).toHaveBeenCalledTimes(1);
    const syncedUsers = onSyncMock.mock.calls[0][0];
    expect(syncedUsers.length).toBe(2); // Deduplicated from 3 entries to 2 unique users
    expect(syncedUsers.map((u) => u.user_id)).toEqual(["u1", "u2"]);
  });
});
