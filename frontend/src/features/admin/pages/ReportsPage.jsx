import AdminLayout from "@/layouts/AdminLayout";
import ComingSoon from "@/components/ComingSoon";

export default function ReportsPage() {
  return (
    <AdminLayout>
      <ComingSoon
        title="Laporan & Ekspor Rekapitulasi OSCE"
        description="Fitur pencetakan laporan PDF otomatis, statistik analitik per stase, dan pengiriman rekapitulasi via email sedang dalam pengembangan."
        backPath="/admin"
      />
    </AdminLayout>
  );
}