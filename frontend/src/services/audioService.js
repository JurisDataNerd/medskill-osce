/**
 * audioService.js — OSCE MedSkill Praxis Audio Engine
 * Pure Local MP3 Audio Playback from /sounds/* assets
 */

const AUDIO_ASSETS = {
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

// Track played events to prevent double audio triggers
const lastPlayedEvents = new Map();
let currentAudioInstance = null;

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

  const asset = AUDIO_ASSETS[key];
  if (!asset || !asset.mp3) return;

  const now = Date.now();
  const lastTime = lastPlayedEvents.get(key) || 0;
  if (!force && now - lastTime < 6000) {
    // Prevent duplicate trigger within 6 seconds
    return;
  }
  lastPlayedEvents.set(key, now);

  try {
    stopAllAudio();

    const audio = new Audio(asset.mp3);
    audio.volume = 0.95;
    currentAudioInstance = audio;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // User gesture / Autoplay policy warning
        console.warn(`[AudioEngine] Auto-play restriction for ${asset.mp3}:`, err);
      });
    }
  } catch (e) {
    console.warn(`[AudioEngine] Audio playback error for ${asset.mp3}:`, e);
  }
}

