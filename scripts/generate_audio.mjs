import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, "../frontend/public/sounds");
const tmpDir = path.resolve(__dirname, "../frontend/public/sounds/_tmp");

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const VOICE = "id-ID-ArdiNeural";

const audioList = [
  { filename: "audio_01_start_osce.mp3", text: "Selamat datang di Ujian OSCE MedSkill. Peserta ujian dipersilakan menempatkan diri di depan pintu stase masing-masing." },
  { filename: "audio_02_read_scenario.mp3", text: "Silakan membuka dan membaca instruksi skenario kasus di luar pintu stase." },
  { filename: "audio_03_start_exam.mp3", text: "Waktu membaca selesai. Silakan memasuki ruang stase dan mulailah ujian." },
  { filename: "audio_04_warning_3min.mp3", text: "Perhatian, waktu ujian stase tersisa tiga menit lagi." },
  { filename: "audio_05_stop_transit.mp3", text: "Waktu ujian stase telah selesai. Peserta dipersilakan keluar dari ruangan dan berpindah ke pos stase berikutnya." },
  { filename: "audio_06_rest_break.mp3", text: "Anda memasuki stase istirahat. Silakan memulihkan stamina di area sirkuit." },
  { filename: "audio_07_finish_exam.mp3", text: "Seluruh rangkaian ujian OSCE telah selesai. Terima kasih atas partisipasi Anda, dipersilakan meninggalkan lokasi ujian." },
  { filename: "audio_08_pause.mp3", text: "Perhatian dari Panitia Control Room. Sesi ujian dihentikan sementara." },
  { filename: "broadcast.mp3", text: "Perhatian dari Panitia Control Room." },
];

async function main() {
  console.log(`🎙️  Generating OSCE audio (male voice: ${VOICE})`);
  console.log(`📁 Target: ${targetDir}\n`);

  for (const item of audioList) {
    const dest = path.join(targetDir, item.filename);
    const itemTmpDir = path.join(tmpDir, item.filename.replace(".mp3", ""));

    try {
      // Fresh TTS instance per file to avoid WebSocket reuse issues
      const tts = new MsEdgeTTS();
      await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      if (fs.existsSync(itemTmpDir)) fs.rmSync(itemTmpDir, { recursive: true });
      fs.mkdirSync(itemTmpDir, { recursive: true });

      process.stdout.write(`⏳ ${item.filename} ... `);
      await tts.toFile(itemTmpDir, item.text);

      // Find the generated file inside tmp dir
      const files = fs.readdirSync(itemTmpDir);
      const mp3File = files.find((f) => f.endsWith(".mp3"));
      if (mp3File) {
        fs.copyFileSync(path.join(itemTmpDir, mp3File), dest);
        const stats = fs.statSync(dest);
        console.log(`✅ ${(stats.size / 1024).toFixed(1)} KB`);
      } else {
        console.log(`❌ No MP3 generated`);
      }

      tts.close();
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`❌ Gagal: ${err.message}`);
    }
  }

  // Cleanup tmp
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });

  console.log("\n🎉 Semua file audio OSCE (suara laki-laki) berhasil dibuat!");
}

main();
