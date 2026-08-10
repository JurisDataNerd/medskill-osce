import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Building2,
  Timer,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileCheck,
  XCircle,
  Hourglass,
  Layers,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { getOpenSessions } from "@/services/landing.service";
import SessionRegistrationModal from "./SessionRegistrationModal";

export default function SessionSection() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [registered, setRegistered] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const sessionData = await getOpenSessions();
      const openSessions = (sessionData ?? []).filter(
        (s) => s.status === "published" || s.status === "ongoing" || s.status === "running"
      );
      setSessions(openSessions);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const { data } = await supabase
        .schema("osce")
        .from("session_participants")
        .select("session_id,status")
        .eq("user_id", session.user.id);

      const map = {};
      (data ?? []).forEach((item) => {
        map[item.session_id] = item.status;
      });

      setRegistered(map);
    } catch (err) {
      console.error("Error loading sessions:", err);
    } finally {
      setLoading(false);
    }
  }

  const [selectedSessionForModal, setSelectedSessionForModal] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  async function handleOpenRegisterModal(sessionTarget) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/login");
      return;
    }

    setSelectedSessionForModal(sessionTarget);
    setIsRegistrationModalOpen(true);
  }

  async function handleConfirmRegistration(sessionId) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { error } = await supabase
        .schema("osce")
        .from("session_participants")
        .insert({
          session_id: sessionId,
          user_id: session.user.id,
          status: "enrolled",
        });

      if (error) {
        console.warn("DB registration note:", error.message);
      }
    }

    setIsRegistrationModalOpen(false);
    // Route to Candidate Dashboard to view registered session cards!
    navigate("/participant");
  }

  function renderButton(session) {
    const status = registered[session.id];

    if (!status) {
      return (
        <button
          onClick={() => handleOpenRegisterModal(session)}
          className="group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#1E3A8A] py-3.5 font-bold text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:bg-blue-900 hover:shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Daftar Sesi Ujian</span>
          <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      );
    }

    if (status === "pending") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-300 py-3.5 font-bold text-amber-900 transition-all hover:bg-amber-100 hover:scale-[1.02]"
        >
          <Hourglass size={16} className="text-amber-700" />
          <span>Lihat Status di Dashboard</span>
          <ArrowRight size={16} className="text-amber-700" />
        </button>
      );
    }

    if (status === "approved" || status === "assigned") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:scale-[1.02]"
        >
          <CheckCircle2 size={18} />
          <span>Masuk Ruang Ujian</span>
        </button>
      );
    }

    if (status === "running") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-3.5 font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-900 hover:scale-[1.02]"
        >
          <PlayCircle size={18} className="animate-pulse" />
          <span>Lanjutkan Ujian Live</span>
        </button>
      );
    }

    if (status === "finished") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-200"
        >
          <FileCheck size={18} className="text-[#1E3A8A]" />
          <span>Lihat Hasil & Feedback</span>
        </button>
      );
    }

    if (status === "rejected") {
      return (
        <button
          onClick={() => navigate("/participant")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-3.5 font-bold text-red-700 transition-all hover:bg-red-100"
        >
          <XCircle size={18} />
          <span>Pendaftaran Ditolak</span>
        </button>
      );
    }

    return null;
  }

  return (
    <section
      id="sessions"
      className="relative py-28 bg-gradient-to-b from-white via-blue-50/30 to-slate-50 text-slate-900 overflow-hidden"
    >
      {/* Background Decor Ambient Circles */}
      <div className="absolute top-1/3 left-0 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-blue-200/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-sky-200/30 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 shadow-sm mb-4">
            <Layers className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
              Jadwal Simulasi OSCE
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Sesi Simulasi <span className="bg-gradient-to-r from-[#1E3A8A] to-blue-600 bg-clip-text text-transparent">Mendatang</span>
          </h2>

          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium">
            Pilih dan daftarkan diri Anda dalam sesi ujian OSCE. Berlatih anamnesis dan ikuti evaluasi stase terstruktur.
          </p>
        </motion.div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-3xl border border-blue-100 bg-white p-8 shadow-sm"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: "-30px" }}
            className="flex flex-col items-center justify-center rounded-3xl border border-blue-100 bg-white p-12 text-center shadow-xl shadow-blue-900/5 max-w-xl mx-auto"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#1E3A8A]">Belum Ada Sesi OSCE Terbuka</h3>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Saat ini belum ada jadwal simulasi yang dipublikasikan. Silakan cek kembali secara berkala.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-blue-100 bg-white p-7 shadow-xl shadow-blue-900/5 backdrop-blur-xl transition-all duration-300 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-4">
                    {registered[session.id] === "pending" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3.5 py-1 text-xs font-extrabold text-amber-900 shadow-2xs">
                        <Hourglass size={13} className="text-amber-700" />
                        Menunggu Persetujuan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#1E3A8A]">
                        <Sparkles size={12} />
                        Pendaftaran Terbuka
                      </span>
                    )}

                    {registered[session.id] && registered[session.id] !== "pending" && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-[#1E3A8A] capitalize">
                        Status: {registered[session.id]}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#1E3A8A] transition-colors">
                    {session.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {session.description || "Simulasi ujian OSCE dengan penilaian rubrik klinis."}
                  </p>

                  {/* Details List with Icons */}
                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-700 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                        <Calendar size={16} />
                      </div>
                      <span className="font-bold">{session.session_date || "Tanggal Sesi"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                        <Clock size={16} />
                      </div>
                      <span className="font-semibold">{session.start_time || "Waktu Mulai"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                        <Users size={16} />
                      </div>
                      <span className="font-semibold">Kapasitas: {session.max_participants || 30} Peserta</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                        <Building2 size={16} />
                      </div>
                      <span className="font-semibold">Total: {session.total_stations || 6} Stase Ujian</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
                        <Timer size={16} />
                      </div>
                      <span className="font-semibold">{session.station_duration_minutes || 10} Menit per Stase</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                {renderButton(session)}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Pendaftaran Sesi */}
      <SessionRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onConfirm={handleConfirmRegistration}
        session={selectedSessionForModal}
      />
    </section>
  );
}