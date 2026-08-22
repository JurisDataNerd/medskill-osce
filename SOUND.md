# 🔊 SOUND.md — Katalog & Spesifikasi Audio Sistem OSCE Praxis

Dokumen ini mendokumentasikan seluruh daftar efek suara (*sound cues*), bel ujian medis standar AIPKI/UKMPPD, suara notifikasi realtime, serta spesifikasi teknis sintesis audio yang digunakan di platform **Praxis OSCE**.

---

## 🔔 1. Bel Sirkuit Ujian OSCE (Standard Protocol)

Bel ujian medis ini disinkronkan secara global melalui WebSocket realtime ke seluruh layar Admin, Dokter Penguji, dan Peserta.

| No | Kode / Nama Sound | Pemicu (*Trigger*) | Pola & Karakter Audio | Spesifikasi Synthesizer (Web Audio API) | Keterangan & Instruksi Klinis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `bell_start` <br>*(Bel Mulai / Masuk)* | Saat **Transisi Awal** habis dan waktu pengerjaan kasus stase dimulai (Timer Action berjalan). | **Bel 1x**<br>Nada lonceng tunggal jernih, tinggi, dan tegas (~1.2 detik). | • Wave: `sine`<br>• Freq: `880 Hz` (A5)<br>• Gain: 0.4 (decay 1.2s) | *"Waktu pengerjaan stase dimulai. Peserta dipersilakan masuk ruangan stase dan memulai anamnesis / pemeriksaan."* |
| **2** | `bell_warning` <br>*(Bel Peringatan 2 Mnt)* | Saat waktu stase **tersisa 2 Menit** (120 detik) pada fase `action`. | **Bel 2x**<br>Dua ketukan beruntun dengan interval jeda 250ms (*Ding-Ding*). | • Wave: `triangle`<br>• Freq: `660 Hz` (E5)<br>• 2 pulse @ 0s & 0.25s (decay 0.18s) | *"Peringatan! Waktu stase tersisa 2 menit. Peserta dimohon menyelesaikan tindakan fisik dan menyampaikan edukasi/resep."* |
| **3** | `bell_rotation` <br>*(Bel Rotasi Stase)* | Saat countdown stase mencapai **00:00** (fase `action` selesai). | **Bel 3x**<br>Tiga ketukan nada bertingkat tegas (*Ding-Ding-Dong*). | • Wave: `sawtooth`<br>• Freq: `523.25 Hz` (C5) x2, `987.77 Hz` (B5) x1<br>• 3 pulse @ 0s, 0.3s, 0.6s | *"Waktu stase telah habis! Peserta meletakkan alat, meninggalkan pos, dan berpindah ke stase berikutnya."* |
| **4** | `bell_completed` <br>*(Bel Sirkuit Tuntas)* | Saat **Ronde Terakhir** (misal Ronde 6 dari 6) selesai mencapai 00:00. | **Grand Chime / Fanfare**<br>Harmoni 4 nada penyelesaian yang ramah. | • Wave: `sine`<br>• Freq: `523 Hz` → `659 Hz` → `783 Hz` → `1046 Hz` (C Major chord) | *"Seluruh rangkaian sirkuit ujian OSCE telah selesai. Peserta dipersilakan menuju ruang karantina pasca-ujian."* |

---

## 📢 2. Sound Notifikasi Realtime & UX

Efek suara kontekstual untuk mendukung interaksi dan peringatan darurat selama simulasi berlangsung:

| No | Kode / Nama Sound | Pemicu (*Trigger*) | Pola & Karakter Audio | Spesifikasi Teknis | Keterangan & Tujuan UX |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **5** | `broadcast_alert` <br>*(Intercom Chime)* | Admin mengirim pesan broadcast teks atau pengumuman darurat. | **Nada Interkom Dua Nada** (*Ding-Dong*) yang menarik perhatian. | • Wave: `sine`<br>• Freq: `880 Hz` (0.2s) → `1174.66 Hz` (0.4s)<br>• File: `/sounds/broadcast.mp3` | Memberi peringatan audio seketika kepada penguji/peserta agar membaca banner pengumuman darurat. |
| **6** | `session_paused` <br>*(Jeda Simulasi)* | Admin menekan tombol **Jeda (Pause)** saat ada kendala teknis. | **Pitch Down Chime**<br>Nada menurun lembut (*Beep-Bop down*). | • Wave: `sine`<br>• Freq: `784 Hz` → `523 Hz`<br>• Durasi: 0.3 detik | Memberi konfirmasi audio bahwa countdown timer dihentikan sementara. |
| **7** | `session_resumed` <br>*(Lanjut Simulasi)* | Admin menekan tombol **Lanjutkan (Resume)**. | **Pitch Up Chime**<br>Nada menaik (*Bop-Beep up*). | • Wave: `sine`<br>• Freq: `523 Hz` → `784 Hz`<br>• Durasi: 0.3 detik | Memberi konfirmasi audio bahwa ujian dilanjutkan kembali persis di titik jeda. |
| **8** | `countdown_tick` <br>*(Detik Kritis Transisi)* | 5 detik terakhir fase transisi (detik 5, 4, 3, 2, 1). | **Subtle Click / Tick**<br>Suara ketukan mekanik halus per detik. | • Wave: `sine`<br>• Freq: `1000 Hz` (durasi ultra-singkat 0.05s) | Aba-aba persiapan bagi peserta agar sudah berdiri di depan pintu stase sebelum bel mulai berbunyi. |
| **9** | `grading_submitted` <br>*(Pengajuan Nilai)* | Dokter penguji menekan tombol **"Submit Nilai Akhir"**. | **Positive Soft Beep**<br>Nada konfirmasi sukses. | • Wave: `sine`<br>• Freq: `880 Hz` → `1318 Hz` (durasi 0.25s) | Memberi kepastian psikologis kepada dokter penguji bahwa nilai rubrik telah tersimpan di server. |
| **10** | `user_joined` <br>*(Presence Ping)* | Penguji / Peserta baru bergabung ke Waiting Room. | **Subtle Water Drop / Blip** halus. | • Wave: `sine`<br>• Freq: `1200 Hz` (durasi 0.08s) | Feedback visual-auditori di layar Admin bahwa kehadiran pengguna bertambah. |

---

## 🎙️ 3. Voice Prompt (Narasi Suara Otomatis — Konsep & Rencana Pengembangan)

Untuk Skill Lab yang menggunakan *Central Hall Public Address (PA) Audio System* atau speaker terpusat, sistem dirancang untuk dapat memutar narasi suara terstandar berbahasa Indonesia:

| Event & Kode | Naskah Narasi Suara (*Voice Script*) | Waktu Pemutaran | Status Implementasi |
| :--- | :--- | :--- | :--- |
| **`voice_welcome`**<br>*(Selamat Datang Sesi)* | *"Selamat datang di Ujian OSCE. Sesi simulasi akan segera dimulai. Seluruh peserta dipersilakan menuju dan bersiap di depan pintu pos stase pertama masing-masing."* | Tepat saat Admin menekan tombol Mulai Sesi (**Awal Fase Transisi Persiapan Pos 1**). | 📝 *Rencana (Planned)* |
| **`voice_start`**<br>*(Mulai Ujian)* | *"Waktu pengerjaan stase dimulai, silakan masuk ke dalam ruangan."* | Tepat setelah bunyi `bell_start` (00:00 transisi habis, masuk stase). | 📝 *Rencana (Planned)* |
| **`voice_warning`**<br>*(Peringatan 2 Mnt)* | *"Peringatan, waktu pengerjaan tersisa dua menit."* | Tepat setelah bunyi `bell_warning` (sisa 120 detik). | 📝 *Rencana (Planned)* |
| **`voice_rotation`**<br>*(Rotasi Pos)* | *"Waktu pengerjaan selesai, silakan berpindah ke stase berikutnya."* | Tepat setelah bunyi `bell_rotation` (waktu stase habis 00:00). | 📝 *Rencana (Planned)* |
| **`voice_pause_apology`**<br>*(Permohonan Maaf Jeda)* | *"Mohon perhatian. Mohon maaf mengganggu jalannya ujian, sesi OSCE saat ini sedang dihentikan sementara waktu oleh admin pengawas. Seluruh peserta dan dokter penguji dimohon tetap tenang dan berada di pos masing-masing sampai ujian dilanjutkan kembali."* | Tepat saat Admin menekan tombol **Jeda (Pause)** selama simulasi berjalan. | 📝 *Rencana (Planned)* |
| **`voice_closing_thanks`**<br>*(Terima Kasih Penutupan)* | *"Seluruh rangkaian sirkuit ujian OSCE telah resmi selesai. Terima kasih kepada seluruh peserta dan dokter penguji atas dedikasi dan kerja samanya. Peserta dipersilakan meninggalkan area stase secara tertib menuju ruang karantina akhir."* | Tepat saat **Ronde Terakhir Tuntas** (`bell_completed` dibunyikan). | 📝 *Rencana (Planned)* |

---

## 🛠️ 4. Arsitektur Teknis Implementasi di Praxis

Praxis menerapkan strategi **Dual-Layer Audio Engine**:

```
                 ┌──────────────────────────────────────────────┐
                 │          Pemicu Waktu / WebSocket            │
                 └──────────────────────┬───────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
            Layer 1: Audio Asset MP3       Layer 2: Web Audio API (Fallback)
          ┌───────────────────────────┐   ┌───────────────────────────────────┐
          │  /public/sounds/*.mp3     │   │  Browser AudioContext Synthesizer │
          │  (Studio Recording Quality)│  │  (Zero-Latency, 100% Offline Safe)│
          └───────────────────────────┘   └───────────────────────────────────┘
```

1. **Layer 1 (Audio File Studio)**: File `.mp3` di direktori `praxis/public/sounds/` untuk kualitas audio akustik studio alami.
2. **Layer 2 (Zero-Latency Synthesizer Fallback)**: Menggunakan Web Audio API native browser (`OscillatorNode` & `GainNode`). Jika browser belum mengunduh file MP3 atau koneksi lambat, bel **tetap berbunyi secara instan tanpa delay 1 milidetik pun**.
3. **Autoplay Policy Handling**: Mengaktifkan AudioContext pada interaksi klik pertama pengguna (*gesture unlock*) agar browser tidak memblokir suara otomatis di background.

---

## 📁 5. Struktur Folder File Audio

```
praxis/
├── public/
│   └── sounds/
│       ├── broadcast.mp3             # Suara interkom broadcast admin
│       ├── bell_start.mp3            # Bel lonceng tunggal mulai ujian
│       ├── bell_warning.mp3          # Bel ganda peringatan 2 menit
│       ├── bell_rotation.mp3         # Bel tiga kali rotasi pos
│       ├── bell_completed.mp3        # Fanfare sirkuit tuntas
│       ├── pause.mp3                 # Efek jeda
│       ├── resume.mp3                # Efek lanjut
│       ├── submit_grade.mp3          # Efek kirim nilai
│       │
│       ├── [PLANNED / VOICE ASSETS]
│       ├── voice_welcome.mp3         # Narasi selamat datang di transisi awal
│       ├── voice_pause_apology.mp3   # Narasi permohonan maaf saat sesi di-pause
│       └── voice_closing_thanks.mp3  # Narasi terima kasih saat sirkuit tuntas
└── SOUND.md                          # Dokumentasi spesifikasi audio ini
```
