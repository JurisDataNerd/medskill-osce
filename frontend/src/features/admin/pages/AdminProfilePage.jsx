import AdminLayout from "@/layouts/AdminLayout";
import UserProfilePage from "@/features/profile/pages/UserProfilePage";

export default function AdminProfilePage() {
  return (
    <AdminLayout>
      <UserProfilePage roleType="admin" />
    </AdminLayout>
  );
}
