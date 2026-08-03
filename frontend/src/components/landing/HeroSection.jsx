import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Play,
  CheckCircle2,
  Bot,
  Brain,
  MessageSquare,
  ChevronDown,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { supabase } from "@/supabase/client";
import ParticleBackground from "./ParticleBackground";

export default function HeroSection() {
  const containerRef = useRef(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("participant");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setRole(data?.role ?? "participant");
      }
    }
    loadUser();
  }, []);

  function getDashboardLink() {
    switch (role) {
      case "admin":
        return "/admin";
      case "examiner":
      case "mentor":
        return "/examiner";
      default:
        return "/participant";
    }
  }

  function getRoleLabel() {
    switch (role) {
      case "admin":
        return "Admin";
      case "examiner":
      case "mentor":
        return "Penguji";
      default:
        return "Peserta";
    }
  }


  // Smooth lightweight scroll parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/40 to-white text-slate-900 flex flex-col justify-between pt-28 sm:pt-36 pb-12"
    >
      {/* Dynamic Background Mesh & Ambient Glows */}
      <motion.div style={{ y: yBackground }} className="absolute inset-0 pointer-events-none">
        <ParticleBackground />

        {/* Ambient Radial Blue Light Blurs */}
        <div className="absolute top-[-5%] left-[10%] h-[480px] w-[480px] rounded-full bg-blue-400/15 blur-[120px]" />
        <div className="absolute top-[35%] right-[5%] h-[500px] w-[500px] rounded-full bg-[#1E3A8A]/10 blur-[140px]" />
        <div className="absolute bottom-[5%] left-[25%] h-[350px] w-[350px] rounded-full bg-sky-300/20 blur-[110px]" />

        {/* Crisp Grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a0a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </motion.div>

      {/* Main Hero Container */}
      <motion.div
        style={{ opacity: opacityHero, scale: scaleHero }}
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 w-full my-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Action CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Tag Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-4 py-1.5 shadow-md shadow-blue-900/5 backdrop-blur-md"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-ping" />
              <Bot className="h-4 w-4 text-[#1E3A8A]" />
              <span className="text-xs sm:text-sm font-bold tracking-wide text-[#1E3A8A]">
                Fitur Unggulan: Anamnesis Pasien AI
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]"
            >
              Simulasi <span className="bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-cyan-600 bg-clip-text text-transparent">Ujian OSCE</span> & <br />
              Latihan Anamnesis AI
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-2xl text-base sm:text-lg text-slate-600 font-medium leading-relaxed"
            >
              Praxis by Medskill Indonesia membantu mahasiswa kedokteran berlatih wawancara medis (anamnesis) dengan Pasien Standar AI secara interaktif, serta menyelenggarakan simulasi ujian OSCE yang terstruktur.
            </motion.p>

            {/* Feature Highlights Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-6 grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1E3A8A] shrink-0" />
                <span>Simulasi Anamnesis Pasien AI</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1E3A8A] shrink-0" />
                <span>Rubrik Penilaian Penguji</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1E3A8A] shrink-0" />
                <span>Timer & Rotasi Stase Ujian</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1E3A8A] shrink-0" />
                <span>Rekap Evaluasi Performa Klinis</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4 items-center w-full sm:w-auto"
            >
              <a
                href="#sessions"
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-[#1E3A8A] px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-900/25 transition-all duration-300 hover:bg-blue-900 hover:shadow-blue-900/40 hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
              >
                <Play className="h-5 w-5 fill-white transition-transform group-hover:scale-110" />
                <span>Lihat Jadwal Simulasi</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              {user ? (
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-blue-600 bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 backdrop-blur-md transition-all duration-300 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                >
                  <LayoutDashboard className="h-5 w-5 text-white" />
                  <span>Buka Dashboard Saya ({getRoleLabel()})</span>
                  <ArrowRight className="h-5 w-5 text-white" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-blue-200 bg-white px-8 py-4 text-base font-bold text-[#1E3A8A] shadow-md shadow-slate-200/50 backdrop-blur-md transition-all duration-300 hover:border-[#1E3A8A] hover:bg-blue-50 hover:scale-[1.02] w-full sm:w-auto"
                >
                  <ShieldCheck className="h-5 w-5 text-[#1E3A8A]" />
                  <span>Masuk Portal Ujian</span>
                </Link>
              )}
            </motion.div>

          </div>

          {/* Right Column: Prominent Praxis App Screenshot Showcase (/praxis.png) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            {/* Continuous Gentle Floating Animation */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative"
            >
              {/* Outer Glow */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#1E3A8A] via-blue-600 to-cyan-500 opacity-20 blur-2xl transition duration-500" />

              {/* Glassmorphic Screenshot Window */}
              <div className="relative rounded-3xl border border-blue-200/90 bg-white/95 p-3 sm:p-4 shadow-2xl shadow-blue-900/15 backdrop-blur-xl">
                {/* Window Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-bold text-slate-500">Praxis Anamnesis AI — Medskill</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-[#1E3A8A]">
                    <Sparkles className="h-3.5 w-3.5 text-[#1E3A8A]" />
                    <span>Pasien Standar AI Active</span>
                  </div>
                </div>

                {/* Actual Screenshot Image: /praxis.png */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-inner group">
                  <img
                    src="/praxis.png"
                    alt="Tampilan Fitur Simulasi Anamnesis AI Praxis by Medskill"
                    className="w-full h-auto object-cover object-top rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  {/* Overlay Badge showcasing AI Anamnesis feature */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-slate-900/90 p-3 backdrop-blur-md border border-white/20 text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E3A8A] text-white">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Wawancara Medis Interaktif</p>
                        <p className="text-[11px] text-blue-200">Respon Pasien AI sesuai Keluhan Utama</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-block rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white">
                      Live Demo
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Badge Accent */}
              <div className="absolute -bottom-5 -left-4 hidden sm:flex items-center gap-3 rounded-2xl border border-blue-200 bg-white p-3.5 shadow-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A8A] text-white">
                  <Brain size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Analisis Keterampilan Anamnesis</p>
                  <p className="text-[11px] font-medium text-slate-500">Evaluasi Riwayat Penyakit & Gejala</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Scroll Down Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="relative z-10 mx-auto mt-8 flex flex-col items-center gap-2 text-xs font-semibold text-slate-500"
      >
        <span>Lihat Fitur & Jadwal Simulasi</span>
        <a
          href="#sessions"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-white text-[#1E3A8A] shadow-md hover:border-[#1E3A8A] transition"
        >
          <ChevronDown size={18} />
        </a>
      </motion.div>
    </section>
  );
}