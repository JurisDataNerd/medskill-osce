/**
 * audioService.js — OSCE MedSkill Praxis Audio Engine
 * Provides dual-engine audio playback (MP3 Assets + Web Audio API Chimes + Speech Synthesis Voiceover Fallback)
 */

const AUDIO_ASSETS = {
  waiting_room: {
    mp3: "/sounds/audio_01_waiting_room.mp3",
    text: "Selamat datang di Ujian OSCE MedSkill. Peserta ujian dipersilakan menempatkan diri di depan pintu stase masing-masing.",
    type: "single",
  },
  read_scenario: {
    mp3: "/sounds/audio_02_read_scenario.mp3",
    text: "Silakan membuka dan membaca instruksi skenario kasus di luar pintu stase.",
    type: "ting",
  },
  start_exam: {
    mp3: "/sounds/audio_03_start_exam.mp3",
    text: "Waktu membaca selesai. Silakan memasuki ruang stase dan mulailah ujian.",
    type: "start",
  },
  warning_3min: {
    mp3: "/sounds/audio_04_warning_1min.mp3",
    text: "Perhatian, waktu ujian stase tersisa tiga menit lagi.",
    type: "warning",
  },
  warning_2min: {
    mp3: "/sounds/audio_04_warning_1min.mp3",
    text: "Perhatian, waktu ujian stase tersisa tiga menit lagi.",
    type: "warning",
  },
  warning_1min: {
    mp3: "/sounds/audio_04_warning_1min.mp3",
    text: "Perhatian, waktu ujian stase tersisa tiga menit lagi.",
    type: "warning",
  },
  stop_transit: {
    mp3: "/sounds/audio_05_stop_transit.mp3",
    text: "Waktu ujian stase telah selesai. Peserta dipersilakan keluar dari ruangan dan berpindah ke pos stase berikutnya.",
    type: "stop",
  },
  rest_break: {
    mp3: "/sounds/audio_06_rest_break.mp3",
    text: "Anda memasuki stase istirahat. Silakan memulihkan stamina di area sirkuit.",
    type: "soft",
  },
  finish_exam: {
    mp3: "/sounds/audio_07_finish_exam.mp3",
    text: "Seluruh rangkaian ujian OSCE telah selesai. Terima kasih atas partisipasi Anda, dipersilakan meninggalkan lokasi ujian.",
    type: "fanfare",
  },
  admin_broadcast: {
    mp3: "/sounds/broadcast.mp3",
    text: "",
    type: "alert",
  },
  resume: {
    mp3: "/sounds/audio_10_resume.mp3",
    text: "",
    type: "single",
  },
  countdown: {
    mp3: "/sounds/audio_09_countdown.mp3",
    text: "",
    type: "single",
  },
};

// Track played events to prevent double audio triggers
const lastPlayedEvents = new Map();
let currentAudioInstance = null;

/**
 * Stop any active audio playback and speech synthesis
 */
export function stopAllAudio() {
  if (currentAudioInstance) {
    try {
      currentAudioInstance.pause();
      currentAudioInstance.currentTime = 0;
    } catch (e) {}
    currentAudioInstance = null;
  }
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

/**
 * Main audio trigger function
 * @param {string} key — Key from AUDIO_ASSETS (e.g. 'start_exam', 'warning_1min')
 * @param {boolean} force — Force play regardless of throttle
 */
export function playOsceAudio(key, force = false) {
  const asset = AUDIO_ASSETS[key];
  if (!asset) return;

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
    audio.volume = 0.9;
    currentAudioInstance = audio;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to Web Audio Synthesizer + SpeechSynthesis Voiceover
        synthesizeBell(asset.type);
        speakVoiceover(asset.text);
      });
    }
  } catch (e) {
    synthesizeBell(asset.type);
    speakVoiceover(asset.text);
  }
}

/**
 * Web Audio API Synthesizer for Chime Bell Effects
 */
function synthesizeBell(type = "single") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    let tones = [];

    switch (type) {
      case "start":
        // 2-tone long bell (880Hz -> 1174Hz)
        tones = [
          { freq: 880, start: 0, duration: 0.4 },
          { freq: 1174.66, start: 0.35, duration: 0.8 },
        ];
        break;
      case "warning":
        // Short double warning chime (1046Hz -> 1046Hz)
        tones = [
          { freq: 1046.5, start: 0, duration: 0.2 },
          { freq: 1046.5, start: 0.25, duration: 0.3 },
        ];
        break;
      case "stop":
        // 3x Low Gong (523Hz -> 440Hz -> 349Hz)
        tones = [
          { freq: 523.25, start: 0, duration: 0.4 },
          { freq: 440, start: 0.4, duration: 0.4 },
          { freq: 349.23, start: 0.8, duration: 0.8 },
        ];
        break;
      case "alert":
        // Emergency Siren Chime (783Hz -> 659Hz -> 783Hz)
        tones = [
          { freq: 783.99, start: 0, duration: 0.25 },
          { freq: 659.25, start: 0.25, duration: 0.25 },
          { freq: 783.99, start: 0.5, duration: 0.4 },
        ];
        break;
      case "fanfare":
        tones = [
          { freq: 523.25, start: 0, duration: 0.2 },
          { freq: 659.25, start: 0.2, duration: 0.2 },
          { freq: 783.99, start: 0.4, duration: 0.6 },
        ];
        break;
      default:
        // Single chime
        tones = [{ freq: 880, start: 0, duration: 0.5 }];
        break;
    }

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });
  } catch (e) {
    console.warn("Synthesizer audio failed:", e);
  }
}

/**
 * SpeechSynthesis API for Bahasa Indonesia Voiceover Narration
 */
function speakVoiceover(text) {
  if (!("speechSynthesis" in window) || !text) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.95; // Slightly slower, calm narrator tone
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Find Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.includes("id") || v.lang.includes("ID"));
    if (idVoice) utterance.voice = idVoice;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis failed:", e);
  }
}
