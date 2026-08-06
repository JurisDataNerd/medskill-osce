import { useState } from "react";
import {
  User,
  Stethoscope,
  Shield,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  CheckCircle2,
} from "lucide-react";

import { login, signUp, signIn } from "@/services/auth.service";
import { getCurrentRole } from "@/services/role.service";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [role, setRole] = useState("participant"); // 'participant', 'examiner', 'admin'

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        // Direct Registration to Supabase database
        const { data, error } = await signUp(email, password, role, fullName);

        if (error) {
          alert("Gagal Registrasi Supabase: " + error.message);
          setLoading(false);
          return;
        }

        alert(
          `Akun ${fullName || email} berhasil terdaftar di Supabase sebagai ${role.toUpperCase()}!`
        );
        // Switch to login tab
        setMode("login");
        setLoading(false);
        return;
      }

      // Direct Login to Supabase database
      const { data, error } = await login(email, password, role);

      if (error) {
        alert("Gagal Login: " + error.message);
        setLoading(false);
        return;
      }

      // Get confirmed role from Supabase DB profiles table
      const osceRole = (await getCurrentRole()) || role;

      redirectByRole(osceRole);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat terhubung ke Supabase.");
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <span className="text-2xl font-black text-white leading-none">P</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
            Praxis <span className="text-blue-600">OSCE</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Objective Structured Clinical Examination Platform
          </p>
        </div>

        {/* Mode Toggle: Login vs Register */}
        <div className="flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === "login"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === "register"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Daftar Akun Baru (Register)
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700">
            Pilih Role Akun Supabase:
          </label>
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRole("participant")}
              className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-bold transition ${
                role === "participant"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User size={16} className="mb-1" />
              <span>Peserta</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("examiner")}
              className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-bold transition ${
                role === "examiner"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Stethoscope size={16} className="mb-1" />
              <span>Penguji</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-bold transition ${
                role === "admin"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Shield size={16} className="mb-1" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form Login / Register Direct to Supabase */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Nama Lengkap & Gelar
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 focus-within:border-blue-500 focus-within:bg-white transition">
                <User size={16} className="text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full bg-transparent py-2.5 pl-2.5 text-xs text-slate-900 outline-none"
                  placeholder="dr. Ahmad Rizky Pratama"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Alamat Email Supabase
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
                minLength={6}
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
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mode === "register" ? (
              <>
                <UserPlus size={16} />
                {loading ? "Mendaftarkan ke Supabase..." : `Daftar Akun ${role.toUpperCase()} Baru`}
              </>
            ) : (
              <>
                <LogIn size={16} />
                {loading ? "Menghubungkan Supabase..." : `Login sebagai ${role.toUpperCase()}`}
              </>
            )}
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
              Masuk dengan Google (Supabase Auth)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}