import { Megaphone, X, Send } from "lucide-react";

export default function LiveBroadcastModal({
  isOpen,
  onClose,
  broadcastMessage,
  setBroadcastMessage,
  broadcastTarget,
  setBroadcastTarget,
  handleSendBroadcast,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone size={20} className="text-indigo-600" />
              Kirim Broadcast Peringatan Realtime (Supabase WebSocket)
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pesan instan akan muncul sebagai banner melayang di layar Peserta & Penguji.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Template Pengumuman Khusus Panitia */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Template Pengumuman Khusus (1-Klik):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Harap seluruh peserta dan dokter penguji tetap berada di pos masing-masing.",
              "Dokter Penguji dimohon memeriksa kelengkapan rubrik penilaian ujian.",
              "Pemberitahuan: Kendala teknis sedang ditangani oleh Tim IT Control Room.",
              "Perhatian: Harap tenang dan menunggu instruksi selanjutnya dari panitia.",
            ].map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBroadcastMessage(tpl)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
              >
                {tpl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Target Layar Penerima Pesan
            </label>
            <select
              value={broadcastTarget}
              onChange={(e) => setBroadcastTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Semua Layar (Peserta & Dokter Penguji)</option>
              <option value="examiners">Layar Dokter Penguji Saja</option>
              <option value="participants">Layar Peserta Saja</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Isi Pesan Broadcast Khusus
            </label>
            <textarea
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Ketikkan pesan khusus atau pengumuman darurat dari Control Room..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSendBroadcast}
            disabled={!broadcastMessage.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <Send size={14} />
            Kirim Broadcast Realtime Now
          </button>
        </div>
      </div>
    </div>
  );
}
