import { useState, useMemo } from "react";
import {
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Loader2,
  FileText,
  Sliders,
  BarChart2,
  Award,
  Search,
  ChevronRight,
  ChevronLeft,
  Building2,
  CalendarDays,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function SessionReportDetailView({
  session,
  stations = [],
  participantsData = [],
  evaluations = [],
  regressionData = null,
  nblCutoff = null,
  passRate = null,
  passedCount = 0,
  onBackToList,
  onExportExcel,
  onExportPdf,
  downloadingReportPdf,
  reportContainerRef,
  onSelectParticipantForReport,
  navigate,
}) {
  const [activeTab, setActiveTab] = useState("recap"); // 'recap', 'standard_setting', 'analytics'
  const [searchQuery, setSearchQuery] = useState("");
  const [participantPage, setParticipantPage] = useState(1);
  const participantsPerPage = 10;

  const filteredRecap = useMemo(() => {
    return participantsData.filter(
      (row) =>
        row.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.nim?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [participantsData, searchQuery]);

  const totalParticipantPages = Math.ceil(filteredRecap.length / participantsPerPage) || 1;
  const paginatedRecap = useMemo(() => {
    const start = (participantPage - 1) * participantsPerPage;
    return filteredRecap.slice(start, start + participantsPerPage);
  }, [filteredRecap, participantPage, participantsPerPage]);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToList}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            Kembali ke Daftar Laporan Sesi
          </button>
          <h1 className="text-2xl font-black text-slate-900">
            {session?.title || "Laporan & Rekapitulasi Nilai OSCE"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-2">
            <span>
              <CalendarDays size={13} className="inline mr-1 text-slate-400" />
              {session?.session_date || "Tanggal Belum Ditentukan"}
            </span>
            <span>•</span>
            <span>
              <MapPin size={13} className="inline mr-1 text-slate-400" />
              {session?.location_building || "Lokasi Belum Ditentukan"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900 shadow-2xs hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            Ekspor Excel
          </button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
          <div className="border-l-2 border-blue-500 pl-3">
            <span className="text-slate-400 text-[10px] uppercase block font-bold">Total Peserta</span>
            <span className="font-black text-slate-900 text-base">
              {participantsData.length > 0 ? `${participantsData.length} Peserta` : "Belum Ada Peserta"}
            </span>
          </div>
          <div className="border-l-2 border-emerald-500 pl-3">
            <span className="text-slate-400 text-[10px] uppercase block font-bold">Persentase Kelulusan</span>
            <span className="font-black text-emerald-700 text-base">
              {passRate !== null ? `${passRate}% (${passedCount} Lulus)` : "Belum Ada Data"}
            </span>
          </div>
          <div className="border-l-2 border-amber-500 pl-3">
            <span className="text-slate-400 text-[10px] uppercase block font-bold">Nilai Batas Lulus (NBL)</span>
            <span className="font-black text-amber-700 text-base">
              {nblCutoff !== null ? nblCutoff.toFixed(1) : "Belum Ditetapkan"}
            </span>
          </div>
          <div className="border-l-2 border-purple-500 pl-3">
            <span className="text-slate-400 text-[10px] uppercase block font-bold">Metode Standarisasi</span>
            <span className="font-black text-purple-700 text-base">
              {regressionData ? "Borderline Regression" : "Menunggu Evaluasi"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("recap")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "recap"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText size={16} />
          Rekapitulasi Nilai Peserta
        </button>
        <button
          onClick={() => setActiveTab("standard_setting")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "standard_setting"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sliders size={16} />
          Penetapan Standar Nilai (NBL)
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "analytics"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BarChart2 size={16} />
          Performa Stase
        </button>
      </div>

      {/* TAB 1: REKAPITULASI NILAI PESERTA */}
      {activeTab === "recap" && (
        <div ref={reportContainerRef} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-blue-600" />
              Tabel Rekapitulasi Nilai Peserta ({filteredRecap.length})
            </h2>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setParticipantPage(1);
                }}
                placeholder="Cari nama atau NIM peserta..."
                className="rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {filteredRecap.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <FileText size={20} />
              </div>
              <p className="font-semibold text-slate-600">Belum ada data peserta terdaftar untuk sesi ini.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase">
                      <th className="py-3 px-3 text-center">Peringkat</th>
                      <th className="py-3 px-3">NIM</th>
                      <th className="py-3 px-3">Nama Peserta</th>
                      {stations.map((stg) => (
                        <th key={stg.id} className="py-3 px-3 text-center">
                          Stase {stg.station_number}
                        </th>
                      ))}
                      <th className="py-3 px-3 text-center">Skor Akhir</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedRecap.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition font-medium text-slate-800">
                        <td className="py-3 px-3 font-bold text-center">
                          {row.rank !== "-" ? `#${row.rank}` : "-"}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">{row.nim || "-"}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{row.name || "-"}</td>
                        {stations.map((stg) => {
                          const val = row.scores?.[`stase_${stg.station_number}`];
                          return (
                            <td key={stg.id} className="py-3 px-3 text-center font-semibold">
                              {val !== null && val !== undefined ? val.toFixed(1) : (
                                <span className="text-slate-300 font-normal">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-3 px-3 text-center font-black text-blue-700">
                          {row.final_score !== null ? row.final_score.toFixed(1) : (
                            <span className="text-slate-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border ${
                              row.status === "Lulus"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : row.status === "Tidak Lulus"
                                ? "bg-rose-100 text-rose-900 border-rose-300"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">

                            <button
                              onClick={() => navigate(`/admin/live/participant/${row.id}`)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                              Transkrip
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Controls */}
              {totalParticipantPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 font-semibold">
                  <div>
                    Menampilkan halaman {participantPage} dari {totalParticipantPages} ({filteredRecap.length} Peserta)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setParticipantPage((p) => Math.max(1, p - 1))}
                      disabled={participantPage === 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft size={13} /> Sebelumnya
                    </button>

                    {Array.from({ length: totalParticipantPages }, (_, i) => i + 1).map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => setParticipantPage(pNum)}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                          participantPage === pNum
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setParticipantPage((p) => Math.min(totalParticipantPages, p + 1))}
                      disabled={participantPage === totalParticipantPages}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Selanjutnya <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: PENETAPAN NBL (BORDERLINE REGRESSION) */}
      {activeTab === "standard_setting" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sliders size={20} className="text-purple-600" />
              Kalkulasi Nilai Batas Lulus (Borderline Regression)
            </h2>
            <p className="text-xs text-slate-500">
              Metode regresi linier antara skor rubrik objektif dengan kualifikasi Global Rating Scale (GRS) penguji untuk menetapkan NBL nasional.
            </p>

            {!regressionData || regressionData.intercept === null ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Sliders size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Data Penilaian GRS Penguji</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Penetapan standar nilai NBL dengan metode Borderline Regression akan otomatis dikalkulasi setelah penguji menyelesaikan penilaian rubrik dan memberikan rating GRS.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 space-y-1">
                  <span className="text-[10px] font-bold text-purple-700 uppercase block">Persamaan Regresi Linier</span>
                  <span className="text-lg font-black text-purple-950 block">
                    Y = {regressionData.intercept} + ({regressionData.slope} × GRS)
                  </span>
                  <span className="text-[11px] text-purple-800 block">R² Correlation: {regressionData.r2 ?? "-"}</span>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Cutoff NBL Terhitung</span>
                  <span className="text-2xl font-black text-emerald-950 block">
                    {regressionData.nbl ? regressionData.nbl.toFixed(1) : "-"}
                  </span>
                  <span className="text-[11px] text-emerald-800 block">GRS Borderline Cutoff</span>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Distribusi Kelulusan</span>
                  <span className="text-2xl font-black text-blue-950 block">
                    {passRate !== null ? `${passRate}% Lulus` : "Belum Dinilai"}
                  </span>
                  <span className="text-[11px] text-blue-800 block">
                    {passedCount} dari {participantsData.length} Peserta Lulus
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ANALITIK PERFORMA POS STASE */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BarChart2 size={20} className="text-blue-600" />
              Tingkat Kesukaran & Daya Pembeda Stase
            </h2>

            {stations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada stase aktif yang terdaftar untuk sesi ini.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stations.map((stg) => {
                  const stEvals = (evaluations || []).filter(
                    (e) => e.station_id === stg.id || Number(e.rotation_round) === Number(stg.station_number)
                  );
                  const evalCount = stEvals.length;
                  let avgScore = null;
                  let difficultyText = "Belum Ada Penilaian";

                  if (evalCount > 0) {
                    const sum = stEvals.reduce((acc, c) => acc + Number(c.final_score_percentage || 0), 0);
                    avgScore = sum / evalCount;
                    if (avgScore >= 80) difficultyText = `Mudah (${avgScore.toFixed(1)})`;
                    else if (avgScore >= 60) difficultyText = `Sedang (${avgScore.toFixed(1)})`;
                    else difficultyText = `Sulit (${avgScore.toFixed(1)})`;
                  }

                  return (
                    <div key={stg.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-blue-600 text-white text-[10px] font-black px-2 py-0.5">
                          STASE #{stg.station_number}
                        </span>
                        <span
                          className={`text-[11px] font-bold ${
                            avgScore !== null ? "text-slate-700" : "text-slate-400"
                          }`}
                        >
                          {difficultyText}
                        </span>
                      </div>
                      <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">{stg.title}</h3>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-400">Kasus:</span>
                        <span className="text-xs font-black text-blue-700 line-clamp-1">
                          {stg.case_title || "Kasus Medis Terstandar"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {evalCount > 0 ? `${evalCount} peserta telah dievaluasi` : "Belum ada evaluasi"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
