import { Award, CheckCircle2, XCircle, Building2, Calendar, FileText, Users, Sliders } from "lucide-react";

/**
 * Standardized A4 Landscape Official Minutes of Examination & Score Recap Document
 * (Berita Acara & Rekapitulasi Hasil Ujian OSCE)
 */
export default function SessionReportDocument({
  session,
  stations = [],
  participantsData = [],
  evaluations = [],
  regressionData = null,
  nblCutoff = null,
  passRate = null,
  passedCount = 0,
  documentRef,
}) {
  const sessionTitle = session?.title || "Ujian OSCE Komprehensif Dokter";
  const sessionDate = session?.session_date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const location = session?.location_building || "Gedung Skill Lab Kedokteran";
  const totalParticipants = participantsData.length;
  const failedCount = totalParticipants > 0 && passedCount !== null ? totalParticipants - passedCount : 0;
  const currentYear = new Date().getFullYear();

  // Calculate overall average score
  const evaluatedScores = participantsData
    .map((p) => p.final_score)
    .filter((s) => s !== null && s !== undefined && !isNaN(s));
  const avgSessionScore =
    evaluatedScores.length > 0
      ? (evaluatedScores.reduce((acc, s) => acc + Number(s), 0) / evaluatedScores.length).toFixed(1)
      : "-";

  return (
    <div
      ref={documentRef}
      className="bg-white text-slate-900 mx-auto p-10 font-sans shadow-lg print:shadow-none print:p-0"
      style={{
        width: "100%",
        maxWidth: "297mm", // A4 Landscape width
        minHeight: "210mm",
        boxSizing: "border-box",
        fontSize: "11px",
        lineHeight: "1.35",
      }}
    >
      {/* ────────────────── 1. KOP SURAT RESMI ────────────────── */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo_biru.avif"
            alt="Praxis Logo"
            className="h-14 w-auto object-contain rounded-xl border border-slate-200"
          />
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-900">
              PRAXIS OSCE • PUSAT PELATIHAN & UJIAN KETERAMPILAN KLINIS KEDOKTERAN
            </h4>
            <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
              BERITA ACARA & REKAPITULASI NILAI UJIAN OSCE
            </h1>
            <p className="text-[11px] text-slate-600 font-semibold">
              Objective Structured Clinical Examination — Standar Kompetensi Dokter Indonesia (SKDI)
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-md bg-slate-100 border border-slate-300 px-3 py-1 text-[10px] font-mono font-bold text-slate-800">
            NO: BA-OSCE/{currentYear}/{session?.id?.slice(0, 8) || "0001"}
          </span>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Tanggal Terbit: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ────────────────── 2. INFORMASI SESI & STATISTIK KELULUSAN ────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Kolom 1 & 2: Informasi Sesi */}
        <div className="col-span-2 rounded-xl border border-slate-300 bg-slate-50/70 p-4 space-y-2">
          <h3 className="text-[11px] font-black uppercase text-blue-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <FileText size={14} />
            Data Pelaksanaan Sesi Ujian
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="flex">
              <span className="text-slate-500 font-medium w-28">Nama Sesi:</span>
              <span className="font-bold text-slate-950 flex-1">{sessionTitle}</span>
            </div>
            <div className="flex">
              <span className="text-slate-500 font-medium w-28">Tanggal:</span>
              <span className="font-semibold text-slate-900 flex-1">{sessionDate}</span>
            </div>
            <div className="flex">
              <span className="text-slate-500 font-medium w-28">Lokasi Gedung:</span>
              <span className="font-semibold text-slate-900 flex-1">{location}</span>
            </div>
            <div className="flex">
              <span className="text-slate-500 font-medium w-28">Total Stase:</span>
              <span className="font-bold text-slate-900 flex-1">{stations.length} Pos Stase Ujian</span>
            </div>
          </div>
        </div>

        {/* Kolom 3: Metrik Hasil Kelulusan */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
          <h3 className="text-[11px] font-black uppercase text-blue-950 flex items-center gap-1.5 border-b border-blue-200/80 pb-1.5">
            <Award size={14} className="text-blue-700" />
            Ringkasan Hasil Kelulusan
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Peserta</span>
              <span className="font-black text-slate-900 text-sm">{totalParticipants} Orang</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Tingkat Lulus</span>
              <span className="font-black text-emerald-700 text-sm">{passRate !== null ? `${passRate}%` : "-"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Nilai Batas Lulus (NBL)</span>
              <span className="font-black text-amber-700 text-sm">{nblCutoff !== null ? nblCutoff.toFixed(1) : "-"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Rata-Rata Nilai</span>
              <span className="font-black text-blue-800 text-sm">{avgSessionScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── 3. TABEL REKAPITULASI NILAI MAHASISWA ────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black uppercase text-slate-950 flex items-center gap-1.5">
            <Users size={14} className="text-blue-700" />
            Tabel Rekapitulasi Nilai & Kelulusan Peserta
          </h3>
          <span className="text-[10px] font-bold text-slate-500">
            Metode Penentuan Standar: Borderline Regression
          </span>
        </div>

        {participantsData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
            Belum ada data peserta yang terdaftar untuk sesi ujian ini.
          </div>
        ) : (
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase border-b border-slate-300">
                  <th className="py-2.5 px-3 text-center w-12">No</th>
                  <th className="py-2.5 px-3 w-28">NIM</th>
                  <th className="py-2.5 px-3">Nama Mahasiswa</th>
                  {stations.map((stg) => (
                    <th key={stg.id} className="py-2.5 px-2 text-center">
                      Stase {stg.station_number}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center font-black bg-blue-50/80 text-blue-950">Skor Akhir</th>
                  <th className="py-2.5 px-3 text-center">Status Kelulusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {participantsData.map((row, idx) => {
                  const isPass = row.status === "Lulus";
                  const isFail = row.status === "Tidak Lulus";

                  return (
                    <tr key={row.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="py-2 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-medium text-slate-700">{row.nim || "-"}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{row.name || "-"}</td>
                      {stations.map((stg) => {
                        const scoreVal = row.scores?.[`stase_${stg.station_number}`];
                        return (
                          <td key={stg.id} className="py-2 px-2 text-center font-medium">
                            {scoreVal !== null && scoreVal !== undefined ? scoreVal.toFixed(1) : "-"}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-center font-black text-blue-900 bg-blue-50/40">
                        {row.final_score !== null && row.final_score !== undefined ? row.final_score.toFixed(1) : "-"}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            isPass
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : isFail
                              ? "bg-rose-100 text-rose-900 border border-rose-300"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ────────────────── 4. KINERJA PERFORMA POS STASE ────────────────── */}
      {stations.length > 0 && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <h4 className="text-[11px] font-black uppercase text-slate-900 mb-2 flex items-center gap-1.5">
            <Sliders size={13} className="text-blue-700" />
            Distribusi Performa Pos Stase Ujian
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            {stations.map((stg) => {
              const stEvals = (evaluations || []).filter(
                (e) => e.station_id === stg.id || Number(e.rotation_round) === Number(stg.station_number)
              );
              const avg =
                stEvals.length > 0
                  ? (stEvals.reduce((acc, c) => acc + Number(c.final_score_percentage || 0), 0) / stEvals.length).toFixed(1)
                  : "-";

              return (
                <div key={stg.id} className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="text-[9px] font-extrabold text-blue-800 uppercase block">Stase {stg.station_number}</span>
                  <span className="text-xs font-black text-slate-900 block mt-0.5">{avg}</span>
                  <span className="text-[9px] text-slate-500 font-medium block truncate" title={stg.title}>
                    {stg.title || `Pos #${stg.station_number}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────── 5. LEMBAR PENGESAHAN & TANDA TANGAN ────────────────── */}
      <div className="border-t-2 border-slate-900 pt-5 mt-6 grid grid-cols-3 gap-6 text-center text-xs">
        <div className="space-y-12">
          <p className="font-semibold text-slate-700">
            Koordinator Penguji OSCE,
          </p>
          <div>
            <p className="font-black text-slate-950 uppercase border-b border-slate-400 pb-1 mx-4">
              dr. Sp.OG, Subsp. Obgyn
            </p>
            <p className="text-[10px] text-slate-500 mt-1">NIP. 19820315 200812 1 002</p>
          </div>
        </div>

        <div className="space-y-12">
          <p className="font-semibold text-slate-700">
            Pengawas Administrasi Ujian,
          </p>
          <div>
            <p className="font-black text-slate-950 uppercase border-b border-slate-400 pb-1 mx-4">
              Sekretariat OSCE MedSkill
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Sistem Terverifikasi Digital</p>
          </div>
        </div>

        <div className="space-y-12">
          <p className="font-semibold text-slate-700">
            Ketua Panitia Ujian OSCE,
          </p>
          <div>
            <p className="font-black text-slate-950 uppercase border-b border-slate-400 pb-1 mx-4">
              Dr. dr. Sp.PD, K-HOM, FINASIM
            </p>
            <p className="text-[10px] text-slate-500 mt-1">NIP. 19750824 200212 1 001</p>
          </div>
        </div>
      </div>
    </div>
  );
}
