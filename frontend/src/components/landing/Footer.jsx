import { Link } from "react-router-dom";
import {
  Globe,
  Mail,
  MapPin,
  Bot,
  Calendar,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#0D3A68] text-white overflow-hidden pt-14 pb-8 border-t border-[#0A2B4E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          {/* Column 1: Brand & Overview */}
          <div className="lg:col-span-4 flex flex-col items-start space-y-4">
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-xl bg-white/10 p-1.5 border border-white/20 shadow-xs">
                <img
                  src="/favicon.svg"
                  alt="Praxis Logo"
                  className="h-8 w-8 object-contain rounded-md"
                />
              </div>
              <div className="h-5 w-px bg-white/25" aria-hidden="true" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black tracking-tight text-white">Praxis</span>
                <span className="text-xs font-semibold text-blue-200">by Medskill Indonesia</span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              Platform simulasi OSCE kedokteran komprehensif. Menyediakan skema ujian <strong>Mandiri (AI)</strong> dan skema ujian <strong>On-Site</strong> tatap muka di Kantor Medskill Indonesia.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#C9A227] font-semibold">
              <ShieldCheck size={16} />
              <span>Sistem Ujian Terstandarisasi</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-3 flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#C9A227]">
              Navigasi
            </h4>
            <ul className="mt-3.5 space-y-2 text-xs text-blue-100/80 font-medium">
              <li>
                <a href="#why-praxis" className="hover:text-white transition">
                  Kenapa Praxis
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition">
                  Skema Simulasi OSCE
                </a>
              </li>
              <li>
                <a href="#proof" className="hover:text-[#C9A227] transition flex items-center gap-1.5 text-[#C9A227] font-bold">
                  <Bot size={13} />
                  <span>Anamnesis AI</span>
                </a>
              </li>
              <li>
                <a href="#sessions" className="hover:text-white transition">
                  Jadwal Sesi Ujian
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Location & Google Maps Embed */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#C9A227]">
              <MapPin size={15} />
              <span>Lokasi On-Site (Yogyakarta)</span>
            </div>
            <p className="mt-1 text-xs text-blue-100/80 font-medium mb-3">
              Kantor Medskill Indonesia — Yogyakarta, Indonesia
            </p>

            {/* Responsive Google Maps Embed */}
            <div className="w-full overflow-hidden rounded-2xl border border-white/20 shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.3921934978134!2d110.37739227587834!3d-7.748159276821323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a59884f82eb65%3A0x4189b841a8763d0!2sMedskill%20Bimbel%20Kedokteran!5e0!3m2!1sen!2sid!4v1786779940468!5m2!1sen!2sid"
                width="100%"
                height="170"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Lokasi Kantor Medskill Indonesia Yogyakarta"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-200/70 font-medium">
          <p>© 2026 Medskill Indonesia. Praxis by Medskill. Seluruh Hak Cipta Dilindungi.</p>

          <div className="flex items-center gap-2">
            <a
              href="https://medskill.id"
              target="_blank"
              rel="noreferrer"
              aria-label="Website Medskill"
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-[#C9A227] hover:text-[#0D3A68] transition"
            >
              <Globe size={14} />
            </a>
            <a
              href="mailto:officemedskill.idn@gmail.com"
              aria-label="Email Support"
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-[#C9A227] hover:text-[#0D3A68] transition"
            >
              <Mail size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}