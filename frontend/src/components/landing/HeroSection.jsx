import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ShieldCheck, ArrowRight, Star, Users, Award, GraduationCap, Stethoscope } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import SplitText from "./SplitText";
import Threads from "./Threads";

function CountingNumber({ target, suffix = "", prefix = "", decimals = 0, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId;
    const end = typeof target === "number" ? target : parseFloat(String(target).replace(/,/g, "")) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(easeProgress * end);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default function HeroSection() {
  const [user, setUser] = useState(null);
  const [mentorCount, setMentorCount] = useState(14);

  useEffect(() => {
    async function loadData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      try {
        const { count, error } = await supabase
          .from("mentors")
          .select("*", { count: "exact", head: true });
        if (!error && count !== null && count > 0) {
          setMentorCount(count);
        }
      } catch (err) {
        console.error("Error fetching mentor count:", err);
      }
    }
    loadData();
  }, []);

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  const metrics = [
    { label: "Koas Aktif", value: "1,500+", icon: Users },
    { label: "Kelulusan OSCE", value: "98.4%", icon: Award },
    { label: "Penguji Spesialis", value: "50+", icon: ShieldCheck },
    { label: "Rating Kepuasan", value: "4.9/5", icon: Star },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-amber-50/30 via-slate-50 to-white text-slate-900 flex flex-col justify-center pt-24 sm:pt-28 pb-10">
      {/* ReactBits Wavy Mesh Background */}
      <Threads />

      {/* Hero Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headlines, Action Buttons & Marketing Social Proof */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Tag Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/40 bg-amber-50/90 px-3.5 py-1.5 shadow-xs mb-5"
            >
              <img
                src="/logo_biru.avif"
                alt="Praxis Logo"
                className="h-4 w-4 object-contain rounded-xs"
              />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0D3A68]">
                Platform Simulasi OSCE Kedokteran
              </span>
            </motion.div>

            {/* SplitText Motto */}
            <div className="w-full text-left my-1">
              <SplitText
                text="Experience The Real OSCE Before The Real One"
                className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight leading-[1.1] text-[#0D3A68]"
                delay={30}
                duration={0.5}
                splitType="chars"
                from={{ opacity: 0, y: 25 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-30px"
                textAlign="left"
              />
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600 font-medium leading-relaxed"
            >
              Latih keterampilan anamnesis bersama <strong className="text-[#0D3A68] font-bold">Praxis</strong> dan ikuti simulasi ujian <strong className="text-[#C9A227] font-bold">On-Site</strong> langsung bersama dokter penguji untuk kesiapan maksimal menghadapi OSCE.
            </motion.p>

            {/* Primary Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4 items-center w-full sm:w-auto"
            >
              <button
                onClick={() => scrollToSection("sessions")}
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#0D3A68] px-7 py-4 text-sm sm:text-base font-extrabold text-white shadow-lg shadow-[#0D3A68]/20 hover:bg-[#0A2B4E] transition duration-200 cursor-pointer w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Lihat Jadwal Simulasi</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#C9A227]/60 bg-amber-50/70 px-7 py-4 text-sm sm:text-base font-extrabold text-[#0D3A68] shadow-xs hover:bg-amber-100/80 transition duration-200 w-full sm:w-auto hover:scale-[1.02]"
              >
                <ShieldCheck className="h-5 w-5 text-[#C9A227]" />
                <span>Masuk Portal Ujian</span>
              </Link>
            </motion.div>

            {/* Clean Animated Stat Highlights Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full pt-6 border-t border-slate-200/80"
            >
              {/* Stat 1: Pengguna Aktif */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center rounded-2xl bg-amber-50/90 border border-[#C9A227]/40 p-2.5 text-[#0D3A68] shrink-0 mt-0.5 shadow-xs">
                  <Users className="h-5 w-5 text-[#0D3A68]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xl sm:text-2xl font-black text-[#0D3A68] tracking-tight leading-none">
                    <CountingNumber target={800} suffix="+" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                    Pengguna Aktif
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block mt-0.5">
                    Mahasiswa & Dokter Koas
                  </span>
                </div>
              </div>

              {/* Stat 2: Lulusan UKNPDPD */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center rounded-2xl bg-amber-50/90 border border-[#C9A227]/40 p-2.5 text-[#0D3A68] shrink-0 mt-0.5 shadow-xs">
                  <GraduationCap className="h-5 w-5 text-[#0D3A68]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xl sm:text-2xl font-black text-[#0D3A68] tracking-tight leading-none">
                    <CountingNumber target={600} suffix="+" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                    Lulusan UKNPDPD
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block mt-0.5">
                    Alumni Peserta Simulasi
                  </span>
                </div>
              </div>

              {/* Stat 3: Jumlah Mentor */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center rounded-2xl bg-amber-50/90 border border-[#C9A227]/40 p-2.5 text-[#0D3A68] shrink-0 mt-0.5 shadow-xs">
                  <Stethoscope className="h-5 w-5 text-[#0D3A68]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xl sm:text-2xl font-black text-[#0D3A68] tracking-tight leading-none">
                    <CountingNumber target={mentorCount} suffix="+" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                    Jumlah Mentor
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block mt-0.5">
                    Dokter Umum Univ Ternama
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Clean Frameless Mascot praxis_1.png */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex items-center justify-center relative"
          >
            {/* Frameless Mascot Image with smooth gentle floating loop */}
            <motion.img
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              src="/praxis_1.png"
              alt="Maskot Utama Praxis"
              className="w-full max-h-[380px] sm:max-h-[440px] object-contain drop-shadow-lg transition-transform duration-300"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}