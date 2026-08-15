import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileCheck,
  XCircle,
  Hourglass,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { getOpenSessions } from "@/services/landing.service";
import { registerParticipantToSession } from "@/services/session.service";
import SessionRegistrationModal from "./SessionRegistrationModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function SessionSection() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [registered, setRegistered] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedSessionForModal, setSelectedSessionForModal] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Mengerti",
    variant: "warning",
    isAlert: true,
    onConfirm: null,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const sessionData = await getOpenSessions();
      const openSessions = (sessionData ?? []).filter(
        (s) =>
          s.status === "published" ||
          s.status === "scheduled" ||
          s.status === "ongoing" ||
          s.status === "running"
      );
      setSessions(openSessions);

      const map = {};

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .schema("osce")
            .from("session_participants")
            .select("session_id,status")
            .eq("user_id", user.id);

          (data ?? []).forEach((item) => {
            let normStatus = (item.status || "pending").toLowerCase();
            if (normStatus === "active") normStatus = "approved";
            if (normStatus === "absent") normStatus = "rejected";
            map[item.session_id] = normStatus;
          });
        }
      } catch (e) { }

      setRegistered(map);
    } catch (err) {
      console.error("Error loading sessions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenRegisterModal(sessionTarget) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    setSelectedSessionForModal(sessionTarget);
    setIsRegistrationModalOpen(true);
  }

  async function handleConfirmRegistration(sessionId) {
    try {
      await registerParticipantToSession(sessionId);
      setIsRegistrationModalOpen(false);
      navigate("/participant");
    } catch (err) {
      console.error("Error confirming registration:", err);
      alert(err.message || "Gagal mendaftar sesi ke database.");
    }
  }

  function renderButton(session) {
    const status = registered[session.id];

    if (!status) {
      return (
        <button
          onClick={() => handleOpenRegisterModal(session)}
          className="group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0D3A68] py-3 text-xs sm:text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0A2B4E] cursor-pointer"
        >
          <span>Daftar Sesi Ujian</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      );
    }

    if (status === "pending") {
      return (
        <button
          disabled
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-100 border border-amber-300 py-3 text-xs sm:text-sm font-extrabold text-amber-950 opacity-90 cursor-not-allowed"
        >
          <Hourglass size={16} className="text-[#C9A227] animate-spin" />
          <span>Menunggu Approval</span>
        </button>
      );
    }

    if (status === "approved" || status === "assigned") {
      return (
        <button
          disabled
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-100 border border-emerald-300 py-3 text-xs sm:text-sm font-extrabold text-emerald-950 opacity-90 cursor-not-allowed"
        >
          <CheckCircle2 size={16} className="text-emerald-700" />
          <span>Terdaftar</span>
        </button>
      );
    }

    if (status === "running") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D3A68] py-3 text-xs sm:text-sm font-extrabold text-white shadow hover:bg-[#0A2B4E] transition cursor-pointer"
        >
          <PlayCircle size={16} className="animate-pulse text-[#C9A227]" />
          <span>Lanjutkan Ujian Live</span>
        </button>
      );
    }

    if (status === "finished") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-3 text-xs sm:text-sm font-extrabold text-slate-700 transition hover:bg-slate-200 cursor-pointer"
        >
          <FileCheck size={16} className="text-[#0D3A68]" />
          <span>Lihat Hasil & Feedback</span>
        </button>
      );
    }

    if (status === "rejected") {
      return (
        <button
          disabled
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-100 border border-red-300 py-3 text-xs sm:text-sm font-extrabold text-red-900 opacity-80 cursor-not-allowed"
        >
          <XCircle size={16} className="text-red-700" />
          <span>Ditolak Admin</span>
        </button>
      );
    }

    return null;
  }

  return (
    <section
      id="sessions"
      className="py-16 sm:py-20 bg-slate-50/70 text-slate-900 border-t border-slate-200/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Nusago.id Style Clean Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0D3A68] bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full shadow-xs">
            Jadwal Ujian Terbuka
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4">
            Sesi Simulasi OSCE Mendatang
          </h2>
          <p className="mt-3 text-slate-600 text-base font-medium">
            Pilih dan daftarkan diri Anda dalam sesi simulasi ujian OSCE terbuka.
          </p>
        </motion.div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white p-7"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-10 text-center max-w-md mx-auto shadow-sm">
            <AlertCircle size={28} className="text-[#0D3A68] mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Belum Ada Sesi Terbuka</h3>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Silakan cek kembali secara berkala untuk jadwal ujian mendatang.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-md shadow-slate-200/40 transition-all duration-200 hover:shadow-xl hover:border-[#0D3A68]/40"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    {session.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {session.description || "Simulasi ujian OSCE kedokteran terstruktur."}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <Calendar size={15} className="text-[#0D3A68]" />
                      <span>{session.session_date || "Tanggal Sesi"}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock size={15} className="text-[#0D3A68]" />
                      <span>{session.start_time || "Waktu Mulai"}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Users size={15} className="text-[#0D3A68]" />
                      <span>Kuota: {session.max_participants || 30} Peserta</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Building2 size={15} className="text-[#0D3A68]" />
                      <span>{session.total_stations || 6} Stase Ujian</span>
                    </div>
                  </div>
                </div>

                {renderButton(session)}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <SessionRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onConfirm={handleConfirmRegistration}
        session={selectedSessionForModal}
      />

      {/* Confirm & Alert Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />
    </section>
  );
}