import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  CheckCircle2,
  Sliders,
  Users,
  Save,
  BookOpen,
  ChevronRight,
  Info,
  Plus,
  Trash2,
  Award,
  Eye,
  GripVertical,
  RotateCw,
  Coffee,
  Sparkles,
  UserCheck,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import AdminAuxiliaryExamBuilder from "@/features/admin/components/AdminAuxiliaryExamBuilder";
import QuestionBankSelectModal from "@/features/admin/components/QuestionBankSelectModal";
import SuccessModal from "@/components/ui/SuccessModal";
import ConfirmModal from "@/components/ConfirmModal";
import { createSession, updateSession, fetchSessionById } from "@/services/sessionService";
import { fetchDoctorExaminers } from "@/services/examinerService";

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
                  const diagLines = rawDiag.split("\n");
                  let wdx = st.answer_key_wdx || "";
                  let ddx1 = st.answer_key_ddx1 || "";
                  let ddx2 = st.answer_key_ddx2 || "";

                  if (!wdx && rawDiag) {
                    diagLines.forEach((l) => {
                      if (/wdx|kerja/i.test(l)) wdx = l.replace(/^(wdx|diagnosis kerja utama|kerja)[\s:]*/i, "").trim();
                      else if (/ddx\s*1|banding\s*1/i.test(l)) ddx1 = l.replace(/^(ddx\s*1|diagnosis banding 1|banding 1)[\s:]*/i, "").trim();
                      else if (/ddx\s*2|banding\s*2/i.test(l)) ddx2 = l.replace(/^(ddx\s*2|diagnosis banding 2|banding 2)[\s:]*/i, "").trim();
                    });
                    if (!wdx && diagLines[0]) wdx = diagLines[0];
                    if (!ddx1 && diagLines[1]) ddx1 = diagLines[1];
                    if (!ddx2 && diagLines[2]) ddx2 = diagLines[2];
                  }

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
                    answer_key_ddx1: ddx1,
                    answer_key_ddx2: ddx2,
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
          return {
            ...item,
            is_break: false,
            case_title: bankCase.case_title || bankCase.title,
            scenario: bankCase.scenario || "",
            participant_instructions: bankCase.participant_instructions || "",
            examiner_instructions: bankCase.examiner_instructions || "",
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
          {/* TAB 1 CONTENT: DETAIL UTAMA */}
          {activeTab === 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={19} className="text-blue-600" />
                  1. Informasi Sesi Ujian
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lengkapi judul, jadwal pelaksanaan, dan kapasitas peserta.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Judul Sesi Ujian <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ujian OSCE Periodik Dokter Spesialis - Batch IV 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Deskripsi Pelaksanaan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan petunjuk khusus, syarat peserta, atau catatan pelaksanaan..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <CalendarDays size={14} className="text-slate-400" />
                    Tanggal Ujian
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    Lokasi Ruangan
                  </label>
                  <input
                    type="text"
                    placeholder="Gedung Skill Lab Ruang OSCE Utama"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    Jam Mulai Ujian
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    Estimasi Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Users size={14} className="text-slate-400" />
                    Kapasitas Peserta per Gelombang
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maxParticipants}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setMaxParticipants(val === "" ? "" : Number(val));
                    }}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons for Tab 1 */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                {!isPublishedSession ? (
                  <button
                    type="button"
                    onClick={() => handleSaveCurrentSection(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Save size={15} />
                    Simpan Draft
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveCurrentSection(false)}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-100 transition cursor-pointer"
                  >
                    <Save size={15} />
                    Simpan Perubahan
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer"
                >
                  Lanjutkan: Stase & Durasi
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: GABUNGAN STASE & TIMER ROTASI */}
          {activeTab === 2 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <RotateCw size={19} className="text-blue-600" />
                  2. Durasi & Sirkuit Stase
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur durasi stase, waktu istirahat, jeda transisi, dan susunan stase dalam sirkuit.
                </p>
              </div>

              {/* SEKSI 1: PENGATURAN WAKTU & TIMER ROTASI */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  Pengaturan Waktu Ujian
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      Durasi Stase (Menit)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={stationDurationMinutes}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setStationDurationMinutes(val === "" ? "" : Number(val));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      Durasi Istirahat (Menit)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={breakSlotDurationMinutes}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setBreakSlotDurationMinutes(val === "" ? "" : Number(val));
                      }}
                      className="w-full rounded-xl border border-amber-300 bg-amber-50/50 p-3 text-xs font-bold text-amber-950 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      Durasi Transisi (Menit)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={transitionDurationMinutes}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setTransitionDurationMinutes(val === "" ? "" : Number(val));
                      }}
                      className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 p-3 text-xs font-bold text-emerald-950 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Ringkasan Kalkulasi Sirkuit */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs grid gap-4 sm:grid-cols-3">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Total Stase Sirkuit</span>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">
                        {stationsConfig.length} Stase
                      </span>
                      <span className="rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                        {examCount} Ujian
                      </span>
                      {breakCount > 0 && (
                        <span className="rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                          {breakCount} Istirahat
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Total Ronde Rotasi</span>
                    <span className="font-black text-blue-800 text-base block mt-0.5">
                      {totalRounds} Ronde
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Estimasi Waktu Rotasi</span>
                    <span className="font-black text-emerald-800 text-base block mt-0.5">
                      {(stationDurationMinutes + transitionDurationMinutes) * totalRounds} Menit
                    </span>
                  </div>
                </div>
              </div>

              {/* SEKSI 2: KONFIGURASI POS RUANGAN & SLOT SIRKUIT */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Building2 size={16} className="text-blue-600" />
                        Susunan Stase Sirkuit
                      </h3>
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                        {stationsConfig.length} Stase
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tarik kartu stase untuk mengatur urutan rotasi peserta.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-bold px-1.5">Preset:</span>
                      <button
                        type="button"
                        onClick={() => handleSetPresetStations(4)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          stationsConfig.length === 4
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                        }`}
                      >
                        4 Stase
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetPresetStations(6)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          stationsConfig.length === 6
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                        }`}
                      >
                        6 Stase
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetPresetStations(8)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          stationsConfig.length === 8
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                        }`}
                      >
                        8 Stase
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddStationInline}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition active:scale-95"
                    >
                      <Plus size={15} />
                      Tambah Stase Ujian
                    </button>
                    <button
                      type="button"
                      onClick={handleAddBreakInline}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition active:scale-95"
                    >
                      <Plus size={15} />
                      <Coffee size={15} />
                      Tambah Stase Istirahat
                    </button>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {stationsConfig.map((stg, idx) => {
                    const isDragging = draggedIndex === idx;
                    const isDragOver = dragOverIndex === idx;
                    const isBreak = stg.is_break;

                    return (
                      <div
                        key={stg.id || idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`group relative flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition duration-150 space-y-2.5 ${
                          isBreak
                            ? "border-amber-300 bg-amber-50/70 hover:border-amber-400"
                            : "border-slate-200 bg-white hover:border-blue-300"
                        } ${
                          isDragging ? "opacity-30 scale-95 border-dashed" : ""
                        } ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 transition rounded hover:bg-slate-100"
                              title="Tarik untuk menggeser posisi slot"
                            >
                              <GripVertical size={16} />
                            </span>

                            <span
                              className={`flex h-6 px-2 items-center justify-center rounded-md font-extrabold text-[11px] ${
                                isBreak
                                  ? "bg-amber-200 text-amber-950"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              Slot {stg.station_number}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveStationInline(idx)}
                            className="text-slate-400 hover:text-rose-600 transition p-1"
                            title="Hapus Slot Ini"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div>
                          {/* Station Title Badge */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-full rounded-lg border p-2.5 text-xs font-bold text-center ${
                                isBreak
                                  ? "border-amber-300 bg-amber-100 text-amber-950"
                                  : "border-slate-200 bg-slate-50 text-slate-900"
                              }`}
                            >
                              {isBreak ? (
                                <span className="flex items-center justify-center gap-1.5">
                                  <Coffee size={14} className="text-amber-700" />
                                  Stase Istirahat
                                </span>
                              ) : (
                                `Stase Ujian ${stg.exam_number || (idx + 1)}`
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for Tab 2 */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveCurrentSection(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <Save size={15} />
                  Simpan Draft
                </button>
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
                >
                  Lanjutkan: Soal & Rubrik
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: SOAL-SOAL, KASUS & KUNCI JAWABAN RUBRIK */}
          {activeTab === 3 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen size={19} className="text-blue-600" />
                    3. Soal & Kunci Jawaban Rubrik Medis
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola skenario kasus medis, instruksi, serta item soal-soal dan kunci jawaban rubrik secara inline tanpa modal.
                  </p>
                </div>
              </div>

              {/* Station Selection Tabs with Drag & Drop */}
              <div className="space-y-1.5 border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Klik tab untuk memilih stase, atau{" "}
                    <span className="font-bold text-slate-700">Tarik (Drag & Drop) tab</span> untuk mengubah urutan posisi stase:
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {stationsConfig.slice(0, totalStations).map((stg, idx) => {
                    const isSelected = selectedStationIndex === idx;
                    const isDragging = draggedIndex === idx;
                    const isDragOver = dragOverIndex === idx;
                    const isBreak = stg.is_break;

                    return (
                      <button
                        key={stg.station_number || idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedStationIndex(idx)}
                        className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 cursor-grab active:cursor-grabbing ${
                          isSelected
                            ? isBreak
                              ? "bg-amber-500 text-white shadow-2xs ring-2 ring-amber-400"
                              : "bg-blue-600 text-white shadow-2xs ring-2 ring-blue-400"
                            : isBreak
                            ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        } ${isDragging ? "opacity-30 scale-95" : ""} ${
                          isDragOver ? "ring-2 ring-blue-500 ring-offset-1" : ""
                        }`}
                      >
                        <GripVertical
                          size={14}
                          className={isBreak && !isSelected ? "text-amber-600" : "text-slate-400"}
                        />
                        <span className="flex items-center gap-1.5 shrink-0">
                          {isBreak && <Coffee size={13} className={isSelected ? "text-white" : "text-amber-700"} />}
                          <span>{stg.title}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Station Form Editor */}
              {activeStation?.is_break ? (
                /* BREAK SLOT EDITOR (YELLOW THEME) */
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-md bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950 shadow-2xs">
                        {activeStation.title} (SLOT ISTIRAHAT)
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-bold text-amber-950">
                        Keterangan Ringkas
                      </label>
                      <input
                        type="text"
                        value={activeStation.case_title || `Rotasi Istirahat`}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === selectedStationIndex
                                ? { ...item, case_title: val }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs font-medium text-amber-950 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-amber-950">
                        Instruksi untuk Peserta Ujian Saat Istirahat
                      </label>
                      <textarea
                        rows={3}
                        value={activeStation.participant_instructions || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === selectedStationIndex
                                ? { ...item, participant_instructions: val }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs text-amber-950 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-amber-950">
                        Instruksi untuk Dokter Penguji Saat Istirahat
                      </label>
                      <textarea
                        rows={3}
                        value={activeStation.examiner_instructions || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === selectedStationIndex
                                ? { ...item, examiner_instructions: val }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs text-amber-950 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-100/50 p-3 flex items-center gap-2.5 text-xs text-amber-900">
                    <Info size={16} className="text-amber-700 shrink-0" />
                    <span>
                      Slot istirahat digunakan untuk rotasi jeda fisik peserta & penguji. Tidak memerlukan item soal rubrik medis.
                    </span>
                  </div>
                </div>
              ) : (
                /* EXAM STATION EDITOR (DEFAULT BLUE THEME) */
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
                        {activeStation.title}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {activeStation.case_title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsQuestionBankOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition"
                    >
                      <Sparkles size={14} />
                      Pilih dari Bank Soal
                    </button>
                  </div>

                  {/* Skenario & Judul Kasus */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Judul Kasus Medis Stase
                      </label>
                      <input
                        type="text"
                        value={activeStation.case_title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === selectedStationIndex
                                ? { ...item, case_title: val }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900"
                      />
                    </div>

                    {/* Penugasan Dokter Penguji Stase */}
                    <div className="sm:col-span-2 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-blue-950 flex items-center gap-2">
                          <UserCheck size={16} className="text-blue-600" />
                          Penugasan Dokter Penguji
                        </label>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                          activeStation.assigned_examiner || activeStation.examiner_name
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}>
                          {activeStation.assigned_examiner || activeStation.examiner_name ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-700" />
                              Penguji Ditugaskan
                            </>
                          ) : (
                            <>
                              <AlertCircle size={13} className="text-amber-700" />
                              Belum Ditugaskan
                            </>
                          )}
                        </span>
                      </div>

                      {(() => {
                        const currentExaminer = activeStation.assigned_examiner || activeStation.examiner_name || "";
                        const matchedDoctor = doctorList.find((doc) => {
                          if (!currentExaminer) return false;
                          const target = currentExaminer.trim().toLowerCase();
                          const docName = (doc.name || "").trim().toLowerCase();
                          return docName === target || target.includes(docName) || docName.includes(target);
                        });
                        const selectValue = matchedDoctor ? matchedDoctor.name : currentExaminer;

                        return (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Pilih Dokter Penguji
                            </label>
                            <select
                              value={selectValue}
                              onChange={(e) => {
                                const selectedName = e.target.value;
                                const foundDoc = doctorList.find((d) => d.name === selectedName);
                                setStationsConfig((prev) =>
                                  prev.map((item, i) =>
                                    i === selectedStationIndex
                                      ? {
                                          ...item,
                                          assigned_examiner: selectedName,
                                          examiner_name: selectedName,
                                          examiner_user_id: foundDoc ? foundDoc.id : item.examiner_user_id || null,
                                          examiner_specialty: foundDoc ? foundDoc.specialty : item.examiner_specialty || "Spesialis Medis",
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none cursor-pointer"
                            >
                              <option value="">-- Pilih Dokter Penguji --</option>
                              {doctorList.map((doc) => (
                                <option key={doc.id} value={doc.name}>
                                  {doc.name} ({doc.specialty || "Spesialis Medis"}){doc.institution ? ` - ${doc.institution}` : ""}
                                </option>
                              ))}
                              {currentExaminer && !matchedDoctor && (
                                <option value={currentExaminer}>
                                  {currentExaminer}
                                </option>
                              )}
                            </select>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Skenario Kasus Medis Lengkap
                      </label>
                      <textarea
                        rows={2}
                        value={activeStation.scenario}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === selectedStationIndex
                                ? { ...item, scenario: val }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Instruksi Peserta Ujian
                      </label>
                      <textarea
                        rows={3}
                        value={activeStation.participant_instructions || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === selectedStationIndex
                                ? { ...item, participant_instructions: val }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Instruksi Dokter Penguji
                      </label>
                      <textarea
                        rows={3}
                        value={activeStation.examiner_instructions || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === selectedStationIndex
                                ? { ...item, examiner_instructions: val }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Rubrik Penilaian: Item Soal & Kunci Jawaban */}
                  <div className="border-t border-slate-200 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                          <Award size={15} className="text-blue-600" />
                          Daftar Soal Rubrik & Kunci Jawaban (
                          {activeStation.checklist_items
                            ? activeStation.checklist_items.length
                            : 0}{" "}
                          Item)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tambah & edit item pertanyaan rubrik dan kunci jawaban secara langsung di halaman ini.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddChecklistItem}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition active:scale-95 shadow-2xs"
                      >
                        <Plus size={14} />
                        Tambah Soal Rubrik
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeStation.checklist_items &&
                        activeStation.checklist_items.map((item, itemIdx) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-extrabold text-blue-700">
                                Soal #{itemIdx + 1}
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="text-slate-500 font-medium">
                                    Bobot:
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={item.max_points}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, "");
                                      handleUpdateChecklistItem(
                                        item.id,
                                        "max_points",
                                        val === "" ? "" : Number(val)
                                      );
                                    }}
                                    className="w-12 rounded-md border border-slate-200 text-center py-0.5 text-xs font-bold text-slate-900"
                                  />
                                  <span className="text-slate-500">Poin</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveChecklistItem(item.id)}
                                  className="text-slate-400 hover:text-rose-600 transition"
                                  title="Hapus Soal Rubrik"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="mb-0.5 block text-[10px] font-bold text-slate-600 uppercase">
                                Pertanyaan / Item Rubrik
                              </label>
                              <input
                                type="text"
                                value={item.question}
                                onChange={(e) =>
                                  handleUpdateChecklistItem(
                                    item.id,
                                    "question",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="mb-0.5 block text-[10px] font-bold text-emerald-700 uppercase">
                                Kunci Jawaban / Kriteria Penilaian Benar
                              </label>
                              <input
                                type="text"
                                value={item.answer_key}
                                onChange={(e) =>
                                  handleUpdateChecklistItem(
                                    item.id,
                                    "answer_key",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-emerald-200 bg-emerald-50/40 p-2 text-xs text-emerald-900 font-medium"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Konfigurasi Kunci Jawaban Pemeriksaan Penunjang (Auxiliary Examination Builder) */}
                  <div className="border-t border-slate-200 pt-5">
                    <AdminAuxiliaryExamBuilder
                      configs={activeStation.auxiliary_exam_configs || []}
                      onChangeConfigs={(updatedAux) => {
                        setStationsConfig((prev) =>
                          prev.map((item, i) =>
                            i === selectedStationIndex
                              ? { ...item, auxiliary_exam_configs: updatedAux }
                              : item
                          )
                        );
                      }}
                    />
                  </div>

                  {/* Kunci Jawaban Diagnosis (3 Diagnosis: WDx, DDx 1, DDx 2) & Resep Medis Baku - Teks Box Long Text (Paling Bawah) */}
                  <div className="border-t border-slate-200 pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        Kunci Jawaban Diagnosis Medis (WDx, DDx 1, DDx 2) & Resep Medis Baku
                      </h4>
                      <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                        Kunci Baku Stase
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-800">
                          1. Diagnosis Kerja Utama (WDx)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Tuliskan kunci diagnosis kerja utama (WDx) secara lengkap..."
                          value={activeStation.answer_key_wdx || ""}
                          onChange={(e) => {
                            const wdx = e.target.value;
                            const ddx1 = activeStation.answer_key_ddx1 || "";
                            const ddx2 = activeStation.answer_key_ddx2 || "";
                            const combined = [
                              wdx ? `WDx (Diagnosis Kerja Utama): ${wdx}` : "",
                              ddx1 ? `DDx 1 (Diagnosis Banding 1): ${ddx1}` : "",
                              ddx2 ? `DDx 2 (Diagnosis Banding 2): ${ddx2}` : "",
                            ].filter(Boolean).join("\n");

                            setStationsConfig((prev) =>
                              prev.map((item, i) =>
                                i === selectedStationIndex
                                  ? {
                                      ...item,
                                      answer_key_wdx: wdx,
                                      answer_key_diagnosis: combined || wdx,
                                    }
                                  : item
                              )
                            );
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-900 focus:border-blue-500 leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-800">
                          2. Diagnosis Banding 1 (DDx 1)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Tuliskan kunci diagnosis banding 1 (DDx 1)..."
                          value={activeStation.answer_key_ddx1 || ""}
                          onChange={(e) => {
                            const ddx1 = e.target.value;
                            const wdx = activeStation.answer_key_wdx || "";
                            const ddx2 = activeStation.answer_key_ddx2 || "";
                            const combined = [
                              wdx ? `WDx (Diagnosis Kerja Utama): ${wdx}` : "",
                              ddx1 ? `DDx 1 (Diagnosis Banding 1): ${ddx1}` : "",
                              ddx2 ? `DDx 2 (Diagnosis Banding 2): ${ddx2}` : "",
                            ].filter(Boolean).join("\n");

                            setStationsConfig((prev) =>
                              prev.map((item, i) =>
                                i === selectedStationIndex
                                  ? {
                                      ...item,
                                      answer_key_ddx1: ddx1,
                                      answer_key_diagnosis: combined || wdx,
                                    }
                                  : item
                              )
                            );
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 focus:border-blue-500 leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-800">
                          3. Diagnosis Banding 2 (DDx 2)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Tuliskan kunci diagnosis banding 2 (DDx 2)..."
                          value={activeStation.answer_key_ddx2 || ""}
                          onChange={(e) => {
                            const ddx2 = e.target.value;
                            const wdx = activeStation.answer_key_wdx || "";
                            const ddx1 = activeStation.answer_key_ddx1 || "";
                            const combined = [
                              wdx ? `WDx (Diagnosis Kerja Utama): ${wdx}` : "",
                              ddx1 ? `DDx 1 (Diagnosis Banding 1): ${ddx1}` : "",
                              ddx2 ? `DDx 2 (Diagnosis Banding 2): ${ddx2}` : "",
                            ].filter(Boolean).join("\n");

                            setStationsConfig((prev) =>
                              prev.map((item, i) =>
                                i === selectedStationIndex
                                  ? {
                                      ...item,
                                      answer_key_ddx2: ddx2,
                                      answer_key_diagnosis: combined || wdx,
                                    }
                                  : item
                              )
                            );
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 focus:border-blue-500 leading-relaxed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-800">
                        Kunci Jawaban Resep Medis Baku (Farmakoterapi)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="R/ Aspirin tab 80 mg No. IV..."
                        value={activeStation.answer_key_prescription || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStationsConfig((prev) =>
                            prev.map((item, i) =>
                              i === selectedStationIndex
                                ? { ...item, answer_key_prescription: val }
                                : item
                            )
                          );
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-900 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons for Tab 3 */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveCurrentSection(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <Save size={15} />
                  Simpan Draft
                </button>
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer"
                >
                  Lanjutkan: Aturan Ujian
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4 CONTENT: RULE & OTOMATISASI */}
          {activeTab === 4 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders size={19} className="text-blue-600" />
                  4. Aturan Pelaksanaan Ujian
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Konfigurasi aturan sesi live, rotasi sirkuit, dan penguncian nilai otomatis.
                </p>
              </div>

              <div className="space-y-3.5">
                <RuleToggleItem
                  title="Sesi Live Eksklusif"
                  description="Memastikan hanya 1 sesi ujian yang dapat berjalan secara live dalam 1 waktu."
                  checked={singleLiveSessionRule}
                  onChange={setSingleLiveSessionRule}
                />

                <RuleToggleItem
                  title="Otomatisasi Perputaran Rolling Peserta"
                  description="Peserta akan dipindahkan otomatis ke stase berikutnya setelah timer pengerjaan dan istirahat selesai."
                  checked={autoRollingRule}
                  onChange={setAutoRollingRule}
                />

                <RuleToggleItem
                  title="Penguncian Lembar Penilaian Penguji Otomatis"
                  description="Mengunci formulir nilai penguji saat waktu stase berakhir untuk menghindari perubahan skor susulan."
                  checked={autoLockAnswerRule}
                  onChange={setAutoLockAnswerRule}
                />

                <RuleToggleItem
                  title="Publikasi Nilai Otomatis ke Peserta"
                  description="Mempublikasikan hasil rekapitulasi nilai dan umpan balik ke akun peserta secara otomatis begitu sesi selesai."
                  checked={autoPublishResults}
                  onChange={setAutoPublishResults}
                />

                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Toleransi Keterlambatan Peserta (Menit)
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Waktu maksimal peserta diizinkan memasuki ruang ujian sebelum statusnya diubah menjadi diskualifikasi.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={lateToleranceMinutes}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setLateToleranceMinutes(val === "" ? "" : Number(val));
                      }}
                      className="w-28 rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-center bg-white"
                    />
                    <span className="text-xs font-semibold text-slate-600">Menit</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Tab 4 */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                {!isPublishedSession ? (
                  <button
                    type="button"
                    onClick={() => handleSaveCurrentSection(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                  >
                    <Save size={15} />
                    Simpan Draft Sesi
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleSaveCurrentSection(false);
                    navigate("/admin/sessions");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
                >
                  <CheckCircle2 size={16} />
                  {isEdit ? "Simpan Perubahan Sesi" : "Simpan & Terbitkan Sesi OSCE"}
                </button>
              </div>
            </div>
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

function RuleToggleItem({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white hover:border-blue-200 transition">
      <div className="pr-4">
        <p className="font-bold text-xs text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
