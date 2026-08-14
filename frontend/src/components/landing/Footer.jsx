import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Mail,
  Globe,
  ArrowRight,
  Check,
  Bot,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 4000);
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#1E3A8A] via-slate-900 to-slate-950 text-white overflow-hidden pt-20 pb-12">
      {/* Ambient Footer Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[250px] w-[500px] rounded-full bg-blue-500/15 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3">
              <img src="/favicon.svg" alt="Praxis Logo" className="h-10 w-10 object-contain rounded-xl shadow-lg" />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Praxis
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-200">
                  by Medskill Indonesia
                </span>
              </div>
            </Link>

            <p className="mt-5 text-blue-100/80 text-sm leading-relaxed max-w-md font-normal">
              Platform simulasi ujian OSCE dan latihan anamnesis interaktif berbasis AI.
              Membantu mahasiswa kedokteran dan penguji menyelenggarakan ujian OSCE yang terstruktur.
            </p>

            {/* System Status Indicator */}
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Platform Aktif & Siap Digunakan</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 flex flex-col">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Navigasi Platform
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-blue-100/70 font-medium">
              <li>
                <a href="#sessions" className="hover:text-white transition">
                  Jadwal Simulasi OSCE
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition">
                  Fitur Anamnesis AI & Rubrik
                </a>
              </li>
              <li>
                <a href="#why-praxis" className="hover:text-white transition">
                  Keunggulan Praxis
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Portal Login Ujian
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Newsletter & Updates */}
          <div className="md:col-span-4 flex flex-col">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Informasi & Update Simulasi
            </h4>
            <p className="mt-5 text-xs text-blue-100/70 leading-relaxed font-normal">
              Dapatkan informasi pembaharuan sesi simulasi dan fitur anamnesis AI terbaru.
            </p>

            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email institusi/peserta..."
                  required
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-blue-200/50 outline-none focus:border-white transition"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-xs font-bold text-[#1E3A8A] shadow transition hover:bg-blue-50 active:scale-95"
                >
                  {subscribed ? (
                    <>
                      <Check size={14} />
                      <span>Terdaftar</span>
                    </>
                  ) : (
                    <>
                      <span>Langganan</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/60 font-medium">
          <p>© 2026 MedSkill Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Website" className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white hover:text-[#1E3A8A] hover:scale-110 transition-all">
              <Globe size={18} />
            </a>
            <a href="#" aria-label="Email Support" className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white hover:text-[#1E3A8A] hover:scale-110 transition-all">
              <Mail size={18} />
            </a>
            <a href="#" aria-label="Github" className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white hover:text-[#1E3A8A] hover:scale-110 transition-all">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a href="#" aria-label="Linkedin" className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white hover:text-[#1E3A8A] hover:scale-110 transition-all">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}