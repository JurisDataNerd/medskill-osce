import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Users,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Lock,
  Stethoscope,
  Coffee,
} from "lucide-react";
import {
  CURRENT_EXAMINER_PROFILE,
  EXAMINER_LIVE_SESSION,
} from "@/features/examiner/data/mockExaminerData";


export default function ExaminerStagePage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(EXAMINER_LIVE_SESSION.remaining_seconds);
  const [isBreak, setIsBreak] = useState(false);

  // Active Examinee Index in Rotation (0 to 5)
  const [activeRotationIndex, setActiveRotationIndex] = useState(1); // Ronde 2 (Index 1)

  // Accordion state
  const [showScenario, setShowScenario] = useState(true);

  // Rubric Scores State for active examinee
  const [rubricScores, setRubricScores] = useState({
    r1: 1,
    r2: 3,
    r3: 2.5,
    r4: 3,
  });

  const [globalRating, setGlobalRating] = useState("LULUS"); // Tidak Lulus, Borderline, Lulus, Superior
  const [feedback, setFeedback] = useState("Penanganan klinis dan auskultasi jantung sangat baik. Interpretasi EKG tepat & cepat.");

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return EXAMINER_LIVE_SESSION.station_duration_seconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeParticipant = EXAMINER_LIVE_SESSION.rotation_list[activeRotationIndex];

  // Calculate score percentage
  const totalMaxPoints = EXAMINER_LIVE_SESSION.rubric_items.reduce((acc, r) => acc + r.max_points, 0);
  const currentEarnedPoints = Object.values(rubricScores).reduce((acc, val) => acc + Number(val || 0), 0);
  const finalCalculatedScore = Math.round((currentEarnedPoints / totalMaxPoints) * 100 * 10) / 10;

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function handleSaveEvaluation() {
    alert(
      `Nilai untuk peserta "${activeParticipant.name}" (NIM: ${activeParticipant.nim}) berhasil dikunci!\nSkor Akhir: ${finalCalculatedScore} / 100 (${globalRating})`
    );

    // Auto advance to next participant if available
    if (activeRotationIndex < EXAMINER_LIVE_SESSION.rotation_list.length - 1) {
      setActiveRotationIndex(activeRotationIndex + 1);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate("/examiner")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard Penguji
        </button>

        {/* Live Synchronized Timer Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-900 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Sisa Waktu Stase Ronde #{activeParticipant.round}
            </div>
            <div className="text-lg font-black font-mono leading-none text-emerald-900 mt-0.5">
              {formatTime(secondsLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Scoring Workspace */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN (8 COLS): SCORING SHEET & SCENARIO */}
        <div className="lg:col-span-8 space-y-6">

          {/* Station Title & Active Examinee Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
                  STASE {EXAMINER_LIVE_SESSION.station_number}
                </span>
                <h1 className="text-base font-bold text-slate-900">
                  {EXAMINER_LIVE_SESSION.station_name}
                </h1>
              </div>

              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Ronde {activeParticipant.round} dari {EXAMINER_LIVE_SESSION.total_rounds}
              </span>
            </div>

            {/* Active Examinee Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeParticipant.avatar}
                  alt={activeParticipant.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-2xs"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-700">Peserta Ujian Aktif</span>
                  <h2 className="text-base font-bold text-slate-900">{activeParticipant.name}</h2>
                  <p className="text-xs text-slate-500 font-semibold">NIM: {activeParticipant.nim}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Kalkulasi Skor Realtime</span>
                <span className="text-2xl font-black text-blue-600">{finalCalculatedScore} <span className="text-xs font-medium text-slate-500">/ 100</span></span>
              </div>
            </div>
          </div>

          {/* Skenario Kasus Medis & Instruksi (Expandable Reference) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <button
              onClick={() => setShowScenario(!showScenario)}
              className="flex w-full items-center justify-between text-xs font-bold text-slate-900"
            >
              <span className="flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                Skenario Kasus Medis & Instruksi Peserta
              </span>
              {showScenario ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showScenario && (
              <div className="mt-4 border-t border-slate-100 pt-3 space-y-3 text-xs">
                <div>
                  <p className="font-bold text-slate-800 mb-0.5">Judul Kasus:</p>
                  <p className="text-slate-900 font-semibold">{EXAMINER_LIVE_SESSION.case_title}</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-0.5">Skenario Medis:</p>
                  <p className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium leading-relaxed">
                    {EXAMINER_LIVE_SESSION.scenario}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="font-bold text-slate-800 mb-0.5">Instruksi Peserta:</p>
                    <p className="text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-lg whitespace-pre-line font-medium">
                      {EXAMINER_LIVE_SESSION.participant_instructions}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 mb-0.5">Instruksi Penguji:</p>
                    <p className="text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-lg whitespace-pre-line font-medium">
                      {EXAMINER_LIVE_SESSION.examiner_instructions}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Penilaian Rubrik Item per Item */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award size={18} className="text-blue-600" />
                  Lembar Rubrik Penilaian Penguji ({EXAMINER_LIVE_SESSION.rubric_items.length} Item)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Berikan poin penilaian berdasarkan kesesuaian tindakan peserta dengan kunci jawaban baku.
                </p>
              </div>

              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Total Poin: {currentEarnedPoints} / {totalMaxPoints} Poin
              </span>
            </div>

            <div className="space-y-4">
              {EXAMINER_LIVE_SESSION.rubric_items.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {idx + 1}. {item.question}
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-white border border-blue-200 px-2.5 py-0.5 rounded-md">
                      Maks: {item.max_points} Poin
                    </span>
                  </div>

                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs">
                    <span className="font-bold text-emerald-900 uppercase text-[10px] block">Kunci Jawaban Baku:</span>
                    <span className="text-emerald-900 font-medium">{item.answer_key}</span>
                  </div>

                  {/* Poin Radio Selector */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-slate-700">Poin Diberikan:</span>
                    <div className="flex items-center gap-1.5">
                      {[0, 0.5, 1, 2, 3]
                        .filter((p) => p <= item.max_points)
                        .map((pt) => (
                          <button
                            key={pt}
                            type="button"
                            onClick={() =>
                              setRubricScores((prev) => ({ ...prev, [item.id]: pt }))
                            }
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                              rubricScores[item.id] === pt
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {pt} Poin
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Rating & Feedback */}
            <div className="border-t border-slate-200 pt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Penilaian Global (Global Rating)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Tidak Lulus", "Borderline", "Lulus", "Superior"].map((gr) => (
                    <button
                      key={gr}
                      type="button"
                      onClick={() => setGlobalRating(gr)}
                      className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                        globalRating === gr
                          ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {gr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Catatan Evaluasi & Umpan Balik Penguji
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tuliskan umpan balik atau saran perbaikan untuk peserta..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveEvaluation}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
                >
                  <Lock size={15} />
                  Simpan & Kunci Nilai Ronde Ini
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS): ROTATION LIST OF ALL EXAMINEES */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Daftar Rotasi Peserta Stase 1</span>
              <span className="text-blue-600 font-extrabold">{EXAMINER_LIVE_SESSION.rotation_list.length} Ronde</span>
            </h3>

            <div className="space-y-2.5">
              {EXAMINER_LIVE_SESSION.rotation_list.map((rot, idx) => {
                const isActive = activeRotationIndex === idx;

                return (
                  <div key={rot.round} className="space-y-2.5">
                    <div
                      onClick={() => setActiveRotationIndex(idx)}
                      className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                        isActive
                          ? "bg-blue-50 border-blue-400 text-blue-900 shadow-2xs font-bold"
                          : rot.status === "completed"
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : rot.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {rot.round}
                        </span>

                        <div>
                          <p className="font-bold text-xs">{rot.name}</p>
                          <p className="text-[11px] text-slate-400">NIM: {rot.nim}</p>
                        </div>
                      </div>

                      <div>
                        {rot.status === "completed" ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {rot.score} Pts
                          </span>
                        ) : isActive ? (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Menunggu</span>
                        )}
                      </div>
                    </div>

                    {/* Istirahat Rotasi Card setelah Ronde 3 */}
                    {rot.round === 3 && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 text-amber-900 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5 text-amber-900">
                            <Coffee size={15} className="text-amber-700" />
                            Jeda Istirahat Rotasi
                          </span>
                          <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 border border-amber-300">
                            10 Menit
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-snug font-medium">
                          Waktu istirahat penguji & peserta setelah ronde 3 (Persiapan ronde 4 - 6).
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}