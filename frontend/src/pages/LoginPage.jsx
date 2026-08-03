import { useState } from "react";
import {
  User,
  Stethoscope,
  Shield,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { login, signIn } from "@/services/auth.service";
import { getCurrentRole, ensureUserRole } from "@/services/role.service";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("participant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await login(email, password);

      if (error) {
        alert("Gagal Login: " + error.message);
        setLoading(false);
        return;
      }

      // Ensure user has a valid role (auto-assign selected role if profile.role is null)
      let osceRole = await ensureUserRole(role);

      // If user is already registered under a different role in database
      if (role !== osceRole) {
        alert(
          `Akun Anda terdaftar sebagai role "${osceRole.toUpperCase()}". Anda otomatis diarahkan ke portal ${osceRole}.`
        );
      }

      redirectByRole(osceRole);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat verifikasi akun.");
    } finally {
      setLoading(false);
    }
  }

  function redirectByRole(userRole) {
    switch (userRole) {
      case "admin":
        navigate("/admin");
        break;
      case "examiner":
        navigate("/examiner");
        break;
      case "participant":
        navigate("/participant");
        break;
      default:
        navigate("/participant");
    }
  }

  // Quick Demo Bypass for Testing
  function handleDemoLogin(demoRole) {
    // Store active demo role in localStorage for frontend preview
    localStorage.setItem("demo_role", demoRole);
    redirectByRole(demoRole);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black shadow-md shadow-blue-600/30">
            <Stethoscope size={26} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
            Praxis <span className="text-blue-600">OSCE</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Objective Structured Clinical Examination Platform
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRole("participant")}
            className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition ${
              role === "participant"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User size={18} className="mb-1" />
            <span>Peserta</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("examiner")}
            className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition ${
              role === "examiner"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Stethoscope size={18} className="mb-1" />
            <span>Penguji</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition ${
              role === "admin"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Shield size={18} className="mb-1" />
            <span>Admin</span>
          </button>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Alamat Email
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 focus-within:border-blue-500 focus-within:bg-white transition">
              <Mail size={16} className="text-slate-400" />
              <input
                type="email"
                required
                className="w-full bg-transparent py-2.5 pl-2.5 text-xs text-slate-900 outline-none"
                placeholder="nama@medskill.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Kata Sandi (Password)
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 focus-within:border-blue-500 focus-within:bg-white transition">
              <Lock size={16} className="text-slate-400" />
              <input
                type="password"
                required
                className="w-full bg-transparent py-2.5 pl-2.5 text-xs text-slate-900 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Memproses Login..." : `Login sebagai ${role.toUpperCase()}`}
          </button>
        </form>

        {/* Google OAuth Option for Participants */}
        {role === "participant" && (
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400">
                atau
              </span>
            </div>

            <button
              type="button"
              onClick={signIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-4 w-4"
              />
              Masuk dengan Akun Google
            </button>
          </div>
        )}

        {/* Quick Demo Access Bar */}
        <div className="border-t border-slate-100 pt-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles size={13} className="text-amber-500" />
            Mode Uji Coba Cepat (Quick Demo)
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("participant")}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition"
            >
              Demo Peserta
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("examiner")}
              className="rounded-lg bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
            >
              Demo Penguji
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-800 hover:bg-slate-200 transition"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}