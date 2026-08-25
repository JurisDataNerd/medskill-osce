import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  RotateCw,
  BookOpen,
  Sliders,
  Info,
  Save,
  CheckCircle2,
  Eye,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import QuestionBankSelectModal from "@/features/admin/components/QuestionBankSelectModal";
import SuccessModal from "@/components/ui/SuccessModal";
import ConfirmModal from "@/components/ConfirmModal";
import { createSession, updateSession, fetchSessionById } from "@/services/sessionService";
import { fetchDoctorExaminers } from "@/services/examinerService";

import SessionBasicInfoTab from "@/features/admin/components/session/SessionBasicInfoTab";
import SessionStationsTimerTab from "@/features/admin/components/session/SessionStationsTimerTab";
import SessionStationQuestionsTab from "@/features/admin/components/session/SessionStationQuestionsTab";
import SessionRulesReviewTab from "@/features/admin/components/session/SessionRulesReviewTab";
import { formatDiagnosisText, parseDiagnosisText } from "@/utils/diagnosisParser";

export const DOCTOR_EXAMINER_LIST = [];

export default function CreateSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Active Menu Tab in Left Sidebar (1: Detail Utama, 2: Stase & Timer, 3: Soal & Rubrik, 4: Rule OSCE)
  const [activeTab, setActiveTab] = useState(1);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Mengerti",
    variant: "warning",
    isAlert: true,
    onConfirm: null,
  });

  // Active Selected Station inside Tab 3 Soal & Rubrik (0 to stationsConfig.length - 1)
  const [selectedStationIndex, setSelectedStationIndex] = useState(0);

  // Question Bank Modal State
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  // Registered Doctor Examiners List from Supabase
  const [doctorList, setDoctorList] = useState([]);

  // Draft Auto-save & Exit Confirmation State
  const [showRestoreDraftBanner, setShowRestoreDraftBanner] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function loadExaminers() {
      try {
        const docs = await fetchDoctorExaminers();
        if (docs && docs.length > 0) {
          setDoctorList(docs);
        }
      } catch (err) {
        console.error("Error loading doctor examiners in CreateSessionPage:", err);
      }
    }
    loadExaminers();
  }, []);

  // Check for saved draft on mount
  useEffect(() => {
    if (!isEdit) {
      try {
        const savedDraft = localStorage.getItem("medskill_create_session_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && parsed.title && parsed.title.trim() !== "") {
            setShowRestoreDraftBanner(true);
          }
        }
      } catch (err) {
        console.error("Error reading draft from localStorage:", err);
      }
    }
  }, [isEdit]);

  // Form State 1: Detail Utama
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("2026-08-20");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:30");
  const [location, setLocation] = useState("Gedung Skill Lab Ruang OSCE Utama");
  const [maxParticipants, setMaxParticipants] = useState(8);

  // Form State 2: Timer Parameters
  const [stationDurationMinutes, setStationDurationMinutes] = useState(12);
  const [breakSlotDurationMinutes, setBreakSlotDurationMinutes] = useState(12);
  const [transitionDurationMinutes, setTransitionDurationMinutes] = useState(2);
  const [totalRounds, setTotalRounds] = useState(8);
  const [totalStations, setTotalStations] = useState(8);

  // Helper to re-index and auto-name station slots: Stase 1, Stase 2, Stase Istirahat 1, etc.
  function reindexAndAutoNameStations(stations) {
    let examCounter = 0;
    let breakCounter = 0;
    return stations.map((stg, idx) => {
      const slotNum = idx + 1;
      if (stg.is_break) {
        breakCounter++;
        return {
          ...stg,
          station_number: slotNum,
          break_number: breakCounter,
          title: "Stase Istirahat",
          case_title: `Rotasi Istirahat ${breakCounter}`,
        };
      } else {
        examCounter++;
        return {
          ...stg,
          station_number: slotNum,
          exam_number: examCounter,
          title: `Stase Ujian ${examCounter}`,
          case_title:
            stg.case_title && !stg.case_title.startsWith("Rotasi Istirahat")
              ? stg.case_title
              : `Kasus Medis Stase ${examCounter}`,
        };
      }
    });
  }

  // Initial 4-slot circuit config (4 Exam stations)
  const [stationsConfig, setStationsConfig] = useState(() =>
    reindexAndAutoNameStations([
      {
        is_break: false,
        case_title: "Sindrom Koroner Akut (STEMI Anteroseptal)",
        assigned_examiner: "",
        examiner_specialty: "",
        scenario:
          "Pasien laki-laki 52 tahun datang ke UGD dengan keluhan nyeri dada kiri menjalar ke lengan kiri sejak 2 jam lalu.",
        participant_instructions:
          "1. Lakukan anamnesis terarah.\n2. Lakukan pemeriksaan fisik auskultasi katup jantung.\n3. Interpretasikan EKG 12 Lead.",
        examiner_instructions:
          "Amati kepatuhan prosedur sterilitas tangan dan ketepatan penetapan diagnosis STEMI Anteroseptal.",
        checklist_items: [
          {
            id: "c1-1",
            question: "Menyapa pasien & membina sambung rasa",
            answer_key:
              "Peserta mengucapkan salam, memperkenalkan diri, & mengonfirmasi identitas pasien",
            max_points: 1,
          },
          {
            id: "c1-2",
            question: "Anamnesis terarah nyeri dada",
            answer_key:
              "Menanyakan lokasi, kualitas (seperti ditindih beban berat), radiasi, dan durasi nyeri",
            max_points: 3,
          },
          {
            id: "c1-3",
            question: "Pemeriksaan fisik auskultasi jantung",
            answer_key:
              "Menggunakan stetoskop pada 4 area katup jantung dengan posisi pasien tepat",
            max_points: 3,
          },
          {
            id: "c1-4",
            question: "Interpretasi EKG 12 Lead & Diagnosis",
            answer_key:
              "Mengidentifikasi elevasi segmen ST pada V1-V4 dan menyimpulkan STEMI Anteroseptal",
            max_points: 3,
          },
        ],
        auxiliary_exam_configs: [
          {
            itemId: "ekg-01",
            name: "EKG 12 Lead",
            category: "EKG & ELEKTRODIAGNOSTIK",
            imageUrl:
              "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
            reportText: "ST Elevation pada Lead V1-V4 (STEMI Anteroseptal)",
          },
        ],
      },
      {
        is_break: false,
        case_title: "Eksaserbasi Akut Asma Bronkial Derajat Sedang-Berat",
        assigned_examiner: "",
        examiner_specialty: "",
        scenario:
          "Pasien perempuan 28 tahun datang dengan sesak napas berat berbunyi ngik-ngik dan bentuk dada cembung di sisi kanan.",
        participant_instructions:
          "1. Anamnesis sesak napas akut.\n2. Inspeksi & auskultasi suara paru.\n3. Simulasikan indikasi needle thoracocentesis.",
        examiner_instructions:
          "Nilai ketepatan penentuan lokasi puncture sela iga (ICS 2 linea midclavicularis).",
        checklist_items: [
          {
            id: "c2-1",
            question: "Anamnesis sesak napas & riwayat alergi",
            answer_key:
              "Menanyakan onset sesak, pemicu alergi, dan penggunaan inhaler sebelumnya",
            max_points: 2,
          },
          {
            id: "c2-2",
            question: "Inspeksi & auskultasi paru",
            answer_key:
              "Menemukan suara napas melemah pada paru kanan dan perkusis hipersonor",
            max_points: 3,
          },
          {
            id: "c2-3",
            question: "Prosedur Needle Thoracocentesis",
            answer_key:
              "Melakukan desinfeksi dan penusukan abocath pada ICS 2 Linea Midclavicularis kanan",
            max_points: 4,
          },
        ],
        auxiliary_exam_configs: [
          {
            itemId: "rad-01",
            name: "Foto Thorax AP/PA",
            category: "RADIOLOGI",
            imageUrl:
              "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
            reportText:
              "Lucent area avaskular pada hemithorax dextra dengan collapse line (Pneumothorax Dextra)",
          },
        ],
      },
      {
        is_break: false,
        case_title: "Debridement & Penutupan Luka Vulnus Laceratum",
        scenario:
          "Pasien laki-laki 30 tahun dengan luka robek sepanjang 5 cm pada lengan bawah bagian anterior akibat terkena kaca.",
        participant_instructions:
          "1. Cuci tangan steril dan gunakan sarung tangan steril.\n2. Lakukan debridement & desinfeksi luka.\n3. Lakukan penjahitan luka 3 jahitan simple interrupted.",
        examiner_instructions:
          "Nilai kerapian simpul jahitan dan kesterilan teknik aseptic.",
        checklist_items: [
          {
            id: "c3-1",
            question: "Persiapan steril & anestesi lokal",
            answer_key:
              "Cuci tangan steril, sarung tangan steril, dan infiltrasi Lidokain 2%",
            max_points: 3,
          },
          {
            id: "c3-2",
            question: "Debridement & irigasi NaCl 0.9%",
            answer_key:
              "Membersihkan jaringan nekrotik dan mebilas luka dengan cairan fisiologis",
            max_points: 3,
          },
          {
            id: "c3-3",
            question: "Teknik Penjahitan Simple Interrupted",
            answer_key:
              "Menggunakan needle holder & pinset anatomis dengan jarak jahitan simetris",
            max_points: 4,
          },
        ],
      },
      {
        is_break: false,
        case_title: "Stroke Iskemik Akut (GCS 15 & Hemiparesis)",
        scenario:
          "Pasien laki-laki 60 tahun mengeluh mulut mencong dan anggota gerak kanan lemas sejak 3 jam lalu saat bangun tidur.",
        participant_instructions:
          "1. Lakukan pemeriksaan saraf kranial VII & XII.\n2. Lakukan pemeriksaan motorik ekstremitas kanan.\n3. Periksa refleks patologis Babinski.",
        examiner_instructions:
          "Perhatikan kejelasan instruksi ke pasien saat tes motorik.",
        checklist_items: [
          {
            id: "c4-1",
            question: "Pemeriksaan Saraf Kranial VII & XII",
            answer_key:
              "Meminta pasien tersenyum, meringis, menjulurkan lidah lurus",
            max_points: 3,
          },
          {
            id: "c4-2",
            question: "Pemeriksaan Kekuatan Motorik",
            answer_key: "Menilai skor kekuatan otot ekstremitas kanan (nilai 3/5)",
            max_points: 3,
          },
          {
            id: "c4-3",
            question: "Pemeriksaan Refleks Babinski",
            answer_key:
              "Goresan telapak kaki dari lateral ke medial dengan hasil dorsofleksi ibu jari",
            max_points: 3,
          },
        ],
      },
    ])
  );

  // Form State 4: Rule & Aturan OSCE
  const [singleLiveSessionRule, setSingleLiveSessionRule] = useState(true);
  const [autoRollingRule, setAutoRollingRule] = useState(true);
  const [lateToleranceMinutes, setLateToleranceMinutes] = useState(5);
  const [autoLockAnswerRule, setAutoLockAnswerRule] = useState(true);
  const [autoPublishResults, setAutoPublishResults] = useState(false);
  const [enableTransitionPhase, setEnableTransitionPhase] = useState(true);
  const [enableWaitingRoomPhase, setEnableWaitingRoomPhase] = useState(true);
  const [enableThankYouScreenPhase, setEnableThankYouScreenPhase] = useState(true);

  // Status of session (for edit mode)
  const [sessionStatus, setSessionStatus] = useState("draft");

  // Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState("Berhasil Disimpan");
  const [successModalMessage, setSuccessModalMessage] = useState("");

  // Auto-save form state to localStorage (when not editing existing session)
  useEffect(() => {
    if (isEdit || isSubmitted) return;
    // CRITICAL: Do NOT save if title is blank to prevent overwriting saved draft on initial mount
    if (!title || !title.trim()) return;

    const draftData = {
      title,
      description,
      sessionDate,
      startTime,
      endTime,
      location,
      maxParticipants,
      stationDurationMinutes,
      breakSlotDurationMinutes,
      transitionDurationMinutes,
      totalRounds,
      totalStations,
      stationsConfig,
      singleLiveSessionRule,
      autoRollingRule,
      lateToleranceMinutes,
      autoLockAnswerRule,
      autoPublishResults,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("medskill_create_session_draft", JSON.stringify(draftData));
    } catch (err) {
      console.error("Error saving draft to localStorage:", err);
    }
  }, [
    isEdit,
    isSubmitted,
    title,
    description,
    sessionDate,
    startTime,
    endTime,
    location,
    maxParticipants,
    stationDurationMinutes,
    breakSlotDurationMinutes,
    transitionDurationMinutes,
    totalRounds,
    totalStations,
    stationsConfig,
    singleLiveSessionRule,
    autoRollingRule,
    lateToleranceMinutes,
    autoLockAnswerRule,
    autoPublishResults,
  ]);

  // Prevent accidental tab close or page refresh when form is modified
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmitted && !isEdit && (title.trim() !== "" || description.trim() !== "")) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitted, isEdit, title, description]);

  function handleRestoreDraft() {
    try {
      const savedDraft = localStorage.getItem("medskill_create_session_draft");
      if (!savedDraft) return;
      const data = JSON.parse(savedDraft);
      if (data.title !== undefined) setTitle(data.title);
      if (data.description !== undefined) setDescription(data.description);
      if (data.sessionDate) setSessionDate(data.sessionDate);
      if (data.startTime) setStartTime(data.startTime);
      if (data.endTime) setEndTime(data.endTime);
      if (data.location) setLocation(data.location);
      if (data.maxParticipants) setMaxParticipants(data.maxParticipants);
      if (data.stationDurationMinutes) setStationDurationMinutes(data.stationDurationMinutes);
      if (data.breakSlotDurationMinutes) setBreakSlotDurationMinutes(data.breakSlotDurationMinutes);
      if (data.transitionDurationMinutes) setTransitionDurationMinutes(data.transitionDurationMinutes);
      if (data.totalRounds) setTotalRounds(data.totalRounds);
      if (data.totalStations) setTotalStations(data.totalStations);
      if (data.stationsConfig && data.stationsConfig.length > 0) setStationsConfig(data.stationsConfig);
      if (data.singleLiveSessionRule !== undefined) setSingleLiveSessionRule(data.singleLiveSessionRule);
      if (data.autoRollingRule !== undefined) setAutoRollingRule(data.autoRollingRule);
      if (data.lateToleranceMinutes !== undefined) setLateToleranceMinutes(data.lateToleranceMinutes);
      if (data.autoLockAnswerRule !== undefined) setAutoLockAnswerRule(data.autoLockAnswerRule);
      if (data.autoPublishResults !== undefined) setAutoPublishResults(data.autoPublishResults);

      setShowRestoreDraftBanner(false);
      setConfirmModal({
        isOpen: true,
        title: "Draf Berhasil Dipulihkan!",
        message: `Data formulir sesi "${data.title || "Draf Sesi"}" berhasil dipulihkan dari memori browser lokal.`,
        confirmText: "Mengerti",
        variant: "success",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    } catch (err) {
      console.error("Error restoring draft:", err);
    }
  }

  function handleDiscardDraft() {
    localStorage.removeItem("medskill_create_session_draft");
    setShowRestoreDraftBanner(false);
  }

  function handleNavigateAway(targetPath) {
    if (!isSubmitted && !isEdit && (title.trim() !== "" || description.trim() !== "")) {
      setConfirmModal({
        isOpen: true,
        title: "Tinggalkan Halaman Buat Sesi?",
        message: "Perubahan formulir sesi OSCE Anda yang belum disimpan akan hilang (namun draf otomatis tersimpan di memori browser Anda). Apakah Anda yakin ingin keluar?",
        confirmText: "Ya, Keluar Halaman",
        cancelText: "Batal / Lanjut Mengedit",
        variant: "warning",
        isAlert: false,
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          navigate(targetPath);
        },
      });
    } else {
      navigate(targetPath);
    }
  }

  const isPublishedSession = isEdit && (
    sessionStatus === "published" ||
    sessionStatus === "scheduled" ||
    sessionStatus === "running" ||
    sessionStatus === "completed"
  );

  // Prepopulate if EDIT mode
  useEffect(() => {
    async function loadSessionForEdit() {
      if (isEdit && id) {
        try {
          const foundSession = await fetchSessionById(id);
          if (foundSession) {
            setSessionStatus(foundSession.status || "draft");
            setTitle(foundSession.title || "");
            setDescription(
              foundSession.description ||
                "Evaluasi komprehensif sirkuit stase keterampilan klinis."
            );
            setSessionDate(foundSession.session_date || "2026-08-20");
            setStartTime(foundSession.start_time || "08:00");
            setEndTime(foundSession.end_time || "10:30");
            setLocation(foundSession.location_building || "Gedung Skill Lab Ruang OSCE Utama");
            setMaxParticipants(foundSession.max_participants_per_wave || foundSession.max_participants || 4);
            setStationDurationMinutes(foundSession.station_duration_minutes || 12);
            setBreakSlotDurationMinutes(foundSession.break_duration_minutes || 12);
            setTransitionDurationMinutes(foundSession.transition_duration_minutes || 2);

            if (foundSession.stations && foundSession.stations.length > 0) {
              const loadedStations = reindexAndAutoNameStations(
                foundSession.stations.map((st, idx) => {
                  const rawDiag = st.answer_key_diagnosis || "";
                  const parsedObj = parseDiagnosisText(rawDiag);
                  const wdx = st.answer_key_wdx || parsedObj.wdx || "";
                  let ddxArr = Array.isArray(st.ddxKeys) && st.ddxKeys.length > 0
                    ? st.ddxKeys.filter(Boolean)
                    : (parsedObj.ddxList && parsedObj.ddxList.length > 0 ? parsedObj.ddxList : ["", ""]);

                  return {
                    id: st.id,
                    station_number: st.station_number || idx + 1,
                    is_break: st.is_break,
                    title: st.title || (st.is_break ? `Stase Istirahat ${idx + 1}` : `Stase Ujian ${idx + 1}`),
                    case_title: st.case_title || (st.is_break ? `Rotasi Istirahat ${idx + 1}` : `Stase Ujian ${idx + 1}`),
                    system_organ: st.system_organ || null,
                    skdi_level: st.skdi_level || null,
                    scenario: st.scenario || "",
                    participant_instructions: st.participant_instructions || "",
                    examiner_instructions: st.examiner_instructions || "",
                    answer_key_diagnosis: st.answer_key_diagnosis || "",
                    answer_key_wdx: wdx,
                    answer_key_ddx1: ddxArr[0] || "",
                    answer_key_ddx2: ddxArr[1] || "",
                    answer_key_ddx3: ddxArr[2] || "",
                    ddxKeys: ddxArr,
                    answer_key_ddx: ddxArr.join(", "),
                    answer_key_prescription: st.answer_key_prescription || "",
                    assigned_examiner: st.assigned_examiner || st.examiner_name || null,
                    examiner_name: st.assigned_examiner || st.examiner_name || null,
                    examiner_specialty: st.examiner_specialty || null,
                    examiner_user_id: st.examiner_user_id || null,
                    checklist_items: st.rubric_items || [],
                    auxiliary_exam_configs: (st.station_auxiliary_configs || st.auxiliary_exam_configs || st.auxiliary_files || []).map((aux, aIdx) => {
                      const itemKey = aux.itemId || aux.item_id || aux.id || `aux-${aIdx + 1}`;
                      const img = aux.imageUrl || aux.image_url || aux.file_url || "";
                      const report = aux.reportText || aux.report_text || "";
                      return {
                        ...aux,
                        itemId: itemKey,
                        item_id: itemKey,
                        name: aux.name || aux.title || "Berkas Penunjang",
                        category: aux.category || "PEMERIKSAAN",
                        imageUrl: img,
                        image_url: img,
                        file_url: img,
                        reportText: report,
                        report_text: report,
                      };
                    }),
                  };
                })
              );
              setStationsConfig(loadedStations);
              setTotalStations(loadedStations.length);
              setTotalRounds(loadedStations.length);
            }
          }
        } catch (err) {
          console.error("Error loading session for edit:", err);
        }
      }
    }
    loadSessionForEdit();
  }, [isEdit, id]);

  // Drag & Drop State for Stations Config
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...stationsConfig];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    // Re-index & auto-name sequentially (Stase 1, Stase 2, Stase Istirahat 1, etc.)
    const reindexed = reindexAndAutoNameStations(updated);

    setStationsConfig(reindexed);
    setTotalStations(reindexed.length);
    setTotalRounds(reindexed.length);
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (selectedStationIndex === draggedIndex) {
      setSelectedStationIndex(dropIndex);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Inline Handlers for Station Adding/Removing
  function handleAddStationInline() {
    const raw = [
      ...stationsConfig,
      {
        is_break: false,
        scenario: "Skenario kasus klinis lengkap.",
        participant_instructions:
          "1. Anamnesis terarah.\n2. Prosedur pemeriksaan fisik.\n3. Diagnosis & terapi.",
        examiner_instructions: "Amati kesterilan dan SOP medis penguji.",
        checklist_items: [
          {
            id: `c-${Date.now()}-1`,
            question: "Menyapa pasien & sambung rasa",
            answer_key: "Peserta mengucapkan salam & konfirmasi identitas",
            max_points: 1,
          },
        ],
      },
    ];
    const updated = reindexAndAutoNameStations(raw);
    setStationsConfig(updated);
    setTotalStations(updated.length);
    setTotalRounds(updated.length);
    setSelectedStationIndex(updated.length - 1);
  }

  function handleAddBreakInline() {
    const raw = [
      ...stationsConfig,
      {
        is_break: true,
        scenario: "Rotasi istirahat untuk peserta dan penguji.",
        participant_instructions:
          "Peserta dapat beristirahat, minum, atau mempersiapkan diri sebelum stase berikutnya.",
        examiner_instructions:
          "Dokter penguji dapat melakukan rekapan nilai dan beristirahat sejenak.",
        checklist_items: [],
      },
    ];
    const updated = reindexAndAutoNameStations(raw);
    setStationsConfig(updated);
    setTotalStations(updated.length);
    setTotalRounds(updated.length);
    setSelectedStationIndex(updated.length - 1);
  }

  function handleRemoveStationInline(index) {
    if (stationsConfig.length <= 1) {
      setConfirmModal({
        isOpen: true,
        title: "Peringatan Konfigurasi Stase",
        message: "Minimal harus terdapat 1 Stase di Sirkuit Ujian OSCE!",
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }
    const filtered = stationsConfig.filter((_, idx) => idx !== index);
    const updated = reindexAndAutoNameStations(filtered);

    setStationsConfig(updated);
    setTotalStations(updated.length);
    setTotalRounds(updated.length);
    setSelectedStationIndex(Math.max(0, index - 1));
  }

  function handleSetPresetStations(targetCount) {
    let newStations = [...stationsConfig];
    if (newStations.length < targetCount) {
      while (newStations.length < targetCount) {
        newStations.push({
          is_break: false,
          scenario: "Skenario kasus klinis lengkap.",
          participant_instructions:
            "1. Anamnesis terarah.\n2. Prosedur pemeriksaan fisik.\n3. Diagnosis & terapi.",
          examiner_instructions: "Amati kesterilan dan SOP medis penguji.",
          checklist_items: [
            {
              id: `c-${Date.now()}-${newStations.length}`,
              question: "Menyapa pasien & sambung rasa",
              answer_key: "Peserta mengucapkan salam & konfirmasi identitas",
              max_points: 1,
            },
          ],
        });
      }
    } else if (newStations.length > targetCount) {
      newStations = newStations.slice(0, targetCount);
    }
    const updated = reindexAndAutoNameStations(newStations);
    setStationsConfig(updated);
    setTotalStations(updated.length);
    setTotalRounds(updated.length);
    setSelectedStationIndex(Math.min(selectedStationIndex, updated.length - 1));
  }

  function handleApplyQuestionBankCase(bankCase) {
    setStationsConfig((prev) =>
      prev.map((item, i) => {
        if (i === selectedStationIndex) {
          const rawDiag = bankCase.answer_key_diagnosis || bankCase.wdx || "";
          const rawRecipe = bankCase.answer_key_prescription || bankCase.recipe || "";

          const parsedObj = parseDiagnosisText(rawDiag);
          const wdx = bankCase.answer_key_wdx || parsedObj.wdx || "";
          let ddxArr = Array.isArray(bankCase.ddxKeys) && bankCase.ddxKeys.length > 0
            ? bankCase.ddxKeys.filter(Boolean)
            : (parsedObj.ddxList && parsedObj.ddxList.length > 0 ? parsedObj.ddxList : ["", ""]);

          return {
            ...item,
            is_break: false,
            case_title: bankCase.case_title || bankCase.title,
            system_organ: bankCase.system_organ || item.system_organ || null,
            skdi_level: bankCase.skdi_level || item.skdi_level || null,
            scenario: bankCase.scenario || "",
            participant_instructions: bankCase.participant_instructions || "",
            examiner_instructions: bankCase.examiner_instructions || "",
            answer_key_diagnosis: rawDiag,
            answer_key_prescription: rawRecipe,
            answer_key_wdx: wdx,
            answer_key_ddx1: ddxArr[0] || "",
            answer_key_ddx2: ddxArr[1] || "",
            answer_key_ddx3: ddxArr[2] || "",
            ddxKeys: ddxArr,
            answer_key_ddx: ddxArr.join(", "),
            checklist_items: bankCase.checklist_items
              ? bankCase.checklist_items.map((chk, idx) => ({
                  ...chk,
                  id: `c${item.station_number}-${Date.now()}-${idx}`,
                }))
              : [],
            auxiliary_exam_configs: bankCase.auxiliary_exam_configs || [],
          };
        }
        return item;
      })
    );
  }

  // Checklist Items handlers
  function handleAddChecklistItem() {
    setStationsConfig((prev) =>
      prev.map((stg, idx) => {
        if (idx === selectedStationIndex) {
          const newId = `c${stg.station_number}-${Date.now()}`;
          return {
            ...stg,
            checklist_items: [
              ...stg.checklist_items,
              {
                id: newId,
                question: "Pertanyaan Item Rubrik Baru",
                answer_key: "Kriteria kunci jawaban benar bagi dokter penguji",
                max_points: 2,
              },
            ],
          };
        }
        return stg;
      })
    );
  }

  function handleRemoveChecklistItem(itemId) {
    setStationsConfig((prev) =>
      prev.map((stg, idx) => {
        if (idx === selectedStationIndex) {
          return {
            ...stg,
            checklist_items: stg.checklist_items.filter(
              (item) => item.id !== itemId
            ),
          };
        }
        return stg;
      })
    );
  }

  function handleUpdateChecklistItem(itemId, field, value) {
    setStationsConfig((prev) =>
      prev.map((stg, idx) => {
        if (idx === selectedStationIndex) {
          return {
            ...stg,
            checklist_items: stg.checklist_items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item
            ),
          };
        }
        return stg;
      })
    );
  }

  async function handleSaveCurrentSection(isDraftOnly = true) {
    if (!title.trim() && activeTab === 1) {
      setConfirmModal({
        isOpen: true,
        title: "Judul Sesi Diperlukan",
        message: "Harap isi Nama Sesi OSCE terlebih dahulu!",
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return false;
    }

    const targetStatus = isPublishedSession
      ? sessionStatus
      : isDraftOnly
      ? "draft"
      : "scheduled";

    const sessionPayload = {
      title: title || "Sesi OSCE Tanpa Judul",
      description,
      location_building: location,
      session_date: sessionDate || new Date().toISOString().split("T")[0],
      start_time: startTime || "08:00:00",
      end_time: endTime || null,
      status: targetStatus,
      total_stations: Number(stationsConfig.length),
      total_rounds: Number(stationsConfig.length),
      max_participants_per_wave: Number(maxParticipants),
      station_duration_minutes: Number(stationDurationMinutes),
      break_duration_minutes: Number(breakSlotDurationMinutes),
      transition_duration_minutes: Number(transitionDurationMinutes),
      single_live_session: singleLiveSessionRule,
      auto_rolling_timer: autoRollingRule,
      auto_lock_answer: autoLockAnswerRule,
      late_tolerance_minutes: lateToleranceMinutes,
    };

    try {
      let savedSessionId = id;
      if (isEdit && id) {
        await updateSession(id, sessionPayload, stationsConfig);
        toast.success(`Sesi OSCE "${title}" berhasil diperbarui!`);
      } else {
        const newSession = await createSession(sessionPayload, stationsConfig);
        savedSessionId = newSession?.id;
        toast.success(
          isDraftOnly
            ? `Draft Sesi "${title}" berhasil disimpan!`
            : `Sesi OSCE "${title}" berhasil diterbitkan!`
        );
      }

      localStorage.removeItem("medskill_create_session_draft");
      setIsSubmitted(true);

      // Route to session detail page if saved successfully and we have an ID
      if (savedSessionId) {
        navigate(`/admin/sessions/${savedSessionId}`);
      } else {
        navigate("/admin/sessions");
      }
      return true;
    } catch (err) {
      console.error("Error saving session to Supabase:", err);
      const errMsg = err?.message || err?.details || JSON.stringify(err);
      toast.error(`Gagal menyimpan sesi: ${errMsg}`);

      setConfirmModal({
        isOpen: true,
        title: "Gagal Menyimpan Sesi OSCE",
        message: `Terjadi kesalahan database: ${errMsg}.\n\nFormulir Anda tetap tersimpan di layar dan Anda tidak dialihkan ke halaman lain.`,
        confirmText: "Mengerti / Perbaiki",
        variant: "danger",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return false;
    }
  }

  function handleNextTab() {
    if (activeTab === 1 && !title.trim()) {
      toast.error("Harap isi Nama Sesi OSCE terlebih dahulu!");
      setConfirmModal({
        isOpen: true,
        title: "Judul Sesi Diperlukan",
        message: "Harap isi Nama Sesi OSCE terlebih dahulu!",
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    if (activeTab < 4) {
      setActiveTab(activeTab + 1);
    } else {
      handleSaveCurrentSection(false);
    }
  }

  const examCount = stationsConfig.filter((s) => !s.is_break).length;
  const breakCount = stationsConfig.filter((s) => s.is_break).length;
  const activeStation =
    stationsConfig[selectedStationIndex] || stationsConfig[0];

  return (
    <AdminLayout>
      {/* Auto-saved Draft Restore Notification Banner */}
      {showRestoreDraftBanner && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <RotateCw size={20} className="animate-spin" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Draf Formulir Sesi Ditemukan!
              </h4>
              <p className="text-xs font-semibold text-amber-900 mt-0.5">
                Draf sesi OSCE tersimpan otomatis di memori browser dari sesi pembuatan sebelumnya. Apakah Anda ingin memulihkannya?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition"
            >
              <RotateCw size={14} />
              Pulihkan Draf Sesi
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
            >
              Buang Draf
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="mb-6">
        <button
          onClick={() => handleNavigateAway("/admin/sessions")}
          className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelola Sesi
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {isEdit ? "Edit Sesi Ujian" : "Buat Sesi Ujian"}
              </h1>
              <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800">
                {isEdit ? "Edit Sesi" : "Sesi Baru"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Atur jadwal pelaksanaan, konfigurasi stase sirkuit, paket soal, dan aturan penilaian.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isPublishedSession && (
              <button
                onClick={() => handleSaveCurrentSection(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                <Save size={15} />
                Simpan Draft
              </button>
            )}

            {isEdit && (
              <button
                onClick={() => navigate(`/admin/sessions/${id}`)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                <Eye size={15} />
                Preview Sesi
              </button>
            )}

            <button
              onClick={() => handleSaveCurrentSection(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              {isEdit ? "Simpan Perubahan" : "Terbitkan Sesi"}
            </button>
          </div>
        </div>
      </div>

      {/* 2-PANEL LAYOUT (LEFT SIDEBAR TAB MENU + RIGHT WIDE FORM CONTENT) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* PANEL 1 (LEFT SIDEBAR - 4 COLS): VERTICAL MENU TABS */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tahapan Formulir
            </div>

            <SidebarMenuTabBtn
              active={activeTab === 1}
              title="1. Detail Utama Sesi"
              subtitle="Informasi & Jadwal Ujian"
              icon={<FileText size={18} />}
              onClick={() => setActiveTab(1)}
            />

            <SidebarMenuTabBtn
              active={activeTab === 2}
              title="2. Stase & Timer Rotasi"
              subtitle="Durasi & Sirkuit Stase"
              icon={<RotateCw size={18} />}
              onClick={() => setActiveTab(2)}
            />

            <SidebarMenuTabBtn
              active={activeTab === 3}
              title="3. Soal & Kunci Jawaban Rubrik"
              subtitle="Paket Soal & Rubrik"
              icon={<BookOpen size={18} />}
              onClick={() => setActiveTab(3)}
            />

            <SidebarMenuTabBtn
              active={activeTab === 4}
              title="4. Aturan & Penilaian"
              subtitle="Aturan Live & Penguncian Nilai"
              icon={<Sliders size={18} />}
              onClick={() => setActiveTab(4)}
            />
          </div>

          {/* Quick Summary Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Info size={16} className="text-blue-600" />
              Ringkasan Konfigurasi Sirkuit
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5 text-slate-600">
                <span>Total Stase:</span>
                <span className="font-bold text-slate-900">
                  {stationsConfig.length} Stase
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5 text-slate-600">
                <span>Durasi Stase:</span>
                <span className="font-bold text-slate-900">
                  {stationDurationMinutes} Menit
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5 text-slate-600">
                <span>Durasi Istirahat:</span>
                <span className="font-bold text-amber-950">
                  {breakSlotDurationMinutes} Menit
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5 text-slate-600">
                <span>Durasi Transisi:</span>
                <span className="font-bold text-emerald-800">
                  {transitionDurationMinutes} Menit
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Kapasitas Peserta:</span>
                <span className="font-bold text-slate-900">
                  {maxParticipants} Peserta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2 (RIGHT WIDE CONTENT - 8 COLS): ACTIVE FORM CONTENT */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 1 && (
            <SessionBasicInfoTab
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              sessionDate={sessionDate}
              setSessionDate={setSessionDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              location={location}
              setLocation={setLocation}
              maxParticipants={maxParticipants}
              setMaxParticipants={setMaxParticipants}
              isPublishedSession={isPublishedSession}
              handleSaveCurrentSection={handleSaveCurrentSection}
              handleNextTab={handleNextTab}
            />
          )}

          {activeTab === 2 && (
            <SessionStationsTimerTab
              stationDurationMinutes={stationDurationMinutes}
              setStationDurationMinutes={setStationDurationMinutes}
              breakSlotDurationMinutes={breakSlotDurationMinutes}
              setBreakSlotDurationMinutes={setBreakSlotDurationMinutes}
              transitionDurationMinutes={transitionDurationMinutes}
              setTransitionDurationMinutes={setTransitionDurationMinutes}
              totalRounds={totalRounds}
              stationsConfig={stationsConfig}
              examCount={examCount}
              breakCount={breakCount}
              draggedIndex={draggedIndex}
              dragOverIndex={dragOverIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              handleSetPresetStations={handleSetPresetStations}
              handleAddStationInline={handleAddStationInline}
              handleAddBreakInline={handleAddBreakInline}
              handleRemoveStationInline={handleRemoveStationInline}
              handleSaveCurrentSection={handleSaveCurrentSection}
              handleNextTab={handleNextTab}
            />
          )}

          {activeTab === 3 && (
            <SessionStationQuestionsTab
              stationsConfig={stationsConfig}
              setStationsConfig={setStationsConfig}
              selectedStationIndex={selectedStationIndex}
              setSelectedStationIndex={setSelectedStationIndex}
              totalStations={totalStations}
              draggedIndex={draggedIndex}
              dragOverIndex={dragOverIndex}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              setIsQuestionBankOpen={setIsQuestionBankOpen}
              doctorList={doctorList}
              handleAddChecklistItem={handleAddChecklistItem}
              handleUpdateChecklistItem={handleUpdateChecklistItem}
              handleRemoveChecklistItem={handleRemoveChecklistItem}
              handleSaveCurrentSection={handleSaveCurrentSection}
              handleNextTab={handleNextTab}
            />
          )}

          {activeTab === 4 && (
            <SessionRulesReviewTab
              singleLiveSessionRule={singleLiveSessionRule}
              setSingleLiveSessionRule={setSingleLiveSessionRule}
              enableTransitionPhase={enableTransitionPhase}
              setEnableTransitionPhase={setEnableTransitionPhase}
              enableWaitingRoomPhase={enableWaitingRoomPhase}
              setEnableWaitingRoomPhase={setEnableWaitingRoomPhase}
              enableThankYouScreenPhase={enableThankYouScreenPhase}
              setEnableThankYouScreenPhase={setEnableThankYouScreenPhase}
              autoRollingRule={autoRollingRule}
              setAutoRollingRule={setAutoRollingRule}
              autoLockAnswerRule={autoLockAnswerRule}
              setAutoLockAnswerRule={setAutoLockAnswerRule}
              autoPublishResults={autoPublishResults}
              setAutoPublishResults={setAutoPublishResults}
              lateToleranceMinutes={lateToleranceMinutes}
              setLateToleranceMinutes={setLateToleranceMinutes}
              isPublishedSession={isPublishedSession}
              isEdit={isEdit}
              handleSaveCurrentSection={handleSaveCurrentSection}
              navigate={navigate}
            />
          )}
        </div>
      </div>

      {/* Modal Bank Soal */}
      <QuestionBankSelectModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        onSelectCase={handleApplyQuestionBankCase}
      />

      {/* Confirm & Alert Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />
    </AdminLayout>
  );
}

function SidebarMenuTabBtn({ active, title, subtitle, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition border ${
        active
          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
          : "bg-white border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="font-bold text-xs">{title}</p>
        <p
          className={`text-[11px] mt-0.5 ${
            active ? "text-blue-100 font-medium" : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </button>
  );
}

