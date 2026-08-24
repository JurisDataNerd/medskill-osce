import { Award } from "lucide-react";

export default function ExaminerRubricEvaluationSheet({
  rubricItems = [],
  rubricScores = {},
  onScoreChange,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Award size={18} className="text-blue-600" />
        Rubrik Penilaian Objektif Deskriptor SKDI ({rubricItems.length} Item Penilaian)
      </h2>

      <div className="space-y-4">
        {rubricItems.map((rub, rIdx) => {
          const scoreVal = rubricScores[rub.id] ?? 3;
          const itemTitle = rub.title || rub.question || rub.name || `Item Rubrik #${rIdx + 1}`;
          const itemDesc = rub.description || rub.answer_key || "";
          const desc0 = rub.description_score_0 || rub.descriptors?.[0] || "0: Tidak Dilakukan / Salah Total";
          const desc1 = rub.description_score_1 || rub.descriptors?.[1] || "1: Minimal / Sebagian Salah";
          const desc2 = rub.description_score_2 || rub.descriptors?.[2] || "2: Cukup / Memadai";
          const desc3 = rub.description_score_3 || rub.descriptors?.[3] || "3: Sempurna & Lengkap";

          const opts = [
            { val: 0, label: "Poin 0", desc: desc0, short: "Salah Total" },
            { val: 1, label: "Poin 1", desc: desc1, short: "Minimal" },
            { val: 2, label: "Poin 2", desc: desc2, short: "Memadai" },
            { val: 3, label: "Poin 3", desc: desc3, short: "Sempurna" },
          ];

          return (
            <div key={rub.id || rIdx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-md bg-blue-100 text-blue-900 px-2 py-0.5 text-[10px] font-extrabold uppercase mr-2">
                    Bobot x{rub.weight || 1}
                  </span>
                  <h3 className="text-xs font-extrabold text-slate-900 inline">
                    {rIdx + 1}. {itemTitle}
                  </h3>
                  {itemDesc && (
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {itemDesc}
                    </p>
                  )}
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md shrink-0">
                  Skor: {scoreVal} / {rub.max_points || 3} Pts
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {opts.map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => onScoreChange(rub.id, opt.val)}
                    title={opt.desc}
                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      scoreVal === opt.val
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[9px] font-medium opacity-80 line-clamp-1">{opt.desc || opt.short}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
