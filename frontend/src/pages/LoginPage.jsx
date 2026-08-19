import { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthProvider";
import ConfirmModal from "@/components/ConfirmModal";

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();

  const [mode, setMode] = useState("login"); // 'login' or 'register'

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Mengerti",
    variant: "warning",
    isAlert: true,
    onConfirm: null,
  });

function formatAuthErrorMessage(error) {
  if (!error) return "Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.";
  const msg = String(error.message || error || "").toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
    return "Email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali data Anda.";
  }
  if (msg.includes("user already registered") || msg.includes("already registered") || msg.includes("email already in use")) {
    return "Email ini sudah terdaftar. Silakan gunakan menu Masuk atau gunakan email lain.";
  }
  if (msg.includes("email not confirmed")) {
    return "Email Anda belum dikonfirmasi. Harap periksa pesan di kotak masuk email Anda untuk melakukan verifikasi.";
  }
  if (msg.includes("password should be at least")) {
    return "Kata sandi terlalu pendek. Kata sandi minimal harus terdiri dari 6 karakter.";
  }
  if (msg.includes("user not found")) {
    return "Akun dengan email tersebut tidak ditemukan. Silakan lakukan registrasi akun baru terlebih dahulu.";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return "Terlalu banyak percobaan masuk secara berurutan. Silakan tunggu 1-2 menit sebelum mencoba lagi demi keamanan.";
  }
  if (msg.includes("network") || msg.includes("failed to fetch")) {
    return "Gagal terhubung ke jaringan server. Periksa koneksi internet Anda dan coba lagi.";
  }

  return error.message || "Terjadi kesalahan saat memproses permintaan masuk Anda.";
}

// Auto redirect active session users (including Google OAuth return)
  useEffect(() => {
    async function autoRedirect() {
      if (session && user) {
        const detectedRole = await getCurrentRole(user);
        redirectByRole(detectedRole);
      }
    }
    autoRedirect();
  }, [session, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        // Direct Registration to Supabase database (auto assigns role: ["user"])
        const { data, error } = await signUp(email, password, fullName);

        if (error) {
          setConfirmModal({
            isOpen: true,
            title: "Gagal Registrasi",
            message: formatAuthErrorMessage(error),
            confirmText: "Mengerti",
            variant: "danger",
            isAlert: true,
            onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
          });
          setLoading(false);
          return;
        }

        setConfirmModal({
          isOpen: true,
          title: "Registrasi Berhasil",
          message: `Akun ${fullName || email} berhasil terdaftar sebagai Peserta! Silakan lakukan login.`,
          confirmText: "Masuk ke Akun",
          variant: "success",
          isAlert: true,
          onConfirm: () => {
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            setMode("login");
          },
        });
        setMode("login");
        setLoading(false);
        return;
      }

      // Direct Login (auto detects role from raw_user_meta_data JSON)
      const { data, error } = await login(email, password);

      if (error) {
        setConfirmModal({
          isOpen: true,
          title: "Gagal Masuk",
          message: formatAuthErrorMessage(error),
          confirmText: "Mengerti",
          variant: "danger",
          isAlert: true,
          onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
        });
        setLoading(false);
        return;
      }

      // Get auto-detected role from raw_user_meta_data or DB profile
      const detectedRole = await getCurrentRole(data?.user);

      redirectByRole(detectedRole);
    } catch (err) {
      console.error(err);
      setConfirmModal({
        isOpen: true,
        title: "Kesalahan Koneksi",
        message: "Terjadi kesalahan saat menghubungkan ke server.",
        confirmText: "Mengerti",
        variant: "warning",
        isAlert: true,
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
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
      case "mentor":
        navigate("/examiner");
        break;
      case "participant":
      case "user":
      default:
        navigate("/participant");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <img src="/favicon.svg" alt="Praxis Logo" className="mx-auto h-14 w-14 object-contain rounded-2xl shadow-md" />
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
            Masuk
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
            Daftar
          </button>
        </div>

        {/* Form Login / Register */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Nama Lengkap
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
              Email
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
              Kata Sandi
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
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {mode === "register" ? (
              <>
                <UserPlus size={16} />
                {loading ? "Memproses..." : "Daftar"}
              </>
            ) : (
              <>
                <LogIn size={16} />
                {loading ? "Memproses..." : "Masuk"}
              </>
            )}
          </button>
        </form>

        {/* Google OAuth Option */}
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-4 w-4"
            />
            Masuk dengan Google
          </button>
        </div>
      </div>

      {/* Confirm & Alert Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />
    </div>
  );
}