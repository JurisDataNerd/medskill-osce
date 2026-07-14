import AdminLayout from "@/layouts/AdminLayout";

export default function ExaminersPage() {
  return (
    <AdminLayout>
      <h1 className="mb-8 text-3xl font-bold">
        Examiners
      </h1>

      <div className="rounded-2xl bg-white p-6 shadow">
        Belum ada penguji.
      </div>
    </AdminLayout>
  );
}