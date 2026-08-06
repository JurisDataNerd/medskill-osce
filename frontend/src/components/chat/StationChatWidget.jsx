import { useState } from "react";
import { Send } from "lucide-react";

/**
 * StationChatWidget Component
 * Komponen Reusable untuk Interaksi Chat / Wawancara Pasien Medis Simulasi.
 * Disimpan untuk penggunaan di masa mendatang (misal: Sesi Ujian Online / AI Simulator).
 */
export default function StationChatWidget({
  patientProfile = {
    name: "Tn. Budi Santoso",
    gender: "Laki-laki",
    age: 45,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  initialMessages = [],
  quickPrompts = [],
  onSendMessage,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = (textToSend) => {
    const content = textToSend || input;
    if (!content.trim()) return;

    const newMsg = { id: Date.now(), role: "user", content };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");

    if (onSendMessage) {
      onSendMessage(content, updatedMessages);
    }
  };

  return (
    <div className="flex flex-col h-[680px] rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Patient Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <img
            src={patientProfile.avatar}
            alt={patientProfile.name}
            className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 shadow-2xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-slate-900">{patientProfile.name}</h3>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">
                Pasien Standar AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {patientProfile.gender}, {patientProfile.age} Tahun
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
          Interaksi Wawancara Live
        </span>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-2xs ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
              }`}
            >
              <p className="text-[10px] font-bold uppercase mb-1 opacity-70">
                {msg.role === "user" ? "Dokter Peserta" : `Pasien (${patientProfile.name})`}
              </p>
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Prompts Bar */}
      {quickPrompts.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/80 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
            Pertanyaan / Tindakan Cepat:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box & Action Footer */}
      <div className="border-t border-slate-200 p-4 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ketik wawancara medis atau instruksi tindakan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
          >
            <Send size={15} />
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
