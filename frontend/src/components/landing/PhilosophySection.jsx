import { motion } from "framer-motion";
import { Brain, Zap } from "lucide-react";
import Threads from "./Threads";

export default function PhilosophySection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden min-h-screen flex flex-col justify-center py-12 bg-[#0D3A68] text-white border-t border-blue-900/40"
    >
      {/* Background Wavy Mesh */}
      <Threads />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#C9A227] bg-white/10 border border-[#C9A227]/40 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
            <Brain size={14} />
            <span>Tentang Praxis</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3 leading-tight">
            Praxis by Medskill
          </h2>
          <p className="mt-3 text-blue-100/90 text-base sm:text-lg font-medium leading-relaxed">
            Program simulasi OSCE kedokteran yang dirancang untuk melatih fokus dan koordinasi keputusan medis saat ujian.
          </p>
        </motion.div>

        {/* Seamless Frameless Logo Showcase with Direct Pointer to Girus Frontalis Superior */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left/Center: Frameless Logo blending natively into #0D3A68 background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col items-center justify-center relative py-4"
          >
            {/* Logo Image without ANY frame/border, blending seamlessly into background */}
            <div className="relative flex items-center justify-center">
              <img
                src="/logo_biru_teks.avif"
                alt="Praxis by Medskill Logo"
                className="w-full max-w-[360px] sm:max-w-[440px] object-contain drop-shadow-xl"
              />

              {/* Precise Pointer Line pointing directly to Girus Frontalis Superior (Top-Left of Brain) */}
              <div className="absolute top-[22%] left-[18%] sm:left-[22%] flex items-center gap-2 pointer-events-none z-20">
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-4 w-4 rounded-full bg-[#C9A227] border-2 border-white shadow-lg shrink-0"
                />
                <div className="h-0.5 w-12 sm:w-20 bg-[#C9A227] shadow-sm" />
              </div>
            </div>
          </motion.div>

          {/* Right Column: 1 Single Simple High-Impact Value Box */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="rounded-3xl border border-[#C9A227]/50 bg-white/10 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-3">
              <div className="flex items-center gap-2 text-[#C9A227]">
                <Zap size={22} />
                <span className="text-xs font-black uppercase tracking-wider">
                  Fokus Utama Simulasi
                </span>
              </div>

              <h3 className="text-2xl font-black text-white leading-tight">
                Girus Frontalis Superior
              </h3>

              <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-medium">
                Bagian anatomi otak berwarna <strong className="text-[#C9A227] font-bold">Kuning Keemasan</strong> ini merupakan pusat perencanaan dan koordinasi keputusan klinis yang dilatih pada setiap simulasi OSCE Praxis.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
