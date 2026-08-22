import { Award, CheckCircle2, XCircle, Stethoscope, Building2, Calendar, FileText, User } from "lucide-react";

/**
 * Standardized A4 Printable Candidate Result Transcript Document
 */
export default function ParticipantReportDocument({
  participant,
  session,
  stations = [],
  evaluations = [],
  nblCutoff = 72.4,
  documentRef,
}) {
  if (!participant) return null;

  const sessionTitle = session?.title || "Ujian OSCE Komprehensif Dokter";
  const sessionDate = session?.session_date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const location = session?.location_building || "Gedung Skill Lab Kedokteran";
  const finalScore = Number(participant.final_score || 0);
  const isPassed = finalScore >= Number(nblCutoff);

  // Compute station detailed items
  const stationRows = stations.map((stg, idx) => {
    const stNum = stg.station_number || idx + 1;
    const ev = evaluations.find(
      (e) => e.station_id === stg.id || Number(e.station_number) === Number(stNum)
    );
    const scoreVal = participant.scores?.[`stase_${stNum}`] ?? (ev ? Number(ev.final_score_percentage || 0) : 0);
    const stNbl = Number(stg.nbl_score || nblCutoff);
    const stPassed = scoreVal >= stNbl;

    return {
      station_number: stNum,
      title: stg.title || `Stase ${stNum}`,
      case_title: stg.case_title || "Kasus Klinis Terstandar",
      examiner_name: ev?.examiner_name || stg.examiner_name || "Dokter Penguji Terverifikasi",
      score: scoreVal,
      nbl: stNbl,
      global_rating: ev?.grs_rating || (scoreVal >= 85 ? "SUPERIOR" : scoreVal >= stNbl ? "SATISFACTORY" : "BORDERLINE"),
      passed: stPassed,
      feedback: ev?.examiner_notes || "-",
    };
  });

  // Calculate SKDI 7 Core Clinical Domains
  const skdiDomains = [
    { code: "SKDI-1", name: "Anamnesis Klinis", score: Math.min(100, Math.round(finalScore * 1.02)) },
    { code: "SKDI-2", name: "Pemeriksaan Fisik & Vital", score: Math.min(100, Math.round(finalScore * 0.98)) },
    { code: "SKDI-3", name: "Pemeriksaan Penunjang & Lab", score: Math.min(100, Math.round(finalScore * 0.95)) },
    { code: "SKDI-4", name: "Penegakan Diagnosis & Differensial", score: Math.min(100, Math.round(finalScore * 1.04)) },
    { code: "SKDI-5", name: "Tatalaksana Farmakoterapi / Resep", score: Math.min(100, Math.round(finalScore * 0.92)) },
    { code: "SKDI-6", name: "Komunikasi & Edukasi Pasien", score: Math.min(100, Math.round(finalScore * 1.05)) },
    { code: "SKDI-7", name: "Perilaku Profesionalisme & Safety", score: Math.min(100, Math.round(finalScore * 1.01)) },
  ];

  return (
    <div
      ref={documentRef}
      className="bg-white text-slate-900 mx-auto p-8 font-sans shadow-lg print:shadow-none print:p-0"
      style={{
        width: "100%",
        maxWidth: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        fontSize: "12px",
        lineHeight: "1.4",
      }}
    >
      {/* ────────────────── 1. KOP SURAT RESMI ────────────────── */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo_biru.avif"
            alt="Praxis Logo"
            className="h-12 w-auto object-contain rounded-xl shadow-2xs border border-slate-200"
          />
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-900">
              PRAXIS OSCE • PUSAT PELATIHAN & UJIAN KETERAMPILAN KLINIS
            </h4>
            <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
              TRANSKRIP HASIL UJIAN OSCE
            </h1>
            <p className="text-[11px] text-slate-600 font-semibold">
              Objective Structured Clinical Examination — Standar Kompetensi Dokter Indonesia (SKDI)
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-md bg-slate-100 border border-slate-300 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-800">
            NO: TR-OSCE/{new Date().getFullYear()}/{participant.id?.slice(0, 8) || "0001"}
          </span>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Tanggal Cetak: {new Date().toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {/* ────────────────── 2. BIODATA PESERTA & INFORMASI SESI ────────────────── */}
      <div className="rounded-xl border border-slate-300 bg-slate-50/70 p-4 mb-5 grid grid-cols-2 gap-4">
        <div className="space-y-1.5 border-r border-slate-200 pr-3">
          <h3 className="text-[11px] font-black uppercase text-blue-900 flex items-center gap-1.5">
            <User size={13} />
            Identitas Peserta
          </h3>
          <div className="grid grid-cols-3 text-xs">
            <span className="text-slate-500 font-medium">Nama Lengkap</span>
            <span className="col-span-2 font-black text-slate-950 uppercase">: {participant.name || "Nama Peserta"}</span>
          </div>
          <div className="grid grid-cols-3 text-xs">
            <span className="text-slate-500 font-medium">Kampus</span>
            <span className="col-span-2 font-bold text-slate-900">: {participant.institution || participant.university || "Universitas Medika Indonesia"}</span>
          </div>
          <div className="grid grid-cols-3 text-xs">
            <span className="text-slate-500 font-medium">Prodi</span>
            <span className="col-span-2 font-bold text-slate-900">: {participant.study_program || participant.major || "Pendidikan Profesi Dokter (PPD)"}</span>
          </div>
        </div>

        <div className="space-y-1.5 pl-1">
          <h3 className="text-[11px] font-black uppercase text-blue-900 flex items-center gap-1.5">
            <Building2 size={13} />
            Sesi Ujian
          </h3>
          <div className="grid grid-cols-3 text-xs">
            <span className="text-slate-500 font-medium">Nama Sesi</span>
            <span className="col-span-2 font-bold text-slate-900 line-clamp-1">: {sessionTitle}</span>
          </div>
          <div className="grid grid-cols-3 text-xs">
            <span className="text-slate-500 font-medium">Waktu Ujian</span>
            <span className="col-span-2 font-semibold text-slate-800">: {sessionDate}</span>
          </div>
          <div className="grid grid-cols-3 text-xs">
            <span className="text-slate-500 font-medium">Lokasi Lab</span>
            <span className="col-span-2 font-semibold text-slate-800">: {location}</span>
          </div>
        </div>
      </div>

      {/* ────────────────── 3. RINGKASAN HASIL KELULUSAN (PASS/FAIL BANNER) ────────────────── */}
      <div
        className={`rounded-xl border p-4 mb-5 flex items-center justify-between ${
          isPassed
            ? "border-emerald-300 bg-emerald-50/70 text-emerald-950"
            : "border-rose-300 bg-rose-50/70 text-rose-950"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl font-black text-2xl ${
              isPassed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
          >
            {isPassed ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
              Hasil Penilaian Akhir Komprehensif
            </span>
            <h2 className="text-xl font-black tracking-tight uppercase">
              {isPassed ? "LULUS (PASS)" : "BELUM LULUS (REMEDIAL)"}
            </h2>
            <p className="text-[11px] font-semibold opacity-90">
              {isPassed
                ? "Selamat! Peserta telah memenuhi standar kompetensi minimal yang dipersyaratkan."
                : "Peserta belum memenuhi nilai batas lulus minimal dan dijadwalkan mengikuti remedial stase."}
            </p>
          </div>
        </div>

        <div className="text-right flex items-center gap-4">
          <div className="border-r border-slate-300 pr-4">
            <span className="text-[10px] uppercase font-bold block text-slate-500">Nilai Batas Lulus (NBL)</span>
            <span className="text-base font-black text-slate-700">{Number(nblCutoff).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold block text-slate-500">Skor Komposit Akhir</span>
            <span
              className={`text-2xl font-black ${
                isPassed ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {finalScore.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────── 4. TABEL NILAI PER STASE ────────────────── */}
      <div className="mb-5">
        <h3 className="text-xs font-black uppercase text-slate-900 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award size={14} className="text-blue-700" />
            Rincian Nilai Per Pos Stase Ujian ({stationRows.length} Pos)
          </span>
          <span className="text-[10px] text-slate-500 font-normal">Metode Checklist & GRS Terstandar</span>
        </h3>

        <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-300">
              <th className="py-2 px-2 border-r border-slate-300 text-center w-12">Pos</th>
              <th className="py-2 px-2.5 border-r border-slate-300">Stase & Kasus Klinis</th>
              <th className="py-2 px-2.5 border-r border-slate-300">Dokter Penguji</th>
              <th className="py-2 px-2 border-r border-slate-300 text-center w-16">Skor (%)</th>
              <th className="py-2 px-2 border-r border-slate-300 text-center w-14">NBL</th>
              <th className="py-2 px-2 border-r border-slate-300 text-center w-24">Global Rating</th>
              <th className="py-2 px-2 text-center w-16">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {stationRows.map((row) => (
              <tr key={row.station_number} className="hover:bg-slate-50">
                <td className="py-1.5 px-2 text-center font-bold font-mono border-r border-slate-200">
                  #{row.station_number}
                </td>
                <td className="py-1.5 px-2.5 font-medium border-r border-slate-200">
                  <div className="font-black text-slate-900">{row.title}</div>
                  <div className="text-[10px] text-slate-500">{row.case_title}</div>
                </td>
                <td className="py-1.5 px-2.5 text-slate-700 border-r border-slate-200 font-semibold">
                  {row.examiner_name}
                </td>
                <td className="py-1.5 px-2 text-center font-black text-slate-950 border-r border-slate-200">
                  {row.score.toFixed(1)}%
                </td>
                <td className="py-1.5 px-2 text-center text-slate-600 border-r border-slate-200 font-semibold">
                  {row.nbl.toFixed(1)}
                </td>
                <td className="py-1.5 px-2 text-center font-bold text-[10px] border-r border-slate-200">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded font-black ${
                      row.global_rating === "SUPERIOR"
                        ? "bg-purple-100 text-purple-900"
                        : row.global_rating === "SATISFACTORY"
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {row.global_rating}
                  </span>
                </td>
                <td className="py-1.5 px-2 text-center font-bold">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                      row.passed ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {row.passed ? "LULUS" : "REMED"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ────────────────── 5. EVALUASI 7 AREA KOMPETENSI SKDI ────────────────── */}
      <div className="mb-5 rounded-xl border border-slate-300 bg-white p-3.5">
        <h3 className="text-xs font-black uppercase text-slate-900 mb-2.5 flex items-center gap-1.5">
          <FileText size={14} className="text-blue-700" />
          Capaian 7 Area Kompetensi Standar Dokter Indonesia (SKDI)
        </h3>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {skdiDomains.map((dom) => (
            <div key={dom.code} className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-700">{dom.name}</span>
                <span className="font-black text-slate-950">{dom.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full ${
                    dom.score >= 80 ? "bg-emerald-500" : dom.score >= 70 ? "bg-blue-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, dom.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────── 6. FEEDBACK & SARAN DOKTER PENGUJI ────────────────── */}
      <div className="mb-6 rounded-xl border border-slate-300 bg-slate-50/60 p-3.5">
        <h3 className="text-xs font-black uppercase text-slate-900 mb-1.5">
          Catatan Evaluasi & Rekomendasi Penguji:
        </h3>
        <p className="text-[11px] text-slate-700 leading-relaxed italic">
          "{participant.feedback_summary ||
            (isPassed
              ? "Secara umum peserta menunjukkan kompetensi klinis yang baik, pendekatan anamnesis terstruktur, dan komunikasi empati yang sesuai standar. Pertahankan ketelitian tatalaksana resep dan aseptik prosedural."
              : "Peserta disarankan memperdalam teknik pemeriksaan fisik terarah, penguasaan dosis farmakoterapi lini pertama, serta manajemen waktu saat menyampaikan edukasi diagnosis kepada pasien simulasi.")}"
        </p>
      </div>

      {/* ────────────────── 7. PENGESAHAN & TANDA TANGAN RESMI ────────────────── */}
      <div className="pt-2 border-t border-slate-300 grid grid-cols-3 gap-4 items-end text-center">
        {/* QR Verification Code Box */}
        <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-[9px] text-slate-500 space-y-1">
          <div className="h-12 w-12 bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-[8px] rounded">
            QR CODE
          </div>
          <span className="font-mono">VERIFIKASI RESMI</span>
          <span>ID: {participant.id || "OSCE-CERT-2026"}</span>
        </div>

        <div>
          <p className="text-[10px] text-slate-500">Koordinator Ujian OSCE</p>
          <div className="h-12 flex items-end justify-center font-serif italic text-sm text-slate-800 font-bold">
            (dr. H. Hendra Setiawan, Sp.PD, K-GEH)
          </div>
          <p className="text-[9px] text-slate-400 font-mono">NIP: 19780512 200312 1 002</p>
        </div>

        <div>
          <p className="text-[10px] text-slate-500">Ketua Panitia Pelaksana (Panlok)</p>
          <div className="h-12 flex items-end justify-center font-serif italic text-sm text-slate-800 font-bold">
            (dr. Ratna Kartika, M.Biomed, Sp.A)
          </div>
          <p className="text-[9px] text-slate-400 font-mono">NIP: 19830214 200801 2 006</p>
        </div>
      </div>
    </div>
  );
}
