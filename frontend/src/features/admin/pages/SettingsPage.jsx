import AdminLayout from "@/layouts/AdminLayout";
import ComingSoon from "@/components/ComingSoon";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <ComingSoon
        title="Pengaturan Sistem & Konfigurasi Ujian"
        description="Fitur pengaturan profil institusi, integrasi server Supabase, manajemen lisensi medis, dan preferensi notifikasi email sedang dalam tahap pengembangan."
        backPath="/admin"
      />
    </AdminLayout>
  );
}
