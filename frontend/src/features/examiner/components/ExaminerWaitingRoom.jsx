import {
  Megaphone,
  BellRing,
  X,
  Clock,
  PlayCircle,
  LogOut,
  Users,
  FileText,
  Stethoscope,
  CheckCircle2,
  FileSpreadsheet,
  ExternalLink,
  Award,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import ExaminerStationScheduleWidget from "@/features/examiner/components/ExaminerStationScheduleWidget";

export default function ExaminerWaitingRoom({
  activeBroadcast,
  setActiveBroadcast,
  activeSession,
  stationData,
  participants,
  onlineUsers,
  rubricItems,
  currentRoundNum,
  setForceLiveView,
  handleExitExaminerWaitingRoom,
  confirmModal,
  setConfirmModal,
}) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Realtime Broadcast Toast Overlay Component (Auto 5s & X Close Button) */}
      {activeBroadcast && (
        <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-indigo-500 bg-slate-900 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <Megaphone size={20} className="animate-bounce text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                  <BellRing size={12} className="text-amber-400" />
                  <span>Broadcast Admin Control Room</span>
                  <span>•</span>
                  <span>{activeBroadcast.time}</span>
                </div>
                <p className="font-bold text-xs text-slate-100 mt-1 leading-snug break-words">
                  "{activeBroadcast.message}"
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveBroadcast(null)}
              title="Tutup Pesan (Close)"
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Clean Unified Waiting Room Header */}
      <div className="rounded-3xl border border-slate-700 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5">
                <Clock size={12} className="text-amber-700" />
                WAITING ROOM PENGUJI • STANDBY STASE
              </span>
              <span className="text-xs font-bold text-blue-300">
                {activeSession.title}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Pos Penugasan #{stationData.station_number}: {stationData.case_title || stationData.title || "Kasus Medis SKDI"}
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Menunggu Admin Control Room memulai sesi ujian live. Layar akan otomatis beralih saat sesi dimulai.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setForceLiveView(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
            >
              <PlayCircle size={18} />
              Masuk Lembar Penilaian Live
            </button>
            <button
              onClick={handleExitExaminerWaitingRoom}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/20 px-4 py-3 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition shadow-2xs cursor-pointer"
            >
              <LogOut size={16} />
              Keluar Waiting Room
            </button>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lokasi & Gedung</span>
            <span className="font-extrabold text-white text-xs mt-0.5 block truncate">
              {activeSession.location_building || "Gedung Skill Lab Kedokteran"}
            </span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Durasi Stase</span>
            <span className="font-extrabold text-white text-xs mt-0.5 block">
              {activeSession.station_duration_minutes || 12} Menit per Stase
            </span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Jumlah Station Pos</span>
            <span className="font-extrabold text-white text-xs mt-0.5 block">
              {activeSession.total_stations || 6} Pos Rotasi
            </span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Peserta Terdaftar</span>
            <span className="font-extrabold text-emerald-400 text-xs mt-0.5 block">
              {participants.length} Peserta Rotasi
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Examiner Station Rotation Schedule Widget */}
      <ExaminerStationScheduleWidget
        sessionId={activeSession.id}
        stationNumber={stationData.station_number}
        activeRound={currentRoundNum}
      />

      {/* Live Presence Standby Participants & Examiners Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Daftar Peserta Mahasiswa & Penguji Standby (Realtime Presence)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pantau status kehadiran peserta dan dokter penguji yang terhubung live di ruang tunggu secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900 flex items-center gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {onlineUsers.length} Online Terhubung
            </span>
          </div>
        </div>

        {/* Online Presence Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Pengguna Terhubung di Ruang Tunggu ({onlineUsers.length}):
          </h4>

          {onlineUsers.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {onlineUsers.map((u, idx) => (
                <div
                  key={u.user_id || idx}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs hover:bg-white transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-extrabold text-sm border border-blue-200">
                      {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{u.full_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {u.role === "examiner"
                          ? `Dokter Penguji ${u.specialty ? `• ${u.specialty}` : ""}`
                          : u.role === "admin"
                          ? "Admin Control Room"
                          : `Peserta ${u.nim ? `(NIM: ${u.nim})` : ""}`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase shrink-0 ${
                      u.role === "examiner"
                        ? "bg-purple-100 text-purple-900 border border-purple-300"
                        : u.role === "admin"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    }`}
                  >
                    {u.role === "examiner" ? "Penguji" : u.role === "admin" ? "Admin" : "Standby Live"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium">
              Belum ada peserta atau penguji lain yang terhubung di ruang tunggu.
            </div>
          )}
        </div>

        {/* Enrolled Session Participants List */}
        {participants && participants.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Daftar Peserta Terdaftar Sesi Ini ({participants.length} Peserta):
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Nama Peserta</th>
                    <th className="px-4 py-3">NIM</th>
                    <th className="px-4 py-3">Stase Awalan Rotasi</th>
                    <th className="px-4 py-3">Status Presensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
                  {participants.map((p, idx) => {
                    const isUserOnline = onlineUsers.some(
                      (u) =>
                        (u.user_id && (u.user_id === p.user_id || u.user_id === p.id)) ||
                        (u.email && p.email && u.email.toLowerCase() === p.email.toLowerCase()) ||
                        (u.full_name && p.full_name && u.full_name.toLowerCase().includes(p.full_name.toLowerCase()))
                    );

                    return (
                      <tr key={p.id || idx} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-bold text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {p.full_name || p.name || p.email || `Peserta #${idx + 1}`}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{p.nim || p.user_id?.slice(0, 8) || "-"}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                            Mulai Pos #{p.starting_station_number || ((idx % 6) + 1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isUserOnline ? (
                            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-900 inline-flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              Standby Online
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 inline-flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-slate-400" />
                              Offline / Belum Masuk
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Complete Station Scenario, Instructions, Gold Standard Keys & Rubric Preview Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
                STASE #{stationData.station_number}
              </span>
              <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                {stationData.system_organ || "Kardiovaskular"} • SKDI {stationData.skdi_level || "4A"}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-2">
              <FileText size={20} className="text-blue-600" />
              Detail Soal Stase, Skenario Medis & Kunci Rubrik Penilaian
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Dokter Penguji dapat mempelajari seluruh instrumen penilaian, skenario, kunci diagnosis, resep, serta berkas penunjang secara lengkap di ruang tunggu.
            </p>
          </div>
        </div>

        {/* Skenario Kasus Medis Naratif */}
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase mb-1 flex items-center gap-1.5">
            <Stethoscope size={15} className="text-blue-600" />
            Skenario Kasus Medis Utama
          </h4>
          <p className="text-slate-700 bg-slate-50 border border-slate-200 p-4 rounded-2xl leading-relaxed text-xs font-medium">
            {stationData.scenario || "Pasien datang dengan keluhan spesifik sesuai skenario stase medis ini. Peserta diwajibkan melakukan anamnesis terarah, pemeriksaan fisik kardiovaskular / spesifik, dan penetapan diagnosis kerja."}
          </p>
        </div>

        {/* Instructions Side-by-Side */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Instruksi Peserta Ujian</h4>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700 whitespace-pre-line text-xs font-medium leading-relaxed">
              {stationData.participant_instructions || stationData.participant_instruction || "1. Lakukan anamnesis terarah.\n2. Lakukan pemeriksaan fisik sesuai standar SOP.\n3. Sampaikan diagnosis kerja & terapi."}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Instruksi Dokter Penguji (Panduan Observasi)</h4>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700 whitespace-pre-line text-xs font-medium leading-relaxed">
              {stationData.examiner_instructions || stationData.examiner_instruction || "Amati kepatuhan prosedur sterilitas tangan, ketepatan auskultasi/pemeriksaan fisik, dan penyampaian edukasi ke pasien."}
            </div>
          </div>
        </div>

        {/* Kunci Jawaban Baku Diagnosis & Resep Medis (Gold Standard) */}
        {(stationData.answer_key_diagnosis || stationData.answer_key_prescription) && (
          <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
            {stationData.answer_key_diagnosis && (
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Kunci Diagnosis Kerja (WDx) & Banding (DDx)
                </h4>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs font-medium text-emerald-950 leading-relaxed whitespace-pre-line">
                  {stationData.answer_key_diagnosis}
                </div>
              </div>
            )}

            {stationData.answer_key_prescription && (
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet size={15} className="text-blue-600" />
                  Kunci Jawaban Resep Medis Baku
                </h4>
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs font-medium text-blue-950 leading-relaxed font-mono whitespace-pre-line">
                  {stationData.answer_key_prescription}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Berkas Penunjang (Auxiliary Exam Configs) */}
        {(() => {
          const auxConfigs = stationData.station_auxiliary_configs || stationData.auxiliary_exam_configs || stationData.auxiliary_files || [];
          return (
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase mb-1 flex items-center justify-between">
                <span>Berkas Penunjang Tambahan (Radiologi / EKG / Lab)</span>
                <span className="text-blue-600 text-[11px] font-semibold">
                  {auxConfigs.length} Berkas Terdaftar
                </span>
              </h4>

              {auxConfigs.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {auxConfigs.map((aux, aIdx) => {
                    const imgUrl = aux.image_url || aux.imageUrl || aux.file_url;
                    const reportNote = aux.report_text || aux.reportText;
                    return (
                      <div key={aIdx} className="rounded-2xl bg-blue-50/80 border border-blue-200 p-3 text-xs space-y-1.5 max-w-sm flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-blue-950">{aux.name || aux.title || "Berkas Penunjang"}</span>
                          <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-extrabold uppercase">{aux.category || "Radiologi"}</span>
                        </div>
                        {reportNote && (
                          <p className="text-[11px] text-slate-700 font-medium leading-relaxed">Catatan: {reportNote}</p>
                        )}
                        {imgUrl && (
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700 hover:underline mt-1 bg-white border border-blue-200 px-2.5 py-1 rounded-lg shadow-2xs"
                          >
                            <ExternalLink size={13} className="text-blue-600" />
                            <span>Lihat Lampiran Hasil / Drive</span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Belum ada berkas penunjang yang dikonfigurasi untuk stase ini.</p>
              )}
            </div>
          );
        })()}

        {/* Complete Rubric Items List with 4-Level Descriptors */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award size={16} className="text-blue-600" />
              Checklist Rubrik Penilaian SKDI ({rubricItems.length} Item Rubrik):
            </span>
            <span className="text-blue-600 text-[11px] font-semibold">
              Skor 0 - 3 Standar AIPKI
            </span>
          </h4>

          {rubricItems.length > 0 ? (
            <div className="space-y-3">
              {rubricItems.map((item, idx) => {
                const descObj = typeof item.descriptors === "object" && item.descriptors ? item.descriptors : {};
                const s0 = item.description_score_0 || descObj.score_0 || descObj[0] || descObj["0"] || "Tidak dilakukan / Salah total";
                const s1 = item.description_score_1 || descObj.score_1 || descObj[1] || descObj["1"] || "Minimal / Sebagian salah";
                const s2 = item.description_score_2 || descObj.score_2 || descObj[2] || descObj["2"] || "Cukup / Memadai";
                const s3 = item.description_score_3 || descObj.score_3 || descObj[3] || descObj["3"] || "Sempurna & Lengkap";

                return (
                  <div key={item.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 font-extrabold text-white text-xs">
                          #{idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">
                          {item.question || item.title || item.name}
                        </h5>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2.5 py-0.5 border border-blue-200">
                          Bobot x{item.weight || 1}
                        </span>
                        <span className="rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2.5 py-0.5 border border-emerald-200">
                          Maks {item.max_points || 3} Poin
                        </span>
                      </div>
                    </div>

                    {(item.answer_key || item.description) && (
                      <p className="text-[11px] font-medium text-emerald-900 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                        <strong>Kunci Jawaban:</strong> {item.answer_key || item.description}
                      </p>
                    )}

                    {/* 4-Level Descriptors Grid (0-3) */}
                    <div className="grid gap-2 sm:grid-cols-4 text-[11px] pt-1">
                      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-2 text-rose-900">
                        <span className="font-extrabold text-[10px] uppercase block text-rose-700">Skor 0</span>
                        <p className="mt-0.5 leading-snug">{s0}</p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2 text-amber-900">
                        <span className="font-extrabold text-[10px] uppercase block text-amber-700">Skor 1</span>
                        <p className="mt-0.5 leading-snug">{s1}</p>
                      </div>
                      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-2 text-blue-900">
                        <span className="font-extrabold text-[10px] uppercase block text-blue-700">Skor 2</span>
                        <p className="mt-0.5 leading-snug">{s2}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 text-emerald-900">
                        <span className="font-extrabold text-[10px] uppercase block text-emerald-700">Skor 3</span>
                        <p className="mt-0.5 leading-snug">{s3}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Belum ada item rubrik penilaian yang tersimpan pada stase ini.</p>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        isAlert={confirmModal.isAlert}
      />
    </div>
  );
}
