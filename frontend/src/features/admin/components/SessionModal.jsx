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
  const [startTime, setStartTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [stations, setStations] = useState(10);
  const [duration, setDuration] = useState(10);
  const [breakAfter, setBreakAfter] = useState(0);
  const [breakDuration, setBreakDuration] = useState(0);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      setSessionDate(initialData.session_date ?? "");
      setStartTime(initialData.start_time ?? "");
      setMaxParticipants(initialData.max_participants ?? 20);
      setStations(initialData.total_stations ?? 10);
      setDuration(initialData.station_duration_minutes ?? 10);
      setBreakAfter(initialData.break_after_rotation ?? 0);
      setBreakDuration(initialData.break_duration_minutes ?? 0);
    } else {
      setTitle("");
      setDescription("");
      setSessionDate("");
      setStartTime("");
      setMaxParticipants(20);
      setStations(10);
      setDuration(10);
      setBreakAfter(0);
      setBreakDuration(0);
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
      status: "draft",
      total_stations: Number(stations),
      station_duration_minutes: Number(duration),
      break_after_rotation: Number(breakAfter),
      break_duration_minutes: Number(breakDuration),
      current_rotation: 0,
      current_station: 0,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-3xl rounded-2xl bg-white p-8">

        <h2 className="mb-6 text-2xl font-bold">
          {initialData ? "Edit Session" : "New Session"}
        </h2>

        <form
          onSubmit={submit}
          className="grid grid-cols-2 gap-5"
        >

          <div className="col-span-2">
            <label className="mb-2 block font-medium">
              Session Name
            </label>

            <input
              className="w-full rounded-lg border p-3"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <label className="mb-2 block font-medium">
              Description
            </label>

            <textarea
              rows={3}
              className="w-full rounded-lg border p-3"
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Date
            </label>

            <input
              type="date"
              className="w-full rounded-lg border p-3"
              value={sessionDate}
              onChange={(e)=>setSessionDate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Start Time
            </label>

            <input
              type="time"
              className="w-full rounded-lg border p-3"
              value={startTime}
              onChange={(e)=>setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Max Participants
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              value={maxParticipants}
              onChange={(e)=>setMaxParticipants(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Total Stations
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              value={stations}
              onChange={(e)=>setStations(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Minutes / Station
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              value={duration}
              onChange={(e)=>setDuration(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Break Every Rotation
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              value={breakAfter}
              onChange={(e)=>setBreakAfter(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block">
              Break Duration (Minutes)
            </label>

            <input
              type="number"
              className="w-full rounded-lg border p-3"
              value={breakDuration}
              onChange={(e)=>setBreakDuration(e.target.value)}
            />
          </div>

          <div className="col-span-2 flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-6 py-3"
            >
              Cancel
            </button>

            <button
              className="rounded-xl bg-blue-600 px-6 py-3 text-white"
            >
              Save Session
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}