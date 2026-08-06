import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  Search,
  Filter,
  BarChart2,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";

const MOCK_REPORT_SESSIONS = [
  { id: "sess-01", name: "Ujian Komprehensif OSCE Gelombang 1 - T.A 2025/2026", date: "6 Agustus 2026", status: "Finished", examinees_count: 48, pass_rate: 91.7, nbl_cutoff: 72.4 },
  { id: "sess-02", name: "Tryout OSCE Nasional Fakultas Kedokteran", date: "15 Juli 2026", status: "Finished", examinees_count: 60, pass_rate: 88.3, nbl_cutoff: 70.0 },
];

const MOCK_RECAP_DATA = [
  { rank: 1, nim: "20200710042", name: "Ahmad Rizky Pratama", s1: 95.8, s2: 92.0, s3: 88.5, s4: 94.0, s5: 90.0, s6: 91.5, s7: 93.0, s8: 96.0, final_score: 92.6, global_rating: "Superior", status: "Lulus" },
  { rank: 2, nim: "20200710001", name: "Budi Santoso", s1: 85.0, s2: 88.0, s3: 82.0, s4: 90.0, s5: 86.0, s6: 87.5, s7: 89.0, s8: 91.0, final_score: 87.3, global_rating: "Lulus", status: "Lulus" },
  { rank: 3, nim: "20200710018", name: "Siti Rahmawati", s1: 88.5, s2: 84.0, s3: 86.0, s4: 87.0, s5: 85.0, s6: 89.0, s7: 88.0, s8: 90.0, final_score: 87.2, global_rating: "Lulus", status: "Lulus" },
  { rank: 4, nim: "20200710025", name: "Dewi Anggraini", s1: 78.0, s2: 80.0, s3: 75.0, s4: 82.0, s5: 79.0, s6: 81.0, s7: 83.0, s8: 84.0, final_score: 80.3, global_rating: "Lulus", status: "Lulus" },
  { rank: 5, nim: "20200710033", name: "Fajar Nugraha", s1: 72.0, s2: 74.0, s3: 71.0, s4: 73.0, s5: 70.0, s6: 75.0, s7: 76.0, s8: 72.0, final_score: 72.9, global_rating: "Borderline", status: "Lulus" },
  { rank: 6, nim: "20200710047", name: "Rian Hidayat", s1: 65.0, s2: 68.0, s3: 62.0, s4: 70.0, s5: 64.0, s6: 66.0, s7: 69.0, s8: 67.0, final_score: 66.4, global_rating: "Tidak Lulus", status: "Tidak Lulus" },
];

export default function ReportsPage() {
  const navigate = useNavigate();

  const [selectedSessionId, setSelectedSessionId] = useState("sess-01");
  const [activeTab, setActiveTab] = useState("recap"); // recap, standard_setting, analytics
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const activeSession = MOCK_REPORT_SESSIONS.find((s) => s.id === selectedSessionId) || MOCK_REPORT_SESSIONS[0];

  const filteredRecap = MOCK_RECAP_DATA.filter(
    (row) =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.nim.includes(searchQuery)
  );

  function handleExportExcel() {
    alert("Mengunduh Rekapitulasi Nilai Ujian OSCE (.xlsx)...");
  }

  function handleExportPdf() {
    alert("Mencetak Berita Acara & Sertifikat Hasil Ujian (.pdf)...");
  }

  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Laporan & Rekapitulasi Nilai OSCE
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat analitik hasil ujian, penetapan Nilai Batas Lulus (NBL Borderline Regression), serta pencetakan berita acara resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition"
          >
            <FileSpreadsheet size={16} />
            Ekspor Excel (.xlsx)
          </button>
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
          >
            <FileText size={16} />
            Cetak Berita Acara (PDF)
          </button>
        </div>
      </div>

      {/* Session Selector Banner */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 font-bold">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Pilih Sesi Ujian OSCE</span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {MOCK_REPORT_SESSIONS.map((sess) => (
                <option key={sess.id} value={sess.id}>
                  {sess.name} ({sess.date})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1 font-extrabold">
            Status: Selesai & Terkunci
          </span>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Peserta Evaluasi</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{activeSession.examinees_count} <span className="text-xs font-medium text-slate-500">Orang</span></span>
            <Users size={20} className="text-blue-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Tingkat Kelulusan (Pass Rate)</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-600">{activeSession.pass_rate}%</span>
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Nilai Batas Lulus (NBL Cutoff)</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-indigo-600">{activeSession.nbl_cutoff}%</span>
            <TrendingUp size={20} className="text-indigo-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Metode Standard Setting</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              Borderline Regression
            </span>
            <BarChart2 size={20} className="text-amber-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        {[
          { id: "recap", label: "Tabel Rekapitulasi Nilai Peserta (Stase 1 - 8)", icon: FileText },
          { id: "standard_setting", label: "Standard Setting NBL (Borderline Regression)", icon: TrendingUp },
          { id: "analytics", label: "Statistik Kesulitan Stase", icon: BarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition border-b-2 ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: REKAPITULASI TABEL NILAI PESERTA */}
      {activeTab === "recap" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari NIM atau nama peserta..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <span className="text-xs font-bold text-slate-500">
              Menampilkan {filteredRecap.length} dari {MOCK_RECAP_DATA.length} Peserta
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">NIM & Nama Peserta</th>
                  <th className="p-3 text-center">St 1</th>
                  <th className="p-3 text-center">St 2</th>
                  <th className="p-3 text-center">St 3</th>
                  <th className="p-3 text-center">St 4</th>
                  <th className="p-3 text-center">St 5</th>
                  <th className="p-3 text-center">St 6</th>
                  <th className="p-3 text-center">St 7</th>
                  <th className="p-3 text-center">St 8</th>
                  <th className="p-3 text-right">Skor Akhir</th>
                  <th className="p-3 text-center">Global Rating</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredRecap.map((row) => (
                  <tr
                    key={row.nim}
                    onClick={() => setSelectedStudent(row)}
                    className="hover:bg-blue-50/60 cursor-pointer transition"
                  >
                    <td className="p-3 font-bold text-slate-500">#{row.rank}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900 hover:text-blue-600 transition">{row.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">NIM: {row.nim}</p>
                    </td>
                    <td className="p-3 text-center font-semibold">{row.s1}</td>
                    <td className="p-3 text-center font-semibold">{row.s2}</td>
                    <td className="p-3 text-center font-semibold">{row.s3}</td>
                    <td className="p-3 text-center font-semibold">{row.s4}</td>
                    <td className="p-3 text-center font-semibold">{row.s5}</td>
                    <td className="p-3 text-center font-semibold">{row.s6}</td>
                    <td className="p-3 text-center font-semibold">{row.s7}</td>
                    <td className="p-3 text-center font-semibold">{row.s8}</td>
                    <td className="p-3 text-right font-black text-blue-700">{row.final_score}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        row.global_rating === "Superior"
                          ? "bg-blue-100 border-blue-300 text-blue-900"
                          : row.global_rating === "Lulus"
                          ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                          : row.global_rating === "Borderline"
                          ? "bg-amber-100 border-amber-300 text-amber-900"
                          : "bg-rose-100 border-rose-300 text-rose-900"
                      }`}>
                        {row.global_rating}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        row.status === "Lulus"
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-rose-600 text-white shadow-2xs"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STANDARD SETTING (BORDERLINE REGRESSION) */}
      {activeTab === "standard_setting" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900">
              Analisis Standard Setting (Borderline Regression Method)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Penetapan Nilai Batas Lulus (NBL) nasional dengan meregresikan Skor Objektif Rubrik terhadap Global Rating penguji.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                Hasil Persamaan Regresi Linear NBL:
              </h3>
              <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                <p><strong>Equation:</strong> Y (Skor Objektif) = 18.4 + 1.82 * X (Global Rating Level)</p>
                <p><strong>R-Squared (R²):</strong> 0.894 (Korelasi Sangat Kuat)</p>
                <p><strong>NBL Cut-off (Nilai Batas Lulus):</strong> <span className="text-indigo-600 font-black text-sm">72.4%</span></p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Peserta dengan skor terbobot di atas <strong>72.4%</strong> dinyatakan Lulus secara objektif berdasarkan standar kompetensi nasional.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                Sebaran Kelompok Global Rating:
              </h3>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                  <span>Superior (Level 4):</span>
                  <strong>12 Peserta (Rata-rata 92.4%)</strong>
                </div>
                <div className="flex justify-between items-center p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                  <span>Lulus (Level 3):</span>
                  <strong>28 Peserta (Rata-rata 84.1%)</strong>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <span>Borderline (Level 2):</span>
                  <strong>4 Peserta (Rata-rata 72.9%)</strong>
                </div>
                <div className="flex justify-between items-center p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                  <span>Tidak Lulus (Level 1):</span>
                  <strong>4 Peserta (Rata-rata 64.2%)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATISTIK ANALITIK STASE */}
      {activeTab === "analytics" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900">
              Analitik Tingkat Kesulitan Stase Ujian (Stase 1 - 8)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Statistik tingkat kesulitan, rata-rata skor per stase, serta indeks daya beda item soal.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { num: 1, title: "Kardiovaskular", avg: 86.4, status: "Sedang" },
              { num: 2, title: "Respirasi", avg: 88.2, status: "Mudah" },
              { num: 3, title: "Neurologi", avg: 74.5, status: "Sangat Sulit" },
              { num: 4, title: "Digestif", avg: 82.1, status: "Sedang" },
              { num: 5, title: "Muskuloskeletal", avg: 85.0, status: "Sedang" },
              { num: 6, title: "Endokrin & Metabolik", avg: 79.8, status: "Sulit" },
              { num: 7, title: "Urologi & Nefrologi", avg: 83.4, status: "Sedang" },
              { num: 8, title: "Perilaku & Edukasi", avg: 91.2, status: "Mudah" },
            ].map((st) => (
              <div key={st.num} className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                    STASE {st.num}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{st.status}</span>
                </div>
                <h3 className="text-xs font-black text-slate-900">{st.title}</h3>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-[11px] text-slate-500">Rata-rata Skor:</span>
                  <span className="text-sm font-black text-blue-700">{st.avg}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDENT DETAIL BREAKDOWN MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">
                  Rincian Transkrip Nilai Peserta #{selectedStudent.rank}
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  {selectedStudent.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">NIM: {selectedStudent.nim}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Score Badges Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Skor Akhir Terbobot</span>
                <span className="text-2xl font-black text-blue-700">{selectedStudent.final_score}%</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Global Rating</span>
                <span className="text-sm font-black text-slate-800 block pt-1">{selectedStudent.global_rating}</span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Status kelulusan</span>
                <span className="text-sm font-black text-emerald-800 block pt-1">{selectedStudent.status}</span>
              </div>
            </div>

            {/* Breakdown Per Station */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Breakdown Skor per Stase (Stase 1 - 8):</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { num: 1, name: "Kardiovaskular", score: selectedStudent.s1 },
                  { num: 2, name: "Respirasi", score: selectedStudent.s2 },
                  { num: 3, name: "Istirahat #1", score: selectedStudent.s3 },
                  { num: 4, name: "Neurologi", score: selectedStudent.s4 },
                  { num: 5, name: "Traumatologi", score: selectedStudent.s5 },
                  { num: 6, name: "Digestif", score: selectedStudent.s6 },
                  { num: 7, name: "Istirahat #2", score: selectedStudent.s7 },
                  { num: 8, name: "ACLS & Resusitasi", score: selectedStudent.s8 },
                ].map((st) => (
                  <div key={st.num} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">Stase {st.num}: {st.name}</span>
                    <span className="text-sm font-black text-slate-900">{st.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  alert(`Mencetak PDF Transkrip Nilai Resmi untuk ${selectedStudent.name}...`);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Cetak Transkrip PDF
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}