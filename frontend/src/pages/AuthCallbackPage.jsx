import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, Activity, AlertCircle } from "lucide-react";
import { supabase } from "@/supabase/client";
import { getCurrentRole } from "@/services/role.service";
import { getProfile } from "@/services/profile.service";
import { parseUserRole } from "@/services/role.service";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function processAuthCallback() {
      try {
        // Fetch session after OAuth redirect
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user) {
          console.error("OAuth callback error:", error);
          setErrorMsg("Gagal memverifikasi akun Google. Mengarahkan kembali ke halaman login...");
          setTimeout(() => navigate("/login"), 2500);
          return;
        }

        const user = session.user;

        // Ensure profile exists in profiles table
        let userProfile = await getProfile(user.id);

        if (!userProfile) {
          const metaRole =
            parseUserRole(user.user_metadata?.role || user.user_metadata?.roles) || "participant";

          const { data: newProf } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              email: user.email,
              full_name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split("@")[0] ||
                "Peserta OSCE",
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              role: metaRole,
              is_online: true,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .maybeSingle();

          if (newProf) userProfile = newProf;
        }

        // Determine user role and redirect
        const activeRole = await getCurrentRole(user);

        switch (activeRole) {
          case "admin":
            navigate("/admin", { replace: true });
            break;
          case "examiner":
          case "mentor":
            navigate("/examiner", { replace: true });
            break;
          case "participant":
          case "user":
          default:
            navigate("/participant", { replace: true });
            break;
        }
      } catch (err) {
        console.error("Callback processing exception:", err);
        setErrorMsg("Terjadi kesalahan saat memproses sesi login.");
        setTimeout(() => navigate("/login"), 2500);
      }
    }

    processAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 font-sans text-white">
      {/* Background Glow */}
      <div className="absolute h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
          <Activity className="h-7 w-7 animate-pulse" />
        </div>

        <h1 className="text-xl font-extrabold tracking-tight text-white">
          Praxis <span className="text-blue-400">OSCE</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          Sistem Ujian Sirkuit Terpadu Kedokteran
        </p>

        <div className="my-8 border-t border-white/10" />

        {errorMsg ? (
          <div className="flex flex-col items-center gap-3 text-red-400">
            <AlertCircle className="h-8 w-8 animate-bounce text-red-400" />
            <p className="text-xs font-semibold">{errorMsg}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-9 w-9 animate-spin text-blue-400" />
            <div>
              <p className="text-sm font-bold text-slate-200">
                Memverifikasi Autentikasi Google...
              </p>
              <p className="mt-1 text-[11px] text-slate-400 font-medium">
                Mengarahkan Anda ke portal dashboard...
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
          <span>Dekripsi Sesi Terenkripsi Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
