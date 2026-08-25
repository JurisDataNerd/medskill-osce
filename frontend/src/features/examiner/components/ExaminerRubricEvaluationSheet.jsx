import { Award, FileText } from "lucide-react";

export default function ExaminerRubricEvaluationSheet({
  rubricItems = [],
  rubricScores = {},
  onScoreChange,
}) {
  const sortedItems = [...rubricItems].sort((a, b) => {
    const numA = Number(a.question_number ?? a.sort_order ?? 0);
    const numB = Number(b.question_number ?? b.sort_order ?? 0);
    return numA - numB;
  });

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Award size={18} className="text-blue-600" />
        Rubrik Penilaian Objektif Deskriptor SKDI ({sortedItems.length} Item Penilaian)
      </h2>

      <div className="space-y-4">
        {sortedItems.map((rub, rIdx) => {
          const itemKey = rub.id || `rubric-${rIdx}`;
          const scoreVal =
            rubricScores[rub.id] ??
            (rub.id ? rubricScores[String(rub.id)] : undefined) ??
            rubricScores[`rubric-${rIdx}`] ??
            rubricScores[rIdx] ??
            3;

          const itemTitle = rub.title || rub.question || rub.name || `Item Rubrik #${rIdx + 1}`;
          const itemDesc = rub.description || rub.answer_key || "";
          const displayNum = rub.question_number ? Number(rub.question_number) : rIdx + 1;

          const desc0 = rub.description_score_0 || rub.descriptors?.[0] || rub.descriptors?.score_0 || "0: Tidak Dilakukan / Salah Total";
          const desc1 = rub.description_score_1 || rub.descriptors?.[1] || rub.descriptors?.score_1 || "1: Minimal / Sebagian Salah";
          const desc2 = rub.description_score_2 || rub.descriptors?.[2] || rub.descriptors?.score_2 || "2: Cukup / Memadai";
          const desc3 = rub.description_score_3 || rub.descriptors?.[3] || rub.descriptors?.score_3 || "3: Sempurna & Lengkap";

          const opts = [
            { val: 0, label: "Poin 0", desc: desc0, short: "Salah Total" },
            { val: 1, label: "Poin 1", desc: desc1, short: "Minimal" },
            { val: 2, label: "Poin 2", desc: desc2, short: "Memadai" },
            { val: 3, label: "Poin 3", desc: desc3, short: "Sempurna" },
          ];

          return (
            <div key={itemKey} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3.5">
              {/* Header Title & Score Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-blue-100 text-blue-900 px-2 py-0.5 text-[10px] font-extrabold uppercase shadow-2xs">
                      Bobot x{rub.weight || 1}
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-900 leading-snug">
                      {displayNum}. {itemTitle}
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0 shadow-2xs">
                  Skor: {scoreVal} / {rub.max_points || 3} Pts
                </span>
              </div>

              {/* Kunci Jawaban / Panduan Penilaian Box (Formatted Multiline Paragraph) */}
              {itemDesc && (
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <FileText size={13} className="text-blue-600" />
                    Kunci Jawaban / Panduan Penilaian:
                  </div>
                  <div className="text-xs text-slate-800 font-medium leading-relaxed text-justify whitespace-pre-line">
                    {itemDesc}
                  </div>
                </div>
              )}

              {/* Rating Radio Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {opts.map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => onScoreChange(itemKey, opt.val)}
                    title={opt.desc}
                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      scoreVal === opt.val
                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50"
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
