# 🔊 SOUND.md — Katalog & Spesifikasi Audio Sistem OSCE Praxis
> **Praxis by MedSkill Indonesia — OSCE Engine & Clinical Assessment Platform**  
> *Versi Pemutakhiran Mapping Audio: 26 Agustus 2026*

Dokumen ini mendokumentasikan seluruh daftar efek suara (*sound cues*), bel ujian medis standar AIPKI/UKMPPD, suara notifikasi realtime, rekaman voiceover manusia (Aksa / Voice Actor Praxis), serta arsitektur audio engine yang digunakan di platform **Praxis OSCE**.

---

## 🔔 1. Mapping Katalog Audio Utama (`/public/sounds/*.mp3`)

Seluruh audio di bawah ini dipicu secara otomatis oleh `realtimeTimerService.js` melalui WebSocket Supabase secara sinkron ke seluruh layar Admin, Dokter Penguji, dan Peserta.

| No | Key Audio (`audioService.js`) | File Asset MP3 | Pemicu Realtime (*Trigger*) | Pola & Narasi Audio (Voice Script) | Keterangan & Tujuan UX |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `waiting_room` | `/sounds/audio_01_waiting_room.mp3` | Admin membuka sesi ke fase **Waiting Room** (Sebelum ujian dimulai). | **Musik Welcoming + Narasi Voice Over**:<br>*"Selamat datang di Ujian OSCE MedSkill. Peserta ujian dipersilakan menempatkan diri di depan pintu stase masing-masing."* | Mengondisikan peserta dan penguji di ruang tunggu awal sirkuit. |
| **2** | `read_scenario` | `/sounds/audio_02_read_scenario.mp3` | Timer masuk ke fase **Baca Skenario** (`read_scenario` / Transisi Rotasi). | **Chime Ting + Narasi**:<br>*"Silakan membuka dan membaca instruksi skenario kasus di luar pintu stase."* | Instruksi peserta membaca lembar skenario soal di papan luar stase. |
| **3** | `start_exam` | `/sounds/audio_03_start_exam.mp3` | Transisi habis dan waktu **Pengerjaan Stase** dimulai (`action` timer jalan). | **Bel Lonceng Mulai 1x + Narasi**:<br>*"Waktu membaca selesai. Silakan memasuki ruang stase dan mulailah ujian."* | Aba-aba tegas peserta memasuki ruangan pos & pengujian dimulai. |
| **4** | `warning_3min` | `/sounds/audio_04_warning_time.mp3` <br>*(Alias: `audio_04_warning_1min.mp3`)* | Saat waktu stase **tersisa 3 Menit** (180 detik) pada fase `action`. | **Bel Peringatan 2x + Narasi**:<br>*"Perhatian, waktu ujian stase tersisa tiga menit lagi."* | Aba-aba agar peserta mempercepat tindakan medis & memulai edukasi/resep. |
| **5** | `stop_transit` | `/sounds/audio_05_stop_transit.mp3` | Timer pengerjaan stase mencapai **00:00** (fase `action` tuntas). | **Bel Rotasi 3x + Narasi**:<br>*"Waktu ujian stase telah selesai. Peserta dipersilakan keluar dari ruangan dan berpindah ke pos stase berikutnya."* | Aba-aba peserta meletakkan alat, meninggalkan pos, dan berpindah ke pos berikutnya. |
| **6** | `rest_break` | `/sounds/audio_06_rest_break.mp3` | Peserta berada pada giliran **Stase Istirahat** (*Rest Station*). | **Chime Soft + Narasi**:<br>*"Anda memasuki stase istirahat. Silakan memulihkan stamina di area sirkuit."* | Informasi bagi peserta untuk beristirahat tanpa dilakukan penilaian. |
| **7** | `finish_exam` | `/sounds/audio_07_finish_exam.mp3` | **Ronde Terakhir Sirkuit Selesai** mencapai 00:00 (Seluruh ronde tuntas). | **Fanfare Grand Chime + Narasi**:<br>*"Seluruh rangkaian ujian OSCE telah selesai. Terima kasih atas partisipasi Anda, dipersilakan meninggalkan lokasi ujian."* | Pengumuman resmi bahwa seluruh sirkuit ujian OSCE telah berakhir. |
| **8** | `admin_broadcast` | `/sounds/audio_08_admin_broadcast.mp3` <br>*(Fallback: `/sounds/broadcast.mp3`)* | Admin mengirim pengumuman darurat atau memicu tombol bel manual. | **Chime Interkom Interrupter** (*Ding-Dong*) penarik perhatian. | Memastikan penguji dan peserta menyimak banner pengumuman darurat. |
| **9** | `countdown` | `/sounds/audio_09_countdown.mp3` | Detik **10s hingga 1s terakhir** sebelum stase 1 / bel mulai berbunyi. | **Audio Tick-Tock Countdown 10 Detik** berkesinambungan. | Aba-aba hitungan mundur 10 detik persiapan di depan pintu stase. |
| **10** | `resume` | `/sounds/audio_10_resume.mp3` | Admin menekan tombol **Lanjutkan (Resume)** setelah status pause. | **Chime Lanjut + Narasi Voice Over Aksa**:<br>*"Perhatian, ujian dilanjutkan kembali. Peserta dipersilakan melanjutkan pengerjaan."* | Konfirmasi audio bahwa timer ujian yang di-pause telah berjalan kembali. |

---

## 📢 2. Efek Suara Notifikasi UX Interaktif

Efek suara mikro untuk aksi pengguna di antarmuka web:

| Key Sound | Pemicu (*Trigger*) | Karakter & Pola Synthesizer | Keterangan & Tujuan UX |
| :--- | :--- | :--- | :--- |
| `session_paused` | Admin menekan tombol **Jeda (Pause)**. | **Pitch Down Chime** (`784 Hz` → `523 Hz`, 0.3s). | Konfirmasi audio bahwa countdown timer dihentikan sementara. |
| `session_resumed` | Admin menekan tombol **Lanjutkan (Resume)**. | **Pitch Up Chime** (`523 Hz` → `784 Hz`, 0.3s) + `audio_10_resume.mp3`. | Konfirmasi audio bahwa countdown timer berjalan kembali. |
| `grading_submitted` | Dokter penguji menekan tombol **Submit Nilai Akhir**. | **Positive Soft Beep** (`880 Hz` → `1318 Hz`, 0.25s). | Kepastian psikologis kepada dokter penguji bahwa nilai ter-submit. |
| `user_joined` | Penguji/Peserta baru bergabung di Presence. | **Subtle Water Drop / Blip** (`1200 Hz`, 0.08s). | Feedback auditori saat jumlah peserta online bertambah di Admin. |

---

## 🛠️ 3. Arsitektur Dual-Engine Audio Engine Praxis

Praxis menggunakan pendekatan **Dual-Engine Audio System** dengan strategi *fail-safe* tingkat tinggi:

```
                               ┌──────────────────────────────────────────────┐
                               │     Event Timer / Realtime WebSocket         │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                      ┌───────────────┴───────────────┐
                                      ▼                               ▼
                         Layer 1: MP3 Audio Assets       Layer 2: Web Audio API (Fallback)
                       ┌───────────────────────────┐   ┌───────────────────────────────────┐
                       │  /public/sounds/*.mp3     │   │  Browser AudioContext Synthesizer │
                       │  (Human Studio Recording) │   │  (Zero-Latency, 100% Offline)     │
                       └──────────────┬────────────┘   └─────────────────┬─────────────────┘
                                      │                                  │
                                      └─────────────────┬────────────────┘
                                                        ▼
                                       Layer 3: SpeechSynthesis (Id-ID)
                                       ┌─────────────────────────────────┐
                                       │ TTS Bahasa Indonesia Fallback   │
                                       └─────────────────────────────────┘
```

1. **Layer 1 — Studio MP3 Assets (Primary)**:
   Menggunakan rekaman suara manusia asli (Aksa / Voice Actor Praxis) di direktori `/public/sounds/*.mp3`.
2. **Layer 2 — Web Audio API Synthesizer (Zero-Latency Fallback)**:
   Menggunakan `OscillatorNode` dan `GainNode` native browser jika koneksi lambat atau file audio terhambat.
3. **Layer 3 — SpeechSynthesis Voiceover (Text Fallback)**:
   Memutar narasi naskah Bahasa Indonesia secara otomatis jika browser belum mengunduh aset audio.

---

## 📁 4. Struktur Direktori Aset Audio Terverifikasi

```
praxis/
├── public/
│   └── sounds/
│       ├── audio_01_waiting_room.mp3       # Narasi & Welcoming Waiting Room
│       ├── audio_02_read_scenario.mp3      # Instruksi membaca skenario di luar stase
│       ├── audio_03_start_exam.mp3         # Bel & instruksi mulai ujian stase
│       ├── audio_04_warning_time.mp3       # Bel & instruksi sisa waktu 3 menit
│       ├── audio_04_warning_1min.mp3       # (Alias pendukung) Peringatan 3 menit
│       ├── audio_05_stop_transit.mp3       # Bel & instruksi waktu selesai / rotasi
│       ├── audio_06_rest_break.mp3         # Bel & instruksi stase istirahat
│       ├── audio_07_finish_exam.mp3        # Fanfare & instruksi sirkuit tuntas
│       ├── audio_08_admin_broadcast.mp3    # Suara chime interkom broadcast admin
│       ├── audio_09_countdown.mp3          # Sound tick countdown 10 detik terakhir
│       ├── audio_10_resume.mp3             # Suara instruksi resume ujian dari Aksa
│       ├── broadcast.mp3                   # Suara chime interkom alternatif
│       └── README.txt                      # Catatan lisensi & pembuatan aset audio
├── src/
│   └── services/
│       └── audioService.js                 # Engine pemutar audio & synthesizer
└── SOUND.md                                # Berkas dokumentasi ini
```
