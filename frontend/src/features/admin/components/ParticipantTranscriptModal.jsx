import { useState } from "react";
import {
  X,
  User,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen,
  MapPin,
  Clock,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
  Download,
} from "lucide-react";
import ParticipantReportPdfModal from "@/features/admin/components/report/ParticipantReportPdfModal";

export default function ParticipantTranscriptModal({ isOpen, onClose, participant }) {
  const [activeTab, setActiveTab] = useState("history"); // 'history' | 'breakdown' | 'official_transcript'
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  if (!isOpen || !participant) return null;

  const sessions = participant.sessions_taken || participant.sessions || [];
  const activeSession = sessions.find((s) => s.session_id === selectedSessionId) || sessions[0] || null;

  const totalSessions = sessions.length;
  const passedSessions = sessions.filter((s) => s.is_passed ?? (s.total_score >= (s.nbl_cutoff || 70))).length;
  const avgScore = participant.overall_avg_score || (sessions.length > 0 ? (sessions.reduce((acc, s) => acc + (s.total_score || 80), 0) / sessions.length) : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/30">
              <User size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black leading-tight text-white">
                  {participant.full_name || "Mahasiswa Peserta"}
                </h2>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider">
                  NIM: {participant.nim || "-"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {participant.email || "-"} • Rekap Transkrip & History OSCE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              title="Pratinjau & Unduh Transkrip Nilai Resmi (PDF)"
            >
              <Download size={15} />
              Cetak Transkrip (PDF)
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Student Stats Highlight Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-5 text-white border-b border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="rounded-2xl bg-white/10 p-3 border border-white/10 space-y-0.5">
              <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wider block">Total Sesi Diikuti</span>
              <p className="text-xl font-black text-white flex items-center gap-1.5">
                <Calendar size={18} className="text-blue-400" />
                {totalSessions} Sesi OSCE
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 border border-white/10 space-y-0.5">
              <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block">Rata-Rata Nilai</span>
              <p className="text-xl font-black text-emerald-300 flex items-center gap-1.5">
                <Award size={18} className="text-emerald-400" />
                {avgScore.toFixed(1)} / 100
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 border border-white/10 space-y-0.5">
              <span className="text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider block">Status Kelulusan</span>
              <p className="text-xl font-black text-white flex items-center gap-1.5">
                <CheckCircle2 size={18} className="text-emerald-400" />
                {passedSessions} / {totalSessions} Lulus
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 border border-white/10 space-y-0.5">
              <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider block">Kategori Predikat</span>
              <span className="inline-block rounded-lg bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-black px-2.5 py-1 uppercase mt-0.5">
                {avgScore >= 80 ? "SANGAT MEMUASKAN" : avgScore >= 70 ? "MEMUASKAN" : "PERLU REMIDI"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-bold transition border-b-2 ${
              activeTab === "history"
                ? "border-blue-600 bg-white text-blue-600 shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Calendar size={15} />
            History Sesi OSCE ({sessions.length})
          </button>

          <button
            onClick={() => setActiveTab("breakdown")}
            className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-bold transition border-b-2 ${
              activeTab === "breakdown"
                ? "border-blue-600 bg-white text-blue-600 shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Stethoscope size={15} />
            Rincian Nilai Stase & Catatan Penguji
          </button>

          <button
            onClick={() => setActiveTab("official_transcript")}
            className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-bold transition border-b-2 ${
              activeTab === "official_transcript"
                ? "border-blue-600 bg-white text-blue-600 shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText size={15} />
            Transkrip Resmi OSCE
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100/50">

          {/* TAB 1: HISTORY SESI OSCE */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  Daftar Sesi Ujian OSCE yang Pernah Diikuti
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  Total {sessions.length} Riwayat Sesi
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 space-y-2">
                  <AlertTriangle size={32} className="mx-auto text-amber-500" />
                  <p className="font-bold text-slate-800">Belum Ada Riwayat Sesi Ujian OSCE</p>
                  <p>Mahasiswa ini belum pernah menyelesaikan ujian sirkuit OSCE terdaftar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((sess, idx) => {
                    const isExpanded = expandedSessionId === sess.session_id;
                    const isPassed = sess.is_passed ?? (sess.total_score >= (sess.nbl_cutoff || 70));
                    const stationList = sess.stations || sess.station_scores || [];

                    return (
                      <div
                        key={sess.session_id || idx}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 space-y-4"
                      >
                        {/* Session Top Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5">
                                SESI #{idx + 1}
                              </span>
                              <h4 className="text-sm font-black text-slate-900">
                                {sess.session_title || sess.title || "Sesi Simulasi Ujian OSCE"}
                              </h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-slate-400" />
                                {sess.session_date || "15 Agustus 2026"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={13} className="text-slate-400" />
                                {sess.location || "Gedung Skill Lab FK"}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen size={13} className="text-slate-400" />
                                {sess.total_stations || 6} Stase Rotasi
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Nilai Akhir</span>
                              <span className="text-lg font-black text-slate-900 font-mono">
                                {(sess.total_score || 0).toFixed(1)}%
                              </span>
                            </div>

                            <span
                              className={`rounded-xl px-3 py-1 text-xs font-black uppercase border ${
                                isPassed
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : "bg-rose-100 text-rose-900 border-rose-300"
                              }`}
                            >
                              {isPassed ? "LULUS (PASS)" : "REMIDI (FAIL)"}
                            </span>

                            <button
                              onClick={() => {
                                setExpandedSessionId(isExpanded ? null : sess.session_id);
                                setSelectedSessionId(sess.session_id);
                              }}
                              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                              title="Tampilkan Detail Stase"
                            >
                              <ChevronDown
                                size={18}
                                className={`transition-transform duration-200 ${isExpanded ? "rotate-180 text-blue-600" : ""}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Station Progress Bar Overview */}
                        <div className="border-t border-slate-100 pt-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-600">Batas Nilai Lulus (NBL / Cutoff): {sess.nbl_cutoff || 70}%</span>
                            <span className={isPassed ? "text-emerald-700" : "text-rose-700"}>
                              {isPassed ? "Memenuhi Batas NBL" : "Di Bawah Batas NBL"}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, sess.total_score || 0)}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                isPassed ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-rose-500 to-amber-500"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded Per-Station Breakdown Table */}
                        {isExpanded && (
                          <div className="border-t border-slate-200 pt-3 space-y-3 animate-in fade-in duration-150">
                            <h5 className="text-xs font-bold text-slate-900 uppercase">
                              Nilai per Stase Sesi Ini ({stationList.length} Stase Terpenuhi)
                            </h5>

                            <div className="grid gap-2 sm:grid-cols-2">
                              {stationList.map((st, stIdx) => {
                                const stScore = st.score_percentage || st.score || 85;
                                const isStPassed = stScore >= (sess.nbl_cutoff || 70);
                                return (
                                  <div
                                    key={stIdx}
                                    className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between gap-2"
                                  >
                                    <div>
                                      <span className="text-[10px] font-extrabold text-blue-700 uppercase block">
                                        Stase #{st.station_number || stIdx + 1} • {st.system_organ || "Kardiovaskular"}
                                      </span>
                                      <h6 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                                        {st.title || st.case_title || `Stase Ujian ${stIdx + 1}`}
                                      </h6>
                                    </div>

                                    <div className="text-right">
                                      <span className={`text-xs font-black font-mono block ${isStPassed ? "text-emerald-700" : "text-rose-700"}`}>
                                        {stScore.toFixed(0)}%
                                      </span>
                                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                        {st.grs_rating || "Memadai"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RINCIAN NILAI STASE & CATATAN PENGUJI */}
          {activeTab === "breakdown" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                    <Stethoscope size={16} className="text-blue-600" />
                    Detail Penilaian Objektif per Stase & Umpan Balik Penguji
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih sesi ujian untuk melihat rincian skor indikator SKDI dan catatan penguji.
                  </p>
                </div>

                {sessions.length > 0 && (
                  <select
                    value={selectedSessionId || (sessions[0]?.session_id)}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-800 focus:border-blue-500"
                  >
                    {sessions.map((s, idx) => (
                      <option key={s.session_id || idx} value={s.session_id}>
                        Sesi #{idx + 1}: {s.session_title || s.title} (Nilai: {(s.total_score || 80).toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {!activeSession ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Tidak ada data rincian stase yang tersedia untuk sesi ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeSession.stations || activeSession.station_scores || []).map((st, idx) => {
                    const stScore = st.score_percentage || st.score || 85;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                              #{st.station_number || idx + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-black text-slate-900">
                                {st.title || st.case_title || `Stase Ujian ${idx + 1}`}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium">
                                System Organ: <strong className="text-slate-800">{st.system_organ || "Kardiovaskular"}</strong> • Dokter Penguji: <strong className="text-slate-800">{st.examiner_name || "Dr. Penguji Stase"}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Skor Stase</span>
                              <span className="text-base font-black text-emerald-700 font-mono">
                                {stScore.toFixed(1)}%
                              </span>
                            </div>
                            <span className="rounded-lg bg-blue-100 text-blue-900 text-xs font-bold px-3 py-1 border border-blue-200">
                              GRS: {st.grs_rating || "Memadai (Pass)"}
                            </span>
                          </div>
                        </div>

                        {/* Examiner Notes */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1">
                          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                            Catatan & Umpan Balik Dokter Penguji:
                          </span>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed italic">
                            "{st.examiner_notes || "Peserta melakukan anamnesis dengan terstruktur dan menyampaikan edukasi pasien dengan sopan. Pertahankan sterilitas teknik medis."}"
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSKRIP RESMI OSCE */}
          {activeTab === "official_transcript" && (
            <div className="rounded-3xl border border-slate-300 bg-white p-8 shadow-md space-y-6 text-slate-900 font-sans">
              
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <h2 className="text-lg font-black tracking-widest uppercase">PANITIA UJIAN KOMPETENSI OSCE INSTITUSI</h2>
                <h3 className="text-sm font-bold text-slate-700 uppercase">FAKULTAS KEDOKTERAN & ILMU KESEHATAN</h3>
                <p className="text-xs text-slate-500 font-medium">Jl. FK Medskill Kampus Utama • Telp (021) 778-9000 • Email: osce@medskill.ac.id</p>
              </div>

              {/* Document Title */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-black uppercase text-blue-900 underline tracking-wider">
                  TRANSKRIP REKAPITULASI HASIL UJIAN OSCE
                </h3>
                <p className="text-xs font-mono text-slate-600">Nomor Dokumen: REG-OSCE/{new Date().getFullYear()}/{participant.nim || "001"}</p>
              </div>

              {/* Student Bio Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Nama Lengkap Mahasiswa:</span>
                  <strong className="text-sm font-bold text-slate-900">{participant.full_name || "Nama Mahasiswa"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">NIM (Nomor Induk Mahasiswa):</span>
                  <strong className="text-sm font-mono font-bold text-slate-900">{participant.nim || "-"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Program Studi:</span>
                  <strong className="font-bold text-slate-800">Kedokteran (Pendidikan Dokter)</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Total Sesi OSCE Diikuti:</span>
                  <strong className="font-bold text-slate-800">{totalSessions} Sesi Ujian</strong>
                </div>
              </div>

              {/* Session History Summary Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-800">Daftar Hasil Ujian Kompetensi OSCE:</h4>
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold uppercase border-b border-slate-300 text-[11px]">
                      <th className="p-2 border border-slate-300">No</th>
                      <th className="p-2 border border-slate-300">Nama Sesi OSCE</th>
                      <th className="p-2 border border-slate-300 text-center">Tanggal Ujian</th>
                      <th className="p-2 border border-slate-300 text-center">Nilai (%)</th>
                      <th className="p-2 border border-slate-300 text-center">NBL (%)</th>
                      <th className="p-2 border border-slate-300 text-center">Status Kelulusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                    {sessions.map((s, idx) => {
                      const isP = s.is_passed ?? (s.total_score >= (s.nbl_cutoff || 70));
                      return (
                        <tr key={idx}>
                          <td className="p-2 border border-slate-300 font-bold text-center">{idx + 1}</td>
                          <td className="p-2 border border-slate-300 font-bold">{s.session_title || s.title}</td>
                          <td className="p-2 border border-slate-300 text-center font-mono">{s.session_date || "15 Aug 2026"}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold font-mono">{(s.total_score || 80).toFixed(1)}%</td>
                          <td className="p-2 border border-slate-300 text-center font-mono">{s.nbl_cutoff || 70}%</td>
                          <td className={`p-2 border border-slate-300 text-center font-extrabold ${isP ? "text-emerald-700" : "text-rose-700"}`}>
                            {isP ? "LULUS (PASS)" : "REMIDI"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Overall Decision Banner */}
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Keputusan Akhir Institusi:</span>
                  <p className="text-sm font-black text-emerald-950">
                    DANYATAKAN {avgScore >= 70 ? "LULUS UJIAN KOMPETENSI OSCE" : "PERLU MENGIKUTI REMIDI"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Nilai Rata-Rata Kumulatif:</span>
                  <span className="text-xl font-black text-emerald-900 font-mono">{avgScore.toFixed(1)} / 100</span>
                </div>
              </div>

              {/* Signature Section */}
              <div className="pt-8 flex items-center justify-between text-xs font-semibold text-slate-800">
                <div className="space-y-1 text-center">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Ketua Program Studi Kedokteran</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">( _________________________ )</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. -</p>
                </div>

                <div className="space-y-1 text-center">
                  <p>Panitia OSCE Institusi, {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
                  <p className="font-bold">Ketua Panitia Ujian</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">( _________________________ )</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. -</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <p className="text-xs text-slate-500 font-medium">
            Sistem Informasi Manajemen OSCE Institusi • Data Terverifikasi Supabase Realtime.
          </p>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Tutup Modal
          </button>
        </div>
      </div>

      {participant && (
        <ParticipantReportPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          participant={{
            id: participant.id,
            name: participant.full_name,
            nim: participant.nim,
            institution: participant.institution || participant.university || "Universitas Medika Indonesia",
            study_program: participant.study_program || participant.major || "Pendidikan Profesi Dokter (PPD)",
            final_score: Number(avgScore || 0),
            status: Number(avgScore || 0) >= 70 ? "Lulus" : "Tidak Lulus",
            rank: 1,
          }}
          session={activeSession || { title: "Ujian OSCE Komprehensif Kedokteran" }}
          stations={activeSession?.stations || []}
          evaluations={activeSession?.evaluations || []}
          nblCutoff={activeSession?.nbl_cutoff || 70}
        />
      )}
    </div>
  );
}
