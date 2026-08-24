import { UserCheck } from "lucide-react";

export default function ExaminerGlobalRatingSheet({
  globalRating,
  setGlobalRating,
  feedback,
  setFeedback,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <UserCheck size={18} className="text-purple-600" />
        Global Performance Rating Scale (GRS) & Feedback Kualitatif
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Penilaian Kualitatif Holistik (Global Rating Scale):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: "SUPERIOR", label: "Superior (Sangat Baik)" },
              { value: "SATISFACTORY", label: "Satisfactory (Lulus)" },
              { value: "BORDERLINE", label: "Borderline (Ragu)" },
              { value: "UNSATISFACTORY", label: "Unsatisfactory (Tidak Lulus)" },
            ].map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGlobalRating(g.value)}
                className={`rounded-xl border p-3 text-center text-xs font-bold transition cursor-pointer ${
                  globalRating === g.value
                    ? "bg-purple-600 text-white border-purple-600 shadow-md"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Catatan Feedback Kualitatif Dokter Penguji:
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Berikan saran perbaikan atau pujian atas teknik komunikasi dan tindakan klinis peserta..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:border-purple-500 focus:outline-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
