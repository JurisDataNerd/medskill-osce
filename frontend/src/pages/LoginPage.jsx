import { useState } from "react";
import {
  User,
  Stethoscope,
  Shield,
  Mail,
  Lock,
} from "lucide-react";

import { login, signIn } from "@/services/auth.service";
import { getCurrentRole } from "@/services/role.service";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("participant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await login(email, password);

    if (error) {
      alert(error.message);
      return;
    }

    const osceRole = await getCurrentRole();

    switch (osceRole) {
      case "admin":
        navigate("/admin");
        break;

      case "examiner":
        navigate("/examiner");
        break;

      case "participant":
      default:
        navigate("/");
        break;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <h1 className="text-center text-3xl font-bold">
          Praxis by MedSkill Indonesia
        </h1>

        <p className="mt-2 text-center text-sm text-slate-500">
          Objective Structured Clinical Examination Platform
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">

          <button
            onClick={() => setRole("participant")}
            className={`rounded-xl border p-4 ${
              role === "participant"
                ? "border-blue-600 bg-blue-50"
                : ""
            }`}
          >
            <User className="mx-auto mb-2" />

            <p className="text-sm font-semibold">
              Peserta
            </p>

          </button>

          <button
            onClick={() => setRole("examiner")}
            className={`rounded-xl border p-4 ${
              role === "examiner"
                ? "border-blue-600 bg-blue-50"
                : ""
            }`}
          >
            <Stethoscope className="mx-auto mb-2" />

            <p className="text-sm font-semibold">
              Penguji
            </p>

          </button>

          <button
            onClick={() => setRole("admin")}
            className={`rounded-xl border p-4 ${
              role === "admin"
                ? "border-blue-600 bg-blue-50"
                : ""
            }`}
          >
            <Shield className="mx-auto mb-2" />

            <p className="text-sm font-semibold">
              Admin
            </p>

          </button>

        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          <div>

            <label className="mb-2 block text-sm">
              Email
            </label>

            <div className="flex items-center rounded-lg border px-3">

              <Mail size={18} />

              <input
                type="email"
                className="w-full bg-transparent p-3 outline-none"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm">
              Password
            </label>

            <div className="flex items-center rounded-lg border px-3">

              <Lock size={18} />

              <input
                type="password"
                className="w-full bg-transparent p-3 outline-none"
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />

            </div>

          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#1E3A8A] py-3 font-semibold text-white"
          >
            Login
          </button>

        </form>

        {role === "participant" && (
          <>

            <div className="my-6 flex items-center">

              <div className="h-px flex-1 bg-slate-300"/>

              <span className="mx-3 text-sm text-slate-400">
                atau
              </span>

              <div className="h-px flex-1 bg-slate-300"/>

            </div>

            <button
              onClick={signIn}
              className="w-full rounded-xl border py-3 font-semibold"
            >
              Login dengan Google
            </button>

          </>
        )}

      </div>

    </div>
  );
}