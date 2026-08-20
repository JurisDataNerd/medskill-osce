import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { getParticipantDetailById } from "@/services/session.service";
import {
  ArrowLeft,
  User,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  ChevronDown,
  Stethoscope,
  MapPin,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function ParticipantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history"); // 'history' | 'breakdown' | 'transcript'
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await getParticipantDetailById(id);
      setParticipant(data);
    } catch (err) {
      console.error("Error loading participant detail:", err);
      setParticipant(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[450px] flex-col items-center justify-center text-xs font-semibold text-slate-500 space-y-2">
          <Loader2 size={28} className="animate-spin text-blue-600" />
          <span>Memuat Transkrip & History Peserta...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!participant) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500 space-y-3">
          <AlertTriangle size={36} className="mx-auto text-amber-500" />
          <h3 className="text-base font-bold text-slate-800">Data Peserta Tidak Ditemukan</h3>
          <p>Peserta dengan ID atau NIM ini tidak ditemukan.</p>
          <button
            onClick={() => navigate("/admin/participants")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            <ArrowLeft size={15} />
            Kembali ke Daftar Peserta
          </button>
        </div>
      </AdminLayout>
    );
  }

  const sessions = participant.sessions_taken || participant.sessions || [];
  const activeSession = sessions.find((s) => s.session_id === selectedSessionId) || sessions[0] || null;

  const totalSessions = sessions.length;
  const evaluatedCount = participant.evaluated_sessions_count || 0;
  const hasEvals = evaluatedCount > 0;
  const passedSessions = sessions.filter((s) => s.has_evaluations && s.is_passed).length;
  const avgScore = Number(participant.overall_avg_score) || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate("/admin/participants")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            Kembali ke Daftar Peserta
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition cursor-pointer"
            >
              <Printer size={15} />
              Cetak Transkrip Resmi
            </button>
          </div>
        </div>

        {/* Student Profile Hero Card */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-2xl font-black text-white shadow-lg shadow-blue-500/30">
                {(participant.full_name || "M").charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white">
                    {participant.full_name || "Tidak ada data"}
                  </h1>
                  <span className="rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold px-3 py-0.5 uppercase tracking-wider">
                    NIM: {participant.nim || "-"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {participant.email || "-"} • Program Studi Kedokteran
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-xl border text-xs font-black px-3.5 py-1.5 uppercase tracking-wider ${
                  !hasEvals
                    ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                    : avgScore >= 80
                    ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                    : avgScore >= 70
                    ? "bg-teal-500/20 border-teal-400/40 text-teal-300"
                    : "bg-rose-500/20 border-rose-400/40 text-rose-300"
                }`}
              >
                {!hasEvals
                  ? "STATUS: BELUM ADA EVALUASI PENGUJI"
                  : avgScore >= 80
                  ? "PREDIKAT: SANGAT MEMUASKAN"
                  : avgScore >= 70
                  ? "PREDIKAT: MEMUASKAN"
                  : "STATUS: PERLU REMIDI"}
              </span>
            </div>
          </div>

          {/* Student Key Performance Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="rounded-2xl bg-white/10 p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wider block">Total Sesi Ujian</span>
              <p className="text-2xl font-black text-white flex items-center gap-2">
                <Calendar size={20} className="text-blue-400" />
                {totalSessions} Sesi OSCE
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block">Rata-Rata Nilai</span>
              <p className="text-2xl font-black text-emerald-300 flex items-center gap-2 font-mono">
                <Award size={20} className="text-emerald-400" />
                {hasEvals ? `${avgScore.toFixed(1)} / 100` : "Belum Dinilai"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider block">Status Kelulusan</span>
              <p className="text-2xl font-black text-white flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-400" />
                {hasEvals ? `${passedSessions} / ${evaluatedCount} Lulus` : "Menunggu Evaluasi"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider block">Status Registrasi</span>
              <span className="inline-block rounded-lg bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-black px-3 py-1 uppercase">
                {participant.status || "Approved"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xs flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Calendar size={15} />
            History Sesi OSCE ({sessions.length} Sesi)
          </button>

          <button
            onClick={() => setActiveTab("breakdown")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "breakdown"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Stethoscope size={15} />
            Rincian Nilai Stase & Catatan Penguji
          </button>

          <button
            onClick={() => setActiveTab("transcript")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === "transcript"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText size={15} />
            Transkrip Resmi OSCE Institusi
          </button>
        </div>

        {/* TAB 1: HISTORY SESI OSCE */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Riwayat Sesi Ujian OSCE Mahasiswa
              </h2>
              <span className="text-xs font-bold text-slate-500">
                Total {sessions.length} Sesi Ujian Terdaftar
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
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 transition hover:border-blue-300"
                    >
                      {/* Session Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5">
                              SESI #{idx + 1}
                            </span>
                            <h3 className="text-base font-black text-slate-900">
                              {sess.session_title || sess.title || "Sesi Simulasi Ujian OSCE"}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} className="text-slate-400" />
                              {sess.session_date || "15 Agustus 2026"}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-slate-400" />
                              {sess.location || "Gedung Skill Lab FK"}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen size={14} className="text-slate-400" />
                              {sess.total_stations || 6} Stase Rotasi
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Nilai Akhir</span>
                            <span className="text-xl font-black text-slate-900 font-mono">
                              {sess.has_evaluations ? `${(sess.total_score || 0).toFixed(1)}%` : "Belum Dinilai"}
                            </span>
                          </div>

                          <span
                            className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase border ${
                              !sess.has_evaluations
                                ? "bg-amber-50 text-amber-900 border-amber-300"
                                : sess.is_passed
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : "bg-rose-100 text-rose-900 border-rose-300"
                            }`}
                          >
                            {!sess.has_evaluations
                              ? "MENUNGGU PENILAIAN PENGUJI"
                              : sess.is_passed
                              ? "LULUS (PASS)"
                              : "REMIDI (FAIL)"}
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
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600">Batas Nilai Lulus (NBL Cutoff): {sess.nbl_cutoff || 70}%</span>
                          <span className={isPassed ? "text-emerald-700" : "text-rose-700"}>
                            {isPassed ? "Memenuhi Batas NBL" : "Di Bawah Batas NBL"}
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, sess.total_score || 0)}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isPassed ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-rose-500 to-amber-500"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expanded Per-Station Table */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 pt-4 space-y-3 animate-in fade-in duration-150">
                          <h4 className="text-xs font-bold text-slate-900 uppercase">
                            Nilai per Stase Sesi Ini ({stationList.length} Stase Rotasi)
                          </h4>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {stationList.map((st, stIdx) => {
                              const stScore = st.score_percentage || st.score || 85;
                              const isStPassed = stScore >= (sess.nbl_cutoff || 70);
                              return (
                                <div
                                  key={stIdx}
                                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center justify-between gap-3"
                                >
                                  <div>
                                    <span className="text-[10px] font-extrabold text-blue-700 uppercase block">
                                      Stase #{st.station_number || stIdx + 1} • {st.system_organ || "Kardiovaskular"}
                                    </span>
                                    <h5 className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                                      {st.title || st.case_title || `Stase Ujian ${stIdx + 1}`}
                                    </h5>
                                  </div>

                                  <div className="text-right">
                                    <span className={`text-sm font-black font-mono block ${isStPassed ? "text-emerald-700" : "text-rose-700"}`}>
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
                <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                  <Stethoscope size={18} className="text-blue-600" />
                  Detail Penilaian Objektif per Stase & Umpan Balik Penguji
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih sesi ujian untuk melihat rincian skor indikator SKDI dan catatan penguji.
                </p>
              </div>

              {sessions.length > 0 && (
                <select
                  value={selectedSessionId || (sessions[0]?.session_id)}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-800 focus:border-blue-500"
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
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                            #{st.station_number || idx + 1}
                          </span>
                          <div>
                            <h3 className="text-base font-black text-slate-900">
                              {st.title || st.case_title || `Stase Ujian ${idx + 1}`}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              System Organ: <strong className="text-slate-800">{st.system_organ || "Kardiovaskular"}</strong> • Dokter Penguji: <strong className="text-slate-800">{st.examiner_name || "Dr. Penguji Stase"}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Skor Stase</span>
                            <span className="text-lg font-black text-emerald-700 font-mono">
                              {stScore.toFixed(1)}%
                            </span>
                          </div>
                          <span className="rounded-xl bg-blue-100 text-blue-900 text-xs font-bold px-3 py-1.5 border border-blue-200">
                            GRS: {st.grs_rating || "Memadai (Pass)"}
                          </span>
                        </div>
                      </div>

                      {/* Examiner Notes */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-1">
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
        {activeTab === "transcript" && (
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
    </AdminLayout>
  );
}
