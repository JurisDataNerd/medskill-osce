export default function ParticipantStepAnamnesis({ onRequestNextStep }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
            Tahap 1 dari 4
          </span>
          <h2 className="text-base font-black text-slate-900 mt-1 uppercase tracking-wider">
            Pengujian Anamnesis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Halaman pengenalan kasus dan alur pengujian anamnesis peserta secara offline.
          </p>
        </div>
      </div>

      {/* Case Introduction & Anamnesis Protocol Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Panduan Anamnesis Peserta Ujian
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          Lakukan wawancara anamnesis terarah langsung kepada Pasien Standar / Simulator di ruangan mengenai keluhan utama pasien (Onset, Lokasi, Kualitas, Radiasi, dan Faktor Pemberat/Peringan).
        </p>

        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3.5 text-xs text-blue-900 space-y-1">
          <p className="font-bold">Petunjuk Pengerjaan Offline:</p>
          <p className="text-[11px] leading-relaxed">
            Penguji akan mengamati dan menilai komunikasi klinis Anda secara langsung. Setelah selesai menyampaikan anamnesis, silakan tekan tombol di bawah ini untuk berpindah ke tahapan Pemeriksaan Fisik.
          </p>
        </div>
      </div>

      {/* Navigation Action CTA */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => onRequestNextStep(2)}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer"
        >
          Lanjut ke Pemeriksaan Fisik
        </button>
      </div>
    </div>
  );
}
