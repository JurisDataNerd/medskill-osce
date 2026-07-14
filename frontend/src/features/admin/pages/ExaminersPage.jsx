import { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { supabase } from "@/supabase/client";
import { Mail, University } from "lucide-react";

export default function ExaminersPage() {
  const [examiners, setExaminers] = useState([]);

  useEffect(() => {
    loadExaminers();

    const channel = supabase
      .channel("profiles-online")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          loadExaminers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadExaminers() {
    const [{ data: mentors, error: mentorError }, { data: profiles, error: profileError }] =
      await Promise.all([
        supabase
          .from("mentors")
          .select(`
            id,
            name,
            university,
            email,
            img_url,
            is_active
          `)
          .order("name"),

        supabase
          .from("profiles")
          .select(`
            mentor_id,
            is_online,
            last_seen,
            role
          `)
          .eq("role", "examiner"),
      ]);

    if (mentorError) {
      console.error(mentorError);
      return;
    }

    if (profileError) {
      console.error(profileError);
      return;
    }

    const merged = mentors.map((mentor) => {
      const profile = profiles.find(
        (p) => p.mentor_id === mentor.id
      );

      return {
        ...mentor,
        is_online: profile?.is_online ?? false,
        last_seen: profile?.last_seen ?? null,
      };
    });

    setExaminers(merged);
  }

  function formatLastSeen(lastSeen) {
    if (!lastSeen) return "Belum Pernah Login";

    return new Date(lastSeen).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Penguji OSCE
          </h1>

          <p className="mt-1 text-slate-500">
            Daftar seluruh penguji yang terdaftar pada sistem.
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 px-5 py-3">
          <p className="text-sm text-slate-500">
            Total Penguji
          </p>

          <p className="text-3xl font-bold text-blue-700">
            {examiners.length}
          </p>
        </div>
      </div>

      {examiners.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          Belum ada penguji.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {examiners.map((examiner) => (
            <div
              key={examiner.id}
              className="overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative">
                <img
                  src={examiner.img_url}
                  alt={examiner.name}
                  className="h-64 w-full object-cover"
                />

                <div className="absolute right-3 top-3">
                  {examiner.is_online ? (
                    <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
                      🟢 Online
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-white shadow">
                      ⚪ Offline
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-5">
                <h2 className="text-lg font-bold leading-snug">
                  {examiner.name}
                </h2>

                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <University
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{examiner.university}</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <Mail
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <span className="break-all">
                    {examiner.email}
                  </span>
                </div>

                <div className="border-t pt-3">
                  {examiner.is_online ? (
                    <>
                      <p className="text-xs text-slate-500">
                        Status
                      </p>

                      <p className="font-semibold text-green-600">
                        Sedang Login
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500">
                        Last Seen
                      </p>

                      <p className="font-medium text-slate-700">
                        {formatLastSeen(examiner.last_seen)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}