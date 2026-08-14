import ParticipantNavbar from "@/features/participant/components/ParticipantNavbar";
import UserProfilePage from "@/features/profile/pages/UserProfilePage";

export default function ParticipantProfilePage() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-12">
      <ParticipantNavbar />
      <main className="mx-auto max-w-6xl p-6">
        <UserProfilePage roleType="participant" />
      </main>
    </div>
  );
}
