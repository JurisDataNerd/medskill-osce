import {
  Sliders,
  CheckCircle2,
  Save,
} from "lucide-react";

function RuleToggleItem({ title, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
      <div>
        <h4 className="text-xs font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function SessionRulesReviewTab({
  singleLiveSessionRule,
  setSingleLiveSessionRule,
  enableTransitionPhase,
  setEnableTransitionPhase,
  enableWaitingRoomPhase,
  setEnableWaitingRoomPhase,
  enableThankYouScreenPhase,
  setEnableThankYouScreenPhase,
  autoRollingRule,
  setAutoRollingRule,
  autoLockAnswerRule,
  setAutoLockAnswerRule,
  autoPublishResults,
  setAutoPublishResults,
  lateToleranceMinutes,
  setLateToleranceMinutes,
  isPublishedSession,
  isEdit,
  handleSaveCurrentSection,
  navigate,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sliders size={19} className="text-blue-600" />
          4. Aturan Pelaksanaan Ujian
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi aturan sesi live, rotasi sirkuit, dan penguncian nilai otomatis.
        </p>
      </div>

      <div className="space-y-3.5">
        <RuleToggleItem
          title="Sesi Live Eksklusif"
          description="Memastikan hanya 1 sesi ujian yang dapat berjalan secara live dalam 1 waktu."
          checked={singleLiveSessionRule}
          onChange={setSingleLiveSessionRule}
        />

        <RuleToggleItem
          title="Tampilkan Layar Transisi Persiapan & Rotasi Pos Stase"
          description="Menampilkan layar transisi perpindahan pos (1-2 Menit) bagi peserta & penguji di awal dan setiap pergantian stase."
          checked={enableTransitionPhase}
          onChange={setEnableTransitionPhase}
        />

        <RuleToggleItem
          title="Aktifkan Waiting Room (Ruang Tunggu Pre-Ujian)"
          description="Mengarahkan peserta & penguji ke ruang tunggu pra-ujian sebelum Admin menekan tombol Mulai Ujian."
          checked={enableWaitingRoomPhase}
          onChange={setEnableWaitingRoomPhase}
        />

        <RuleToggleItem
          title="Tampilkan Halaman Terima Kasih / Selesai Ujian"
          description="Menampilkan halaman ringkasan dan ucapan terima kasih setelah seluruh ronde sirkuit tuntas."
          checked={enableThankYouScreenPhase}
          onChange={setEnableThankYouScreenPhase}
        />

        <RuleToggleItem
          title="Otomatisasi Perputaran Rolling Peserta"
          description="Peserta akan dipindahkan otomatis ke stase berikutnya setelah timer pengerjaan dan istirahat selesai."
          checked={autoRollingRule}
          onChange={setAutoRollingRule}
        />

        <RuleToggleItem
          title="Penguncian Lembar Penilaian Penguji Otomatis"
          description="Mengunci formulir nilai penguji saat waktu stase berakhir untuk menghindari perubahan skor susulan."
          checked={autoLockAnswerRule}
          onChange={setAutoLockAnswerRule}
        />

        <RuleToggleItem
          title="Publikasi Nilai Otomatis ke Peserta"
          description="Mempublikasikan hasil rekapitulasi nilai dan umpan balik ke akun peserta secara otomatis begitu sesi selesai."
          checked={autoPublishResults}
          onChange={setAutoPublishResults}
        />

        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Toleransi Keterlambatan Peserta (Menit)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Waktu maksimal peserta diizinkan memasuki ruang ujian sebelum statusnya diubah menjadi diskualifikasi.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={lateToleranceMinutes}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setLateToleranceMinutes(val === "" ? "" : Number(val));
              }}
              className="w-28 rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-center bg-white"
            />
            <span className="text-xs font-semibold text-slate-600">Menit</span>
          </div>
        </div>
      </div>

      {/* Action Buttons for Tab 4 */}
      <div className="flex justify-between border-t border-slate-100 pt-4">
        {!isPublishedSession ? (
          <button
            type="button"
            onClick={() => handleSaveCurrentSection(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Save size={15} />
            Simpan Draft Sesi
          </button>
        ) : (
          <div></div>
        )}

        <button
          type="button"
          onClick={() => {
            handleSaveCurrentSection(false);
            navigate("/admin/sessions");
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
        >
          <CheckCircle2 size={16} />
          {isEdit ? "Simpan Perubahan Sesi" : "Simpan & Terbitkan Sesi OSCE"}
        </button>
      </div>
    </div>
  );
}
