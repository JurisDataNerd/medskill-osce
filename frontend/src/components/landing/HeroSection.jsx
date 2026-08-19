import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ShieldCheck, ArrowRight, Star, Users, Award } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import SplitText from "./SplitText";
import Threads from "./Threads";

export default function HeroSection() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    }
    loadUser();
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
              className="inline-flex items-center gap-2.5 rounded-full border border-[#C9A227]/40 bg-amber-50/90 px-4 py-1.5 shadow-xs mb-5"
            >
              <img
                src="/logo_biru.avif"
                alt="Praxis Logo"
                className="h-5 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span className="flex h-2 w-2 rounded-full bg-[#C9A227] animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0D3A68]">
                #1 Platform Simulasi OSCE Kedokteran
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

            {/* Subtitle Empati untuk Koas */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600 font-medium leading-relaxed"
            >
              Persiapkan dirimu menghadapi ujian OSCE tanpa rasa cemas, Dok. Latih kepekaan anamnesismu bersama <strong className="text-[#0D3A68] font-bold">Pasien Standar AI 24/7</strong> dan kuasai ritme pengerjaan diagnosis & resep di <strong className="text-[#C9A227] font-bold">Simulasi Ujian Realistis</strong>.
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
                <span>Login Portal Ujian</span>
              </Link>
            </motion.div>

            {/* High-Impact Social Proof Metrics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-6 border-t border-slate-200/80"
            >
              {metrics.map((m, idx) => {
                const MIcon = m.icon;
                return (
                  <div key={idx} className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 text-[#0D3A68] mb-0.5">
                      <MIcon size={15} className="text-[#C9A227]" />
                      <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0D3A68]">
                        {m.value}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{m.label}</span>
                  </div>
                );
              })}
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