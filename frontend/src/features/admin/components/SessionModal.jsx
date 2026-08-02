import { useEffect, useState } from "react";

export default function SessionModal({
  open,
  onClose,
  onSave,
  initialData = null,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [maxParticipants, setMaxParticipants] = useState(6);
  const [totalStations, setTotalStations] = useState(6);
  const [duration, setDuration] = useState(15);
  const [breakAfter, setBreakAfter] = useState(1);
  const [breakDuration, setBreakDuration] = useState(3);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      setSessionDate(initialData.session_date ?? "");
      setStartTime(initialData.start_time ?? "08:00");
      setMaxParticipants(initialData.max_participants ?? 6);
      setTotalStations(initialData.total_stations ?? 6);
      setDuration(initialData.station_duration_minutes ?? 15);
      setBreakAfter(initialData.break_after_rotation ?? 1);
      setBreakDuration(initialData.break_duration_minutes ?? 3);
    } else {
      setTitle("");
      setDescription("");
      setSessionDate("");
      setStartTime("08:00");
      setMaxParticipants(6);
      setTotalStations(6);
      setDuration(15);
      setBreakAfter(1);
      setBreakDuration(3);
    }
  }, [open, initialData]);


  if (!open) return null;

  function submit(e) {
    e.preventDefault();

    onSave({
      title,
      description,
      session_date: sessionDate,
      start_time: startTime,
      max_participants: Number(maxParticipants),
      total_stations: Number(totalStations),
      total_examiners: Number(totalStations),
      station_duration_minutes: Number(duration),
      break_after_rotation: Number(breakAfter),
      break_duration_minutes: Number(breakDuration),
      status: "draft",
      current_rotation: 0,
      current_station: 0,
    });
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8">

        <h2 className="mb-6 text-2xl font-bold">
          {initialData ? "Edit Sesi OSCE" : "Tambah Sesi OSCE"}
        </h2>

        <form
          onSubmit={submit}
          className="grid grid-cols-2 gap-5"
        >

          <div className="col-span-2">
            <label className="mb-2 block font-medium">
              Nama Sesi
            </label>

            <input
              className="w-full rounded-lg border p-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <label className="mb-2 block font-medium">
              Deskripsi
            </label>

            <textarea
              rows={3}
              className="w-full rounded-lg border p-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Tanggal
            </label>

            <input
              type="date"
              className="w-full rounded-lg border p-3"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Jam Mulai
            </label>

            <input
              type="time"
              className="w-full rounded-lg border p-3"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Maksimal Peserta
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Durasi per Stase (menit)
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Istirahat setiap rotasi ke-
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              value={breakAfter}
              onChange={(e) => setBreakAfter(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Lama Istirahat (menit)
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              value={breakDuration}
              onChange={(e) => setBreakDuration(e.target.value)}
            />
          </div>

          <div className="col-span-2 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-6 py-3"
            >
              Batal
            </button>

            <button
              className="rounded-xl bg-blue-600 px-6 py-3 text-white"
            >
              Simpan Sesi
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}