import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Send,
  User,
  Bot,
} from "lucide-react";

import {
  getCurrentStage,
  getMyRegistration,
  getMySession,
  getStationQuestion,
} from "@/services/participant.service";

export default function ParticipantSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [registration, setRegistration] = useState(null);
  const [session, setSession] = useState(null);
  const [stage, setStage] = useState(null);
  const [question, setQuestion] = useState(null);

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Halo Dok, saya pasien yang akan Anda periksa hari ini.",
    },
  ]);

  useEffect(() => {
    load();
  }, [sessionId]);

  async function load() {
    try {
      setLoading(true);

      const reg = await getMyRegistration();
      setRegistration(reg);

      if (!reg) return;

      const sess = await getMySession();
      setSession(sess);

      if (!sess || sess.id !== sessionId) return;

      const currentStage = await getCurrentStage();
      setStage(currentStage);

      if (!currentStage) return;

      const currentQuestion = await getStationQuestion(
        currentStage.id
      );

      setQuestion(currentQuestion);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input,
      },
      {
        role: "assistant",
        content:
          "(Placeholder AI Pasien) Saya akan menjawab sesuai skenario nantinya.",
      },
    ]);

    setInput("");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Belum terdaftar.
      </div>
    );
  }
    return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-8">

        <button
          onClick={() => navigate("/participant")}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            1. Anamnesis
          </h1>

          <p className="mt-2 text-slate-500">
            Lakukan anamnesis kepada pasien sesuai skenario dan instruksi yang diberikan.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* LEFT */}

          <div className="space-y-6">

            <div className="rounded-3xl bg-white p-6 shadow">

              <h2 className="mb-4 text-xl font-bold">
                Skenario
              </h2>

              <div className="rounded-2xl bg-slate-50 p-5 whitespace-pre-wrap leading-7">
                {question?.scenario ??
                  "Belum ada skenario."}
              </div>

            </div>

            <div className="rounded-3xl bg-white p-6 shadow">

              <h2 className="mb-4 text-xl font-bold">
                Instruksi Peserta
              </h2>

              <div className="rounded-2xl bg-blue-50 p-5 whitespace-pre-wrap leading-7">
                {question?.participant_instruction ??
                  "Belum ada instruksi."}
              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex h-[760px] flex-col rounded-3xl bg-white shadow">

            <div className="border-b p-6">

              <h2 className="text-xl font-bold">
                Pasien Virtual
              </h2>

              <p className="text-sm text-slate-500">
                Ajukan pertanyaan kepada pasien sebagaimana anamnesis OSCE.
              </p>

            </div>

            <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-6">

              {messages.map((msg, index) => (

                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white"
                    }`}
                  >

                    <div className="mb-2 flex items-center gap-2 font-semibold">

                      {msg.role === "assistant" ? (
                        <>
                          <Bot size={18} />
                          Pasien
                        </>
                      ) : (
                        <>
                          <User size={18} />
                          Anda
                        </>
                      )}

                    </div>

                    <div className="whitespace-pre-wrap leading-7">
                      {msg.content}
                    </div>

                  </div>

                </div>

              ))}

            </div>

            <div className="border-t bg-white p-5">

              <div className="flex gap-3">

                <textarea
                  rows={3}
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  placeholder="Tanyakan sesuatu kepada pasien..."
                  className="flex-1 resize-none rounded-2xl border p-4 outline-none focus:border-blue-500"
                />

                <button
                  onClick={handleSend}
                  className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700"
                >
                  <Send size={18} />
                  Kirim
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}