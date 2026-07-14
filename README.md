Praxis Medskill - OSCE Platform

---

## ✨ Fitur Utama

* **[Fitur 1]:** Penjelasan singkat fitur 1.
* **[Fitur 2]:** Penjelasan singkat fitur 2.
* **[Fitur 3]:** Penjelasan singkat fitur 3.

---

## 🛠️ Tech Stack

* **Frontend:** [React](https://react.dev/) (menggunakan Vite)
* **Package Manager & Runtime:** [Bun](https://bun.sh/)
* **Styling:** [Tailwind CSS / Vanilla CSS / SCSS] *(sesuaikan)*
* **State Management / Routing:** [Zustand / React Router Dom] *(jika ada, hapus jika tidak pakai)*

---

## 📦 Getting Started

Ikuti instruksi di bawah ini untuk menjalankan proyek ini di mesin lokal kamu untuk keperluan *development* dan *testing*.

### Prasyarat

Pastikan kamu sudah menginstal **Bun** di sistem operasi kamu. Jika belum, instal dengan menjalankan perintah berikut di terminal:

```bash
curl -fsSL [https://bun.sh/install](https://bun.sh/install) | bash

```

*(Catatan: Untuk pengguna Windows, sangat disarankan menggunakan WSL).*

### Instalasi & Menjalankan Server Development

1. **Clone repository ini:**
```bash
git clone [https://github.com/](https://github.com/)[username-kamu]/[nama-repo].git
cd [nama-repo]

```


2. **Instal semua dependensi:**
```bash
bun install

```


3. **Jalankan server development:**
```bash
bun dev

```


Buka browser dan akses `http://localhost:5173` (atau port yang tertera di terminal) untuk melihat aplikasi.

---

## 🏗️ Build untuk Production

Untuk membuat versi aplikasi yang sudah dioptimasi dan siap di-deploy ke *production*, jalankan:

```bash
bun run build

```

File hasil *build* akan di-generate di dalam folder `dist/`.

Untuk melihat *preview* hasil *build* secara lokal sebelum di-deploy:

```bash
bun run preview

```

---

## 📂 Struktur Proyek

*(Sesuaikan bagan di bawah ini dengan struktur folder asli proyekmu)*

```text
├── public/           # Aset statis (favicon, dll)
├── src/
│   ├── assets/       # Gambar, font, icon
│   ├── components/   # Komponen React yang reusable
│   ├── pages/        # Komponen halaman (jika pakai routing)
│   ├── App.jsx       # Komponen utama aplikasi
│   └── main.jsx      # Entry point aplikasi
├── index.html        # Template HTML utama
├── package.json      # Metadata proyek & daftar dependensi
├── bun.lockb         # Binary lockfile bawaan Bun (cepat & wajib masuk git)
└── README.md         # Dokumentasi proyek

```

---

## 🤝 Contributing

Kontribusi selalu dipersilakan! Jika ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru untuk fitur kamu (`git checkout -b feature/FiturKeren`)
3. Commit perubahan kamu (`git commit -m 'Menambahkan FiturKeren'`)
4. Push ke branch tersebut (`git push origin feature/FiturKeren`)
5. Buka **Pull Request**

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk informasi lebih lanjut.

```

```
