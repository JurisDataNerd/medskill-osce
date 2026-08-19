import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Mail,
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
    <footer className="relative bg-[#0D3A68] text-white overflow-hidden pt-16 pb-10 border-t border-[#0A2B4E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Tagline with logo_biru.avif */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
                <img
                  src="/logo_biru.avif"
                  alt="Praxis Logo Utama"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div className="flex flex-col border-l border-white/20 pl-3">
                <span className="text-xs font-black tracking-wider uppercase text-[#C9A227]">
                  by Medskill Indonesia
                </span>
                <span className="text-[10px] text-blue-100 font-medium">
                  Platform Ujian OSCE Kedokteran
                </span>
              </div>
            </Link>

            <p className="mt-5 text-blue-100/90 text-xs sm:text-sm leading-relaxed max-w-md font-normal">
              Program simulasi OSCE kedokteran dari Medskill. Menghadirkan skema <strong className="text-white font-bold">OSCE Mandiri</strong> dengan Pasien AI di Anamnesis & skema <strong className="text-white font-bold">OSCE On-Site</strong> dengan sirkuit 6 stase aktif.
            </p>

            {/* System Status Indicator */}
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[#C9A227]/40 bg-amber-950/30 px-3.5 py-1 text-xs font-bold text-[#C9A227]">
              <span className="flex h-2 w-2 rounded-full bg-[#C9A227] animate-ping" />
              <span>Sistem Ujian Active & Operational</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 flex flex-col">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C9A227]">
              Navigasi Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-blue-100/80 font-medium">
              <li>
                <a href="#why-praxis" className="hover:text-white transition">
                  Kenapa Praxis
                </a>
              </li>
              <li>
                <a href="#proof" className="hover:text-[#C9A227] transition flex items-center gap-1.5 text-[#C9A227] font-bold">
                  <Bot size={14} />
                  <span>Simulasi Anamnesis AI</span>
                </a>
              </li>
              <li>
                <a href="#sessions" className="hover:text-white transition">
                  Jadwal Simulasi Terbuka
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Portal Login Ujian
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="md:col-span-4 flex flex-col">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C9A227]">
              Informasi & Updates Simulasi
            </h4>
            <p className="mt-4 text-xs text-blue-100/80 leading-relaxed font-normal">
              Dapatkan info jadwal sesi ujian OSCE terbaru dan pembaruan fitur Pasien AI Anamnesis.
            </p>

            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2">
              <div className="flex items-center rounded-2xl border border-white/20 bg-white/10 p-1.5 transition-all focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email kedokteran..."
                  required
                  className="w-full min-w-0 bg-transparent px-3 py-2 text-xs text-white placeholder-blue-200/60 outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-[#C9A227] px-4 py-2 text-xs font-extrabold text-[#0D3A68] shadow-md transition hover:bg-amber-400 active:scale-95 cursor-pointer"
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
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/70 font-medium">
          <p>© 2026 MedSkill Indonesia. Praxis by Medskill. Seluruh Hak Cipta Dilindungi.</p>

          <div className="flex items-center gap-3">
            <a href="#" aria-label="Website" className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-[#C9A227] hover:text-[#0D3A68] transition-all">
              <Globe size={16} />
            </a>
            <a href="#" aria-label="Email Support" className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-[#C9A227] hover:text-[#0D3A68] transition-all">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}