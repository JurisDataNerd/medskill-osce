import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import ConfirmModal from "@/components/ConfirmModal";
import ParticipantReportPdfModal from "@/features/admin/components/report/ParticipantReportPdfModal";
import SessionReportPdfModal from "@/features/admin/components/report/SessionReportPdfModal";
import SessionReportsList from "@/features/admin/components/report/SessionReportsList";
import SessionReportDetailView from "@/features/admin/components/report/SessionReportDetailView";
import { supabase } from "@/lib/supabaseClient";
import { fetchSessions } from "@/services/sessionService";

function calculateBorderlineRegression(evals) {
  if (!evals || evals.length < 2) return null;

  const grsMap = {
    UNSATISFACTORY: 1,
    BORDERLINE: 2,
    SATISFACTORY: 3,
    SUPERIOR: 4,
  };

  const validPoints = evals
    .map((e) => {
      const g = grsMap[e.grs_rating];
      const y = Number(e.final_score_percentage ?? e.total_score);
      if (g && !isNaN(y)) return { x: g, y };
      return null;
    })
    .filter(Boolean);

  if (validPoints.length < 2) {
    // If only borderline evals exist, take average of borderline
    const borderlineEvals = evals.filter((e) => e.grs_rating === "BORDERLINE");
    if (borderlineEvals.length > 0) {
      const sum = borderlineEvals.reduce((acc, curr) => acc + Number(curr.final_score_percentage || 0), 0);
      const avg = sum / borderlineEvals.length;
      return {
        intercept: null,
        slope: null,
        r2: null,
        nbl: Math.round(avg * 10) / 10,
        totalEvals: evals.length,
      };
    }
    return null;
  }

  const n = validPoints.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const p of validPoints) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const numeratorR = n * sumXY - sumX * sumY;
  const denR = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  const r = denR !== 0 ? numeratorR / denR : 0;
  const r2 = r * r;

  const nbl = intercept + slope * 2;

  return {
    intercept: Math.round(intercept * 10) / 10,
    slope: Math.round(slope * 10) / 10,
    r2: Math.round(r2 * 100) / 100,
    nbl: Math.max(0, Math.min(100, Math.round(nbl * 10) / 10)),
    totalEvals: n,
  };
}

export default function ReportsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedParticipantForReport, setSelectedParticipantForReport] = useState(null);
  const [isSessionPdfModalOpen, setIsSessionPdfModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Mengerti",
    variant: "info",
    isAlert: true,
  });

  // Real Supabase State for Selected Session
  const [stations, setStations] = useState([]);
  const [participantsData, setParticipantsData] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [regressionData, setRegressionData] = useState(null);
  const [nblCutoff, setNblCutoff] = useState(null);
  const [passRate, setPassRate] = useState(null);
  const [passedCount, setPassedCount] = useState(0);

  // 1. Load All Sessions for the Card Grid
  useEffect(() => {
    async function loadSessionsData() {
      try {
        setLoading(true);
        const data = await fetchSessions();
        setSessions(data || []);
      } catch (err) {
        console.error("Error loading sessions for reports:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSessionsData();
  }, []);

  // 2. Load Details when a Session is Selected
  useEffect(() => {
    async function loadReportDetails() {
      if (!selectedSessionId) {
        setStations([]);
        setParticipantsData([]);
        setEvaluations([]);
        setRegressionData(null);
        setNblCutoff(null);
        setPassRate(null);
        setPassedCount(0);
        return;
      }
      try {
        setDetailLoading(true);

        const [
          { data: stList, error: stErr },
          { data: pList, error: pErr },
          { data: evList, error: evErr },
        ] = await Promise.all([
          supabase.schema("osce").from("stations").select("*").eq("session_id", selectedSessionId).order("station_number"),
          supabase.schema("osce").from("session_participants").select("*").eq("session_id", selectedSessionId),
          supabase.schema("osce").from("examiner_evaluations").select("*").eq("session_id", selectedSessionId),
        ]);

        if (stErr) throw stErr;
        if (pErr) throw pErr;
        if (evErr) throw evErr;

        const activeSt = (stList || []).filter((s) => !s.is_break);
        const activeEvals = evList || [];
        setStations(activeSt);
        setEvaluations(activeEvals);

        // Calculate Regression & NBL from REAL evaluations
        const reg = calculateBorderlineRegression(activeEvals);
        setRegressionData(reg);
        const calculatedNbl = reg?.nbl ?? (activeEvals.length > 0 ? 70.0 : null);
        setNblCutoff(calculatedNbl);

        if (pList && pList.length > 0) {
          let totalPass = 0;
          let evaluatedCount = 0;

          const mapped = pList.map((p, idx) => {
            const pEvals = activeEvals.filter((e) => e.participant_id === p.user_id || e.participant_id === p.id);

            const stationScores = {};
            let scoreSum = 0;
            let scoreCount = 0;

            activeSt.forEach((stg) => {
              const ev = pEvals.find((e) => e.station_id === stg.id || Number(e.rotation_round) === Number(stg.station_number));
              if (ev && ev.final_score_percentage !== undefined && ev.final_score_percentage !== null) {
                const sVal = Number(ev.final_score_percentage);
                stationScores[`stase_${stg.station_number}`] = sVal;
                scoreSum += sVal;
                scoreCount += 1;
              } else {
                stationScores[`stase_${stg.station_number}`] = null;
              }
            });

            const hasEvaluations = scoreCount > 0;
            if (hasEvaluations) evaluatedCount += 1;

            const finalScore = hasEvaluations ? scoreSum / scoreCount : null;
            const isPassed = finalScore !== null && calculatedNbl !== null ? finalScore >= calculatedNbl : null;
            if (isPassed === true) totalPass += 1;

            let statusText = "Belum Dinilai";
            if (hasEvaluations) {
              if (isPassed === true) statusText = "Lulus";
              else if (isPassed === false) statusText = "Tidak Lulus";
              else statusText = "Telah Dinilai";
            }

            return {
              id: p.id,
              rank: idx + 1,
              nim: p.nim || p.email?.split("@")[0] || "-",
              name: p.full_name || p.name || p.email || `Peserta #${idx + 1}`,
              scores: stationScores,
              final_score: finalScore,
              global_rating: pEvals.length > 0 ? pEvals[pEvals.length - 1].grs_rating || "-" : "-",
              status: statusText,
              evaluated_stations: scoreCount,
            };
          });

          // Sort by final score descending (putting nulls at the end)
          mapped.sort((a, b) => {
            if (a.final_score === null && b.final_score === null) return 0;
            if (a.final_score === null) return 1;
            if (b.final_score === null) return -1;
            return b.final_score - a.final_score;
          });
          mapped.forEach((m, i) => (m.rank = m.final_score !== null ? i + 1 : "-"));

          setParticipantsData(mapped);
          setPassedCount(totalPass);
          setPassRate(evaluatedCount > 0 ? ((totalPass / evaluatedCount) * 100).toFixed(1) : null);
        } else {
          setParticipantsData([]);
          setPassedCount(0);
          setPassRate(null);
        }
      } catch (err) {
        console.error("Error loading report details from Supabase:", err);
      } finally {
        setDetailLoading(false);
      }
    }

    loadReportDetails();
  }, [selectedSessionId]);

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || null;

  function handleExportExcel() {
    if (!participantsData || participantsData.length === 0) {
      setConfirmModal({
        isOpen: true,
        title: "Ekspor Gagal",
        message: "Belum ada data rekapitulasi peserta untuk diekspor.",
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
      });
      return;
    }

    const headers = [
      "Peringkat",
      "NIM",
      "Nama Mahasiswa",
      ...stations.map((s) => `Stase_${s.station_number}`),
      "Skor_Akhir",
      "Status",
    ];
    const rows = participantsData.map((p) => {
      const stScores = stations.map((s) => (p.scores[`stase_${s.station_number}`] !== null ? p.scores[`stase_${s.station_number}`].toFixed(1) : "-"));
      return [
        p.rank,
        p.nim,
        `"${p.name}"`,
        ...stScores,
        p.final_score !== null ? p.final_score.toFixed(1) : "-",
        p.status,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rekap_OSCE_${(activeSession?.title || "Ujian").replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex h-[450px] items-center justify-center text-xs font-semibold text-slate-500">
          <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
          Memuat Daftar Sesi OSCE...
        </div>
      ) : !selectedSessionId ? (
        <SessionReportsList
          sessions={sessions}
          onSelectSession={(sessId) => setSelectedSessionId(sessId)}
        />
      ) : detailLoading ? (
        <div className="flex h-[450px] items-center justify-center text-xs font-semibold text-slate-500">
          <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
          Memuat Detail Rekapitulasi Sesi...
        </div>
      ) : (
        <SessionReportDetailView
          session={activeSession}
          stations={stations}
          participantsData={participantsData}
          evaluations={evaluations}
          regressionData={regressionData}
          nblCutoff={nblCutoff}
          passRate={passRate}
          passedCount={passedCount}
          onBackToList={() => setSelectedSessionId("")}
          onExportExcel={handleExportExcel}
          onExportPdf={() => setIsSessionPdfModalOpen(true)}
          onSelectParticipantForReport={(part) => setSelectedParticipantForReport(part)}
          navigate={navigate}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />

      {/* 1. Modal Transkrip Mahasiswa Satuan (A4 Portrait) */}
      <ParticipantReportPdfModal
        isOpen={Boolean(selectedParticipantForReport)}
        onClose={() => setSelectedParticipantForReport(null)}
        participant={selectedParticipantForReport}
        session={activeSession}
        stations={stations}
        evaluations={evaluations}
        nblCutoff={nblCutoff || 70.0}
      />

      {/* 2. Modal Berita Acara & Rekapitulasi Nilai Sesi Lengkap (A4 Landscape) */}
      <SessionReportPdfModal
        isOpen={isSessionPdfModalOpen}
        onClose={() => setIsSessionPdfModalOpen(false)}
        session={activeSession}
        stations={stations}
        participantsData={participantsData}
        evaluations={evaluations}
        regressionData={regressionData}
        nblCutoff={nblCutoff}
        passRate={passRate}
        passedCount={passedCount}
      />
    </AdminLayout>
  );
}