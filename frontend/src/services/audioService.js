/**
 * audioService.js — OSCE MedSkill Praxis Unified Audio & Toast Notification Engine
 * Single Source of Truth for Pure Local MP3 Playback and Synchronized Toasts
 */

import { toast } from "sonner";

export const AUDIO_ASSETS = {
  start_osce: {
    mp3: "/sounds/audio_01_start_osce.mp3",
    text: "Selamat datang di Ujian OSCE MedSkill. Peserta ujian dipersilakan menempatkan diri di depan pintu stase masing-masing.",
  },
  waiting_room: {
    mp3: "/sounds/audio_01_start_osce.mp3",
    text: "Selamat datang di Ujian OSCE MedSkill. Peserta ujian dipersilakan menempatkan diri di depan pintu stase masing-masing.",
  },
  read_scenario: {
    mp3: "/sounds/audio_02_read_scenario.mp3",
    text: "Silakan membuka dan membaca instruksi skenario kasus di luar pintu stase.",
  },
  start_exam: {
    mp3: "/sounds/audio_03_start_exam.mp3",
    text: "Waktu membaca selesai. Silakan memasuki ruang stase dan mulailah ujian.",
  },
  warning_3min: {
    mp3: "/sounds/audio_04_warning_3min.mp3",
    text: "Perhatian, waktu ujian stase tersisa tiga menit lagi.",
  },
  stop_transit: {
    mp3: "/sounds/audio_05_stop_transit.mp3",
    text: "Waktu ujian stase telah selesai. Peserta dipersilakan keluar dari ruangan dan berpindah ke pos stase berikutnya.",
  },
  rest_break: {
    mp3: "/sounds/audio_06_rest_break.mp3",
    text: "Anda memasuki stase istirahat. Silakan memulihkan stamina di area sirkuit.",
  },
  finish_exam: {
    mp3: "/sounds/audio_07_finish_exam.mp3",
    text: "Seluruh rangkaian ujian OSCE telah selesai. Terima kasih atas partisipasi Anda, dipersilakan meninggalkan lokasi ujian.",
  },
  pause: {
    mp3: "/sounds/audio_08_pause.mp3",
    text: "Perhatian dari Panitia Control Room. Sesi ujian dihentikan sementara.",
  },
  countdown: {
    mp3: "/sounds/audio_09_countdown.mp3",
    text: "Countdown 10 detik terakhir stase",
  },
  resume: {
    mp3: "/sounds/audio_10_resume.mp3",
    text: "Perhatian, ujian dilanjutkan kembali. Peserta dipersilakan melanjutkan pengerjaan.",
  },
  admin_broadcast: {
    mp3: "/sounds/broadcast.mp3",
    text: "Perhatian dari Panitia Control Room.",
  },
  broadcast: {
    mp3: "/sounds/broadcast.mp3",
    text: "Perhatian dari Panitia Control Room.",
  },
};

export const NOTIFICATION_CONFIG = {
  welcome: {
    audioKey: "start_osce",
    toast: {
      participant: {
        title: "Ujian OSCE Dimulai: Selamat Datang di OSCE MedSkill",
        description: "Peserta dipersilakan menempatkan diri di depan pintu stase masing-masing.",
        type: "info",
        duration: 6000,
      },
      examiner: {
        title: "Sesi OSCE Dimulai: Persiapan Pos Stase",
        description: "Peserta sedang bersiap di depan pintu stase masing-masing.",
        type: "info",
        duration: 6000,
      },
      admin: {
        title: "Sesi OSCE Dimulai: Ruang Tunggu Dibuka",
        description: "Peserta & Penguji telah terhubung ke ruang persiapan stase.",
        type: "info",
        duration: 6000,
      },
    },
  },
  read_scenario: {
    audioKey: "read_scenario",
    toast: {
      participant: {
        title: "Waktu Membaca Skenario Kasus",
        description: "Silakan membuka dan membaca instruksi skenario kasus di luar pintu stase.",
        type: "info",
        duration: 6000,
      },
      examiner: {
        title: "Waktu Membaca Skenario Kasus",
        description: "Peserta sedang membaca instruksi skenario di luar pintu stase.",
        type: "info",
        duration: 6000,
      },
      admin: {
        title: "Waktu Membaca Skenario Kasus",
        description: "Peserta membaca instruksi kasus di luar stase sebelum masuk ruangan.",
        type: "info",
        duration: 6000,
      },
    },
  },
  start_exam: {
    audioKey: "start_exam",
    toast: {
      participant: {
        title: "Waktu Membaca Selesai! Ujian Stase Dimulai",
        description: "Silakan memasuki ruang stase dan mulai ujian.",
        type: "success",
        duration: 6000,
      },
      examiner: {
        title: "Waktu Membaca Selesai! Peserta Memasuki Stase",
        description: "Ujian stase ronde aktif telah dimulai.",
        type: "success",
        duration: 6000,
      },
      admin: {
        title: "Waktu Membaca Selesai! Ujian Stase Dimulai",
        description: "Peserta telah memasuki ruang stase ronde aktif.",
        type: "success",
        duration: 6000,
      },
    },
  },
  warning_3min: {
    audioKey: "warning_3min",
    toast: {
      participant: {
        title: "Peringatan Waktu: Sisa Waktu Stase 3 Menit!",
        description: "Waktu pengerjaan stase tersisa 3 menit lagi.",
        type: "warning",
        duration: 5000,
      },
      examiner: {
        title: "Peringatan Waktu: Sisa Waktu Stase 3 Menit!",
        description: "Waktu pengerjaan stase peserta tersisa 3 menit lagi.",
        type: "warning",
        duration: 5000,
      },
      admin: {
        title: "Peringatan Waktu: Sisa Waktu Stase 3 Menit!",
        description: "Waktu pengerjaan stase tersisa 3 menit lagi.",
        type: "warning",
        duration: 5000,
      },
    },
  },
  stop_transit: {
    audioKey: "stop_transit",
    toast: {
      participant: {
        title: "Waktu Stase Telah Selesai!",
        description: "Peserta dipersilakan keluar dan berpindah ke pos stase berikutnya.",
        type: "info",
        duration: 6000,
      },
      examiner: {
        title: "Waktu Stase Telah Selesai!",
        description: "Peserta berpindah pos stase. Mohon selesaikan pengisian rubrik penilaian.",
        type: "info",
        duration: 6000,
      },
      admin: {
        title: "Waktu Stase Telah Selesai!",
        description: "Peserta keluar stase dan berpindah pos.",
        type: "info",
        duration: 6000,
      },
    },
  },
  rest_break: {
    audioKey: "rest_break",
    toast: {
      participant: {
        title: "Stase Istirahat Sirkuit",
        description: "Anda memasuki stase istirahat. Silakan memulihkan stamina di area sirkuit.",
        type: "info",
        duration: 6000,
      },
      examiner: {
        title: "Stase Istirahat Sirkuit",
        description: "Pos stase sedang dalam rotasi istirahat.",
        type: "info",
        duration: 6000,
      },
      admin: {
        title: "Stase Istirahat Sirkuit",
        description: "Peserta berada di pos istirahat.",
        type: "info",
        duration: 6000,
      },
    },
  },
  finish_exam: {
    audioKey: "finish_exam",
    toast: {
      participant: {
        title: "Seluruh Rangkaian Ujian OSCE Selesai!",
        description: "Terima kasih atas partisipasi Anda, dipersilakan meninggalkan lokasi ujian.",
        type: "success",
        duration: 8000,
      },
      examiner: {
        title: "Seluruh Rangkaian Ujian OSCE Selesai!",
        description: "Terima kasih atas partisipasi Anda.",
        type: "success",
        duration: 8000,
      },
      admin: {
        title: "Seluruh Rangkaian Ujian OSCE Selesai!",
        description: "Seluruh ronde ujian OSCE telah berakhir.",
        type: "success",
        duration: 8000,
      },
    },
  },
  pause: {
    audioKey: "pause",
    toast: {
      participant: {
        title: "Sesi Ujian Dihentikan Sementara oleh Admin Control Room.",
        description: "Timer dibekukan sementara. Mohon tetap di posisi Anda.",
        type: "warning",
        duration: 6000,
      },
      examiner: {
        title: "Sesi Ujian Dihentikan Sementara oleh Admin Control Room.",
        description: "Timer stase dibekukan sementara.",
        type: "warning",
        duration: 6000,
      },
      admin: {
        title: "Sesi Ujian Dihentikan Sementara",
        description: "Timer stase dibekukan sementara di seluruh client.",
        type: "warning",
        duration: 6000,
      },
    },
  },
  resume: {
    audioKey: "resume",
    toast: {
      participant: {
        title: "Sesi Ujian Dilanjutkan Kembali.",
        description: "Silakan melanjutkan pengerjaan stase.",
        type: "success",
        duration: 5000,
      },
      examiner: {
        title: "Sesi Ujian Dilanjutkan Kembali.",
        description: "Silakan melanjutkan proses penilaian peserta.",
        type: "success",
        duration: 5000,
      },
      admin: {
        title: "Sesi Ujian Dilanjutkan Kembali",
        description: "Timer berjalan kembali di seluruh client.",
        type: "success",
        duration: 5000,
      },
    },
  },
  countdown: {
    audioKey: "countdown",
    toast: null,
  },
};

// Track played events to prevent double audio triggers
const lastPlayedEvents = new Map();
let currentAudioInstance = null;

/**
 * Normalizes event/bell type keys
 */
export function normalizeOsceEventKey(rawKey) {
  const k = String(rawKey || "").trim().toLowerCase();
  if (k === "welcome" || k === "start_osce" || k === "waiting_room" || k === "waiting") return "welcome";
  if (k === "read_scenario" || k === "transit" || k === "reading") return "read_scenario";
  if (k === "start_exam" || k === "start") return "start_exam";
  if (k === "warning_3min" || k === "warning") return "warning_3min";
  if (k === "stop_transit" || k === "rotation") return "stop_transit";
  if (k === "rest_break" || k === "rest" || k === "break") return "rest_break";
  if (k === "finish_exam" || k === "finish") return "finish_exam";
  if (k === "pause") return "pause";
  if (k === "resume") return "resume";
  if (k === "countdown") return "countdown";
  if (k === "admin_broadcast" || k === "broadcast") return "broadcast";
  return k;
}

/**
 * Stop any active audio playback
 */
export function stopAllAudio() {
  if (currentAudioInstance) {
    try {
      currentAudioInstance.pause();
      currentAudioInstance.currentTime = 0;
    } catch (e) {}
    currentAudioInstance = null;
  }
}

/**
 * Main audio trigger function (Purely plays local public assets /sounds/*.mp3)
 * @param {string} key — Key from AUDIO_ASSETS (e.g. 'start_exam', 'warning_3min')
 * @param {boolean} force — Force play regardless of throttle
 */
export function playOsceAudio(key, force = false) {
  if (typeof window === "undefined" || typeof Audio === "undefined") return;

  const normalized = normalizeOsceEventKey(key);
  const asset = AUDIO_ASSETS[normalized] || AUDIO_ASSETS[key] || (normalized === "welcome" ? AUDIO_ASSETS.start_osce : null);
  if (!asset || !asset.mp3) return;

  const now = Date.now();
  const lastTime = lastPlayedEvents.get(normalized) || 0;
  if (!force && now - lastTime < 5000) {
    // Prevent duplicate audio trigger within 5 seconds
    return;
  }
  lastPlayedEvents.set(normalized, now);

  try {
    stopAllAudio();

    const audio = new Audio(asset.mp3);
    audio.volume = 0.95;
    currentAudioInstance = audio;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`[AudioEngine] Auto-play restriction for ${asset.mp3}:`, err);
      });
    }
  } catch (e) {
    console.warn(`[AudioEngine] Audio playback error for ${asset.mp3}:`, e);
  }
}

/**
 * Combined Unified Engine: Plays Sound + Dispatches Standardized Toast (In-Place Update)
 * @param {string} eventKey — Bell event key (e.g. 'welcome', 'read_scenario', 'start_exam', 'warning_3min')
 * @param {'participant'|'examiner'|'admin'} role — Target user role
 * @param {boolean} force — Force play audio
 */
export function playOsceFeedback(eventKey, role = "participant", force = false) {
  const normKey = normalizeOsceEventKey(eventKey);

  // 1. Play Audio
  playOsceAudio(normKey, force);

  // 2. Render Synchronized In-Place Toast
  const config = NOTIFICATION_CONFIG[normKey];
  if (config && config.toast) {
    const roleToast = config.toast[role] || config.toast.participant;
    if (roleToast) {
      const { title, description, type, duration } = roleToast;
      if (normKey === "finish_exam") {
        toast.dismiss();
      }
      const options = {
        id: "osce-bell-status",
        description,
        duration: duration || 5000,
      };

      if (type === "warning") toast.warning(title, options);
      else if (type === "success") toast.success(title, options);
      else toast.info(title, options);
    }
  }
}

/**
 * Quick-access Named Helper Functions
 */
export const triggerWelcomeNotice = (role = "participant") => playOsceFeedback("welcome", role, true);
export const triggerReadScenarioNotice = (role = "participant") => playOsceFeedback("read_scenario", role, true);
export const triggerStartExamNotice = (role = "participant") => playOsceFeedback("start_exam", role, true);
export const triggerWarning3MinNotice = (role = "participant") => playOsceFeedback("warning_3min", role, true);
export const triggerStopTransitNotice = (role = "participant") => playOsceFeedback("stop_transit", role, true);
export const triggerRestBreakNotice = (role = "participant") => playOsceFeedback("rest_break", role, true);
export const triggerFinishExamNotice = (role = "participant") => playOsceFeedback("finish_exam", role, true);
export const triggerPauseNotice = (role = "participant") => playOsceFeedback("pause", role, true);
export const triggerResumeNotice = (role = "participant") => playOsceFeedback("resume", role, true);
export const triggerCountdownNotice = (role = "participant") => playOsceFeedback("countdown", role, true);
