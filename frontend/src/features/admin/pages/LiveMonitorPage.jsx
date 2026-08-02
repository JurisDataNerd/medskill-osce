import { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { MOCK_LIVE_SESSION_DETAIL } from "@/features/admin/data/mockAdminData";
import ParticipantAnswerModal from "@/features/admin/components/ParticipantAnswerModal";
import {
  Activity,
  Clock,
  User,
  UserCheck,
  Play,
  Pause,
  RotateCw,
  Square,
  Send,
  Grid,
  ListOrdered,
  FileText,
  AlertCircle,
  CheckCircle2,
  Coffee,
  ChevronRight,
  Sparkles,
  Search,
  X,
  ExternalLink,
  Award,
} from "lucide-react";

export default function LiveMonitorPage() {
  const [session, setSession] = useState(MOCK_LIVE_SESSION_DETAIL);
  const [activeTab, setActiveTab] = useState("grid"); // 'grid', 'matrix', 'logs'
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(session.remaining_seconds);
  const [isBreak, setIsBreak] = useState(session.is_break);
  const [currentRound, setCurrentRound] = useState(session.current_round);
  const [logs, setLogs] = useState(session.logs);
  const [stationSearch, setStationSearch] = useState("");

  // Modal States
  const [selectedStationDetail, setSelectedStationDetail] = useState(null);
  const [selectedParticipantScorecard, setSelectedParticipantScorecard] = useState(null);


  // Live Timer Countdown Effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Timer finished -> Trigger Break or Next Round
          if (!isBreak) {
            setIsBreak(true);
            addLog("warning", `Timer Stase Ronde ${currentRound} Selesai. Masuk ke Waktu Istirahat / Break (03:00).`);
            return session.break_duration_seconds;
          } else {
            setIsBreak(false);
            const nextRound = currentRound < session.total_rounds ? currentRound + 1 : 1;
            setCurrentRound(nextRound);
            addLog("info", `Rolling Otomatis! Masuk ke Ronde ${nextRound} dari ${session.total_rounds}.`);
            return session.station_duration_seconds;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isBreak, currentRound, session]);

  function addLog(type, text) {
    const timeStr = new Date().toLocaleTimeString("id-ID");
    setLogs((prev) => [
      { id: `log-${Date.now()}`, time: timeStr, type, text },
      ...prev,
    ]);
  }

  // Admin Control Handlers
  function handleTogglePause() {
    const nextState = !isTimerRunning;
    setIsTimerRunning(nextState);
    addLog(nextState ? "info" : "warning", nextState ? "Admin melanjutkan timer OSCE." : "Admin menghentikan sementara (Pause) timer OSCE.");
  }

  function handleTriggerRolling() {
    if (confirm("Apakah Anda yakin ingin memicu Rolling Peserta secara manual ke Ronde berikutnya?")) {
      const nextRound = currentRound < session.total_rounds ? currentRound + 1 : session.total_rounds;
      setCurrentRound(nextRound);
      setIsBreak(false);
      setRemainingSeconds(session.station_duration_seconds);
      addLog("info", `Admin memicu Manual Rolling ke Ronde ${nextRound}.`);
    }
  }

  function handleForceBreak() {
    setIsBreak(true);
    setRemainingSeconds(session.break_duration_seconds);
    addLog("warning", "Admin memicu masa istirahat (Break Time) secara manual.");
  }

  function handleFinishOSCE() {
    if (confirm("Apakah Anda yakin ingin mengakhiri sesi OSCE ini? Seluruh pengerjaan stase akan ditutup.")) {
      setSession((prev) => ({ ...prev, status: "completed" }));
      setIsTimerRunning(false);
      addLog("success", "Sesi OSCE telah diakhiri oleh Admin.");
    }
  }

  function handlePublishResult() {
    alert("Hasil Ujian OSCE berhasil dipublikasikan! Peserta kini dapat melihat nilai di dashboard mereka dan email notifikasi telah dikirim.");
    addLog("success", "Admin mempublikasikan Hasil Ujian OSCE ke Peserta & Email.");
  }

  // Formatter
  function formatMinutesSeconds(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Calculate stats
  const totalStations = session.stations.length;
  const submittedCount = session.stations.filter((s) => s.scoring_status === "submitted").length;
  const inProgressCount = session.stations.filter((s) => s.scoring_status === "in_progress").length;

  const filteredStations = session.stations.filter(
    (s) =>
      s.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.case_title.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.examiner.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.current_participant.name.toLowerCase().includes(stationSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Top Banner Control Room Header */}
      <div className="mb-8 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-700/60 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/90 text-white shadow-lg shadow-blue-500/30">
              <Activity size={24} />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  OSCE Control Room
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  REALTIME LIVE
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300 font-medium">
                {session.title}
              </p>
            </div>
          </div>

          {/* Master Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTogglePause}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-md active:scale-95 ${
                isTimerRunning
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
              {isTimerRunning ? "Pause Timer" : "Resume Timer"}
            </button>

            <button
              onClick={handleFinishOSCE}
              className="flex items-center gap-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95"
            >
              <Square size={15} />
              Akhiri OSCE
            </button>

            <button
              onClick={handlePublishResult}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Send size={15} />
              Publish Hasil
            </button>
          </div>

        </div>

        {/* Live Timers & Status Strip */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Status Ronde & Sesi
            </div>
            <div className="mt-2 flex items-center gap-2 text-lg font-bold text-white">
              <span className="text-blue-400">Ronde {currentRound}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{session.total_rounds}</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {isBreak ? "Masa Istirahat (Break)" : "Stase Sedang Berlangsung"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isBreak ? "Timer Istirahat (Break)" : "Timer Stase Aktif"}
            </div>
            <div
              className={`mt-2 font-mono text-3xl font-extrabold tracking-tight ${
                isBreak
                  ? "text-amber-400"
                  : remainingSeconds < 180
                  ? "text-rose-400 animate-pulse"
                  : "text-emerald-400"
              }`}
            >
              {formatMinutesSeconds(remainingSeconds)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {isBreak ? "Menunggu rolling otomatis" : "Waktu pengerjaan & penilaian"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Penilaian Penguji
            </div>
            <div className="mt-2 flex items-center gap-2 text-lg font-bold text-white">
              <span className="text-emerald-400">{submittedCount} Selesai</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400">{inProgressCount} Progres</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Dari total {totalStations} Stase Aktif
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Peserta Ujian
            </div>
            <div className="mt-2 text-lg font-bold text-white">
              {session.total_participants} Peserta
            </div>
            <div className="mt-1 text-xs text-slate-400">
              6 Stase / Rotasi Berjalan
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
          <TabButton
            active={activeTab === "grid"}
            onClick={() => setActiveTab("grid")}
            icon={<Grid size={17} />}
            label="Live Stations Grid"
          />
          <TabButton
            active={activeTab === "matrix"}
            onClick={() => setActiveTab("matrix")}
            icon={<ListOrdered size={17} />}
            label="Matriks Rolling Peserta"
          />
          <TabButton
            active={activeTab === "logs"}
            onClick={() => setActiveTab("logs")}
            icon={<FileText size={17} />}
            label="Activity Log & Audit"
            badge={logs.length}
          />
        </div>

        {/* Search Input for Grid Tab */}
        {activeTab === "grid" && (
          <div className="relative min-w-[280px]">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari stase, penguji, atau peserta..."
              value={stationSearch}
              onChange={(e) => setStationSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: LIVE STATIONS GRID */}
      {activeTab === "grid" && (
        <div>
          {filteredStations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              Tidak ada stase yang sesuai dengan pencarian Anda.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStations.map((station) => (
                <StationLiveCard
                  key={station.id}
                  station={station}
                  remainingSeconds={remainingSeconds}
                  stationDurationSeconds={session.station_duration_seconds}
                  isBreak={isBreak}
                  currentRound={currentRound}
                  onViewDetail={() => setSelectedStationDetail(station)}
                  onViewScorecard={() =>
                    setSelectedParticipantScorecard({
                      id: "p1",
                      name: station.current_participant.name,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: MATRIKS ROLLING PESERTA */}
      {activeTab === "matrix" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ListOrdered size={20} className="text-blue-600" />
              Matriks Perputaran (Rolling) Peserta OSCE
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Visualisasi perpindahan posisi peserta antar stase di setiap ronde sesuai aturan otomatisasi OSCE. Klik nama peserta untuk melihat rekap nilai & jawaban.
            </p>
          </div>

          <div className="overflow-x-auto p-6">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Ronde Ujian</th>
                  <th className="px-4 py-3">Status Ronde</th>
                  <th className="px-4 py-3">Stase 1</th>
                  <th className="px-4 py-3">Stase 2</th>
                  <th className="px-4 py-3">Stase 3</th>
                  <th className="px-4 py-3">Stase 4</th>
                  <th className="px-4 py-3">Stase 5</th>
                  <th className="px-4 py-3">Stase 6</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {session.rolling_matrix.map((matrixRow) => {
                  const isActiveRound = matrixRow.round === currentRound;

                  return (
                    <tr
                      key={matrixRow.round}
                      className={`transition ${
                        isActiveRound
                          ? "bg-blue-50/80 font-semibold text-slate-900 border-l-4 border-l-blue-600"
                          : "hover:bg-slate-50/60 text-slate-700"
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap font-bold">
                        Ronde {matrixRow.round}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {isActiveRound ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-bold text-emerald-800 animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                            Aktif Sekarang
                          </span>
                        ) : matrixRow.round < currentRound ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                            Akan Datang
                          </span>
                        )}
                      </td>

                      {matrixRow.assignments.map((assignment) => (
                        <td
                          key={assignment.station}
                          className="px-4 py-4 whitespace-nowrap text-xs cursor-pointer"
                          onClick={() =>
                            setSelectedParticipantScorecard({
                              id: "p1",
                              name: assignment.participant,
                            })
                          }
                        >
                          <div
                            className={`rounded-xl px-3 py-2 border transition hover:scale-105 ${
                              isActiveRound
                                ? "bg-white border-blue-400 text-blue-900 shadow-sm font-bold hover:border-blue-600"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <div className="font-semibold flex items-center justify-between gap-1">
                              <span>{assignment.participant}</span>
                              <Award size={12} className="text-amber-500" />
                            </div>
                            <div className="text-[10px] text-slate-400">Stase {assignment.station}</div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ACTIVITY LOG & AUDIT TRAIL */}
      {activeTab === "logs" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Activity Log & Audit Trail Realtime
          </h2>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm"
              >
                <div className="font-mono text-xs font-bold text-slate-400 pt-0.5">
                  {log.time}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{log.text}</p>
                </div>
                <LogTypeBadge type={log.type} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Station Detail Modal */}
      {selectedStationDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
                  Stase {selectedStationDetail.station_number}
                </span>
                <h3 className="font-bold text-base">{selectedStationDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedStationDetail(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-900 text-sm mb-1">Kasus: {selectedStationDetail.case_title}</p>
                <p className="text-slate-600">
                  Dokter Penguji: <strong>{selectedStationDetail.examiner.name}</strong> ({selectedStationDetail.examiner.title})
                </p>
              </div>

              {/* Dynamic Scenario by station_number */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Skenario Kasus Medis</h4>
                <p className="text-slate-700 bg-white border border-slate-200 p-3 rounded-lg leading-relaxed font-medium">
                  {selectedStationDetail.station_number === 1 && "Pasien laki-laki 52 tahun datang ke UGD dengan keluhan nyeri dada kiri khas infark miokard menjalar ke lengan kiri sejak 2 jam lalu."}
                  {selectedStationDetail.station_number === 2 && "Pasien perempuan 28 tahun datang dengan sesak napas berat berbunyi ngik-ngik dan bentuk dada cembung di sisi kanan."}
                  {selectedStationDetail.station_number === 3 && "Pasien laki-laki 30 tahun dengan luka robek sepanjang 5 cm pada lengan bawah bagian anterior akibat terkena kaca."}
                  {selectedStationDetail.station_number === 4 && "Pasien laki-laki 60 tahun mengeluh mulut mencong dan anggota gerak kanan lemas sejak 3 jam lalu saat bangun tidur."}
                  {selectedStationDetail.station_number === 5 && "Pasien 55 tahun baru terdiagnosis Diabetes Melitus Tipe 2 dengan GDS 320 mg/dL dan mendapat resep Insulin Pen."}
                  {selectedStationDetail.station_number === 6 && "Pasien anak 8 tahun dibawa ibunya karena mengeluh telinga kanan terasa tersumbat dan pendengaran berkurang."}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Instruksi Peserta Ujian</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 bg-slate-50 p-3 rounded-lg font-medium">
                  {selectedStationDetail.station_number === 1 && (
                    <>
                      <li>Lakukan anamnesis terarah nyeri dada infark.</li>
                      <li>Lakukan auskultasi 4 katup jantung dengan benar.</li>
                      <li>Interpretasikan EKG 12 Lead & sampaikan diagnosis STEMI Anteroseptal.</li>
                    </>
                  )}
                  {selectedStationDetail.station_number === 2 && (
                    <>
                      <li>Lakukan anamnesis sesak napas akut & wheezing.</li>
                      <li>Inspeksi & auskultasi suara paru.</li>
                      <li>Simulasikan indikasi Needle Thoracocentesis pada ICS 2.</li>
                    </>
                  )}
                  {selectedStationDetail.station_number === 3 && (
                    <>
                      <li>Lakukan cuci tangan steril & kenakan sarung tangan steril.</li>
                      <li>Lakukan debridement & irigasi luka dengan NaCl 0.9%.</li>
                      <li>Lakukan penjahitan luka 3 simpul simple interrupted.</li>
                    </>
                  )}
                  {selectedStationDetail.station_number === 4 && (
                    <>
                      <li>Lakukan pemeriksaan saraf kranial VII & XII.</li>
                      <li>Lakukan pemeriksaan kekuatan motorik ekstremitas.</li>
                      <li>Periksa refleks patologis Babinski.</li>
                    </>
                  )}
                  {selectedStationDetail.station_number === 5 && (
                    <>
                      <li>Lakukan edukasi pola makan & penyampaian diagnosis DM.</li>
                      <li>Simulasikan penyuntikan Insulin Pen di regio abdomen.</li>
                      <li>Jelaskan tanda-tanda & penanganan hipoglikemia.</li>
                    </>
                  )}
                  {selectedStationDetail.station_number === 6 && (
                    <>
                      <li>Lakukan inspeksi daun telinga & kanalis auditorius.</li>
                      <li>Gunakan otoskop dengan posisi memegang yang benar.</li>
                      <li>Sebutkan temuan refleks cahaya membran timpani.</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Checklist Rubrik Penilaian & Kunci Jawaban Penguji</h4>
                <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-2">
                  <div className="flex justify-between font-bold text-slate-900 border-b pb-1 text-[11px]">
                    <span>Item Checklist Rubrik & Kunci Jawaban</span>
                    <span>Bobot Skor</span>
                  </div>

                  {selectedStationDetail.station_number === 1 && (
                    <>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">1. Menyapa pasien & membina sambung rasa</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Menyapa salam, perkenalan diri, & konfirmasi identitas (1 Poin)</p>
                      </div>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">2. Anamnesis terarah nyeri dada</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Menanyakan onset, kualitas (ditindih beban berat), & penjelaran nyeri (3 Poin)</p>
                      </div>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">3. Auskultasi katup jantung</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Auskultasi 4 katup jantung dengan stetoskop secara simetris (3 Poin)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">4. Interpretasi EKG 12 Lead & Diagnosis</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Membaca ST elevasi V1-V4 & menyimpulkan STEMI Anteroseptal (3 Poin)</p>
                      </div>
                    </>
                  )}

                  {selectedStationDetail.station_number === 2 && (
                    <>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">1. Anamnesis sesak napas & alergi</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Onset sesak, pemicu alergi, & riwayat obat inhaler (2 Poin)</p>
                      </div>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">2. Auskultasi suara paru</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Menemukan wheezing ekspiratorik bilateral & perkusi hipersonor (3 Poin)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">3. Indikasi Needle Thoracocentesis</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Penusukan abocath pada ICS 2 Linea Midclavicularis kanan (4 Poin)</p>
                      </div>
                    </>
                  )}

                  {selectedStationDetail.station_number === 3 && (
                    <>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">1. Persiapan steril & anestesi lokal</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Cuci tangan steril, sarung tangan steril, & Lidokain 2% (3 Poin)</p>
                      </div>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">2. Debridement & irigasi NaCl 0.9%</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Membersihkan jaringan nekrotik & pembilasan fisiologis (3 Poin)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">3. Penjahitan Simple Interrupted Suture</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Needle holder & pinset anatomis dengan 3 simpul rapi (4 Poin)</p>
                      </div>
                    </>
                  )}

                  {selectedStationDetail.station_number === 4 && (
                    <>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">1. Pemeriksaan N. VII & N. XII</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Meminta pasien tersenyum, meringis, & menjulurkan lidah (3 Poin)</p>
                      </div>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">2. Pemeriksaan Kekuatan Motorik</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Menilai skor kekuatan otot ekstremitas kanan (nilai 3/5) (3 Poin)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">3. Refleks Patologis Babinski</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Goresan telapak kaki dari lateral ke medial (3 Poin)</p>
                      </div>
                    </>
                  )}

                  {selectedStationDetail.station_number === 5 && (
                    <>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">1. Bina sambung rasa & edukasi DM</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Menjelaskan kondisi DM Tipe 2 dengan bahasa sederhana (2 Poin)</p>
                      </div>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">2. Edukasi Injeksi Insulin Pen</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Rotasi tempat suntikan abdomen & waktu suntik sebelum makan (4 Poin)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">3. Penanganan Hipoglikemia</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Edukasi minum air gula jika berkeringat dingin & pusing (3 Poin)</p>
                      </div>
                    </>
                  )}

                  {selectedStationDetail.station_number === 6 && (
                    <>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">1. Pemeriksaan Telinga Luar</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Penarikan pinna ke arah superior-posterior (3 Poin)</p>
                      </div>
                      <div className="border-b border-slate-100 pb-1.5">
                        <p className="font-semibold text-slate-900">2. Teknik Penggunaan Otoskop</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Memegang otoskop seperti pensil dengan kelingking bersandar (4 Poin)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">3. Identifikasi Membran Timpani</p>
                        <p className="text-emerald-800 text-[11px]">Kunci: Menilai refleks cahaya (cone of light) & kanalis (3 Poin)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-4 text-right">
              <button
                onClick={() => setSelectedStationDetail(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Tutup Detail Stase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participant Scorecard Modal */}
      <ParticipantAnswerModal
        open={Boolean(selectedParticipantScorecard)}
        onClose={() => setSelectedParticipantScorecard(null)}
        participantId={selectedParticipantScorecard?.id || "p1"}
        participantName={selectedParticipantScorecard?.name || "Ahmad Rizky Pratama"}
      />
    </AdminLayout>
  );
}

function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
        active
          ? "bg-white text-blue-700 shadow-sm border border-slate-200"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && (
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          {badge}
        </span>
      )}
    </button>
  );
}

function StationLiveCard({
  station,
  remainingSeconds,
  stationDurationSeconds,
  isBreak,
  currentRound,
  onViewDetail,
  onViewScorecard,
}) {
  const isSubmitted = station.scoring_status === "submitted";

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Station Header */}
      <div className="border-b border-slate-100 bg-slate-50/80 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800">
            STASE {station.station_number}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${
              isSubmitted
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSubmitted ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            {isSubmitted ? "Nilai Terkirim" : "Sedang Menilai"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1">
            {station.name}
          </h3>
          <button
            onClick={onViewDetail}
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-0.5 shrink-0"
          >
            Detail Stase <ExternalLink size={12} />
          </button>
        </div>

        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
          Kasus: <span className="font-medium text-slate-700">{station.case_title}</span>
        </p>
      </div>

      {/* Body: Examiner & Participant Details */}
      <div className="p-5 space-y-4">
        {/* Penguji Info */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <img
            src={station.examiner.avatar}
            alt={station.examiner.name}
            className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Penguji Stase
            </div>
            <div className="font-bold text-slate-800 text-sm truncate">
              {station.examiner.name}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {station.examiner.title}
            </div>
          </div>
        </div>

        {/* Peserta Info */}
        <div
          onClick={onViewScorecard}
          className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/30 p-3 cursor-pointer hover:bg-blue-50/60 transition"
        >
          <div className="flex items-center gap-3.5 overflow-hidden">
            <img
              src={station.current_participant.avatar}
              alt={station.current_participant.name}
              className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                Peserta Aktif (Ronde {currentRound})
              </div>
              <div className="font-bold text-slate-900 text-sm truncate">
                {station.current_participant.name}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                NIM: {station.current_participant.nim}
              </div>
            </div>
          </div>

          <Award size={18} className="text-blue-600 shrink-0" title="Lihat Rekap Nilai" />
        </div>

        {/* Live Assessment Checklist Progress */}
        <div className="rounded-xl border border-slate-100 p-3 bg-white">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Checklist Terisi:</span>
            <span className="font-bold text-slate-800">
              {station.checklist_completed} / {station.checklist_total} Item
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${
                isSubmitted ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{
                width: `${(station.checklist_completed / station.checklist_total) * 100}%`,
              }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs border-t border-slate-100 pt-2">
            <span className="text-slate-400">Preview Nilai:</span>
            <button
              onClick={onViewScorecard}
              className="font-extrabold text-blue-700 text-sm hover:underline"
            >
              {station.score_preview} / 100
            </button>
          </div>
        </div>
      </div>

      {/* Footer Notes Preview */}
      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500 flex items-center justify-between">
        <div className="truncate">
          <span className="font-semibold text-slate-700">Catatan:</span>{" "}
          <span className="italic">{station.notes}</span>
        </div>
        <button
          onClick={onViewScorecard}
          className="text-xs font-bold text-blue-600 hover:underline shrink-0 ml-2"
        >
          Lihat Jawaban
        </button>
      </div>
    </div>
  );
}

function LogTypeBadge({ type }) {
  const configs = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
        configs[type] || configs.info
      }`}
    >
      {type.toUpperCase()}
    </span>
  );
}
