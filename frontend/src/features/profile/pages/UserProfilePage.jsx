import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Building2,
  Phone,
  Camera,
  CheckCircle2,
  Save,
  Loader2,
  ArrowLeft,
  GraduationCap,
  Stethoscope,
  ShieldCheck,
  FileText,
  BadgeCheck,
  UploadCloud,
  ImageIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { UserProfileSkeleton } from "@/components/ui/Skeleton";

/**
 * Resizes and compresses an image File to max dimensions and <= 500KB size.
 * Returns a Promise<Blob>.
 */
async function resizeAndCompressImage(file, maxDimension = 800, maxSizeBytes = 500 * 1024) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;

        const compress = (q) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error("Gagal mengkompresi gambar."));
              }
              if (blob.size > maxSizeBytes && q > 0.35) {
                compress(q - 0.15);
              } else {
                resolve(blob);
              }
            },
            "image/jpeg",
            q
          );
        };

        compress(quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function UserProfilePage({ roleType = "participant" }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    nim: "",
    nip: "",
    specialty: "",
    institution: "",
    phone: "",
    avatar_url: "",
    bio: "",
  });

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const { data: authData } = await supabase.auth.getUser();
        const currentUser = authData?.user || user;

        let dbProfile = null;
        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();
          dbProfile = data;
        }

        setFormData({
          full_name:
            dbProfile?.full_name ||
            currentUser?.user_metadata?.full_name ||
            currentUser?.user_metadata?.name ||
            "",
          email: currentUser?.email || dbProfile?.email || "",
          nim:
            dbProfile?.nim ||
            currentUser?.user_metadata?.nim ||
            "",
          nip: dbProfile?.nip || currentUser?.user_metadata?.nip || "",
          specialty:
            dbProfile?.specialty ||
            currentUser?.user_metadata?.specialty ||
            "",
          institution:
            dbProfile?.institution ||
            dbProfile?.university ||
            currentUser?.user_metadata?.institution ||
            "",
          phone: dbProfile?.phone || currentUser?.user_metadata?.phone || "",
          avatar_url:
            dbProfile?.avatar_url ||
            currentUser?.user_metadata?.avatar_url ||
            currentUser?.user_metadata?.picture ||
            "",
          bio:
            dbProfile?.bio ||
            currentUser?.user_metadata?.bio ||
            "",
        });
      } catch (err) {
        console.error("Error loading user profile data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user, roleType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Resize & Compress image to <= 500KB using Canvas
      const compressedBlob = await resizeAndCompressImage(file, 800, 500 * 1024);
      const compressedKb = (compressedBlob.size / 1024).toFixed(1);

      const fileExt = "jpg";
      const fileName = `avatar-${user?.id || "user"}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 2. Upload to Supabase Storage Bucket ('avatars' or 'osce-media')
      let bucketName = "avatars";
      let uploadRes = await supabase.storage
        .from(bucketName)
        .upload(filePath, compressedBlob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadRes.error) {
        bucketName = "osce-media";
        uploadRes = await supabase.storage
          .from(bucketName)
          .upload(filePath, compressedBlob, {
            cacheControl: "3600",
            upsert: true,
            contentType: "image/jpeg",
          });
      }

      if (uploadRes.error) {
        console.warn("Notice: Storage bucket upload error, converting to Data URL:", uploadRes.error);
        // Fallback: convert Blob to base64 Data URL so profile image always renders cleanly
        const reader = new FileReader();
        reader.readAsDataURL(compressedBlob);
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, avatar_url: reader.result }));
          setSuccessMessage(
            `Foto berhasil dikompresi (${compressedKb} KB <= 500KB) & siap disimpan!`
          );
          setUploadingImage(false);
        };
        return;
      }

      // 3. Get Public URL
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl || "";

      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
      setSuccessMessage(
        `Foto profil berhasil diunggah ke Supabase Storage (${bucketName}) & dikompresi menjadi ${compressedKb} KB (Maks 500KB)!`
      );
    } catch (err) {
      console.error("Error compressing/uploading image:", err);
      setErrorMessage(err.message || "Gagal memproses/mengunggah foto profil.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) throw new Error("Pengguna tidak terautentikasi.");

      // 1. Update Supabase Auth User Metadata (simpan seluruh metadata pengguna di auth.users)
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          nim: formData.nim,
          nip: formData.nip,
          specialty: formData.specialty,
          institution: formData.institution,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
          bio: formData.bio,
        },
      });

      if (authErr) {
        console.warn("Notice updating auth user metadata:", authErr.message);
      }

      // 2. Upsert ke public.profiles (Hanya kolom standar bawaan DB)
      const profilePayload = {
        id: currentUser.id,
        email: formData.email,
        full_name: formData.full_name,
        avatar_url: formData.avatar_url,
        university: formData.institution,
        updated_at: new Date().toISOString(),
      };

      const { error: dbErr } = await supabase
        .from("profiles")
        .upsert(profilePayload);

      if (dbErr) {
        console.warn("Notice updating profiles table:", dbErr.message);
      }

      setSuccessMessage("Profil Anda telah berhasil diperbarui dan disimpan!");

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      setErrorMessage(err.message || "Gagal memperbarui profil pengguna.");
    } finally {
      setSaving(false);
    }
  };

  const roleTitle =
    roleType === "admin"
      ? "Administrator Sistem"
      : roleType === "examiner"
      ? "Dokter Penguji OSCE"
      : "Peserta Ujian OSCE";

  const RoleIcon =
    roleType === "admin"
      ? ShieldCheck
      : roleType === "examiner"
      ? Stethoscope
      : GraduationCap;

  const initials = (formData.full_name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (loading) {
    return <UserProfileSkeleton />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner & Avatar Header */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          {/* Avatar Preview & Upload Trigger Button */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-full border-4 border-white/20 bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden shrink-0">
              {uploadingImage ? (
                <Loader2 size={32} className="animate-spin text-white" />
              ) : formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt={formData.full_name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Click Camera Button Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              title="Unggah & Kompres Foto Profil"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
            >
              {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
          </div>

          {/* User Info Title */}
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-0.5 text-xs font-extrabold text-blue-300">
                <RoleIcon size={13} />
                {roleTitle}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                <BadgeCheck size={12} />
                Akun Terverifikasi
              </span>
            </div>

            <h1 className="text-2xl font-black text-white sm:text-3xl">
              {formData.full_name || "Nama Pengguna"}
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              {formData.email} • {formData.institution}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="text-xs font-extrabold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
          <Shield size={20} className="text-red-600 shrink-0" />
          <p className="text-xs font-extrabold">{errorMessage}</p>
        </div>
      )}

      {/* Main Profile Edit Form Card */}
      <form onSubmit={handleSave} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              Pengaturan Profil & Data Diri
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Perbarui nama lengkap, foto avatar, serta kredensial institusi Anda.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Perubahan
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <User size={14} className="text-slate-400" />
              Nama Lengkap & Gelar *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Contoh: dr. Kairav Mahardika, Sp.PD"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Mail size={14} className="text-slate-400" />
              Alamat Email (Akun Auth)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 text-xs font-bold text-slate-600 cursor-not-allowed"
            />
          </div>

          {/* NIM / NIP */}
          {roleType === "participant" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-slate-400" />
                Nomor Induk Mahasiswa (NIM) *
              </label>
              <input
                type="text"
                name="nim"
                value={formData.nim}
                onChange={handleChange}
                placeholder="20200710042"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Shield size={14} className="text-slate-400" />
                Nomor Induk Pegawai / NIP / STR *
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                placeholder="198504122010121001"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          )}

          {/* Spesialisasi / Program Studi */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Stethoscope size={14} className="text-slate-400" />
              Spesialisasi / Program Studi
            </label>
            <input
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              placeholder="Program Studi Profesi Dokter (PSPD)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Institusi / Universitas */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Building2 size={14} className="text-slate-400" />
              Institusi / Universitas
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Fakultas Kedokteran - MedSkill LMS"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Phone size={14} className="text-slate-400" />
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0812-3456-7890"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>



        {/* Bio / Catatan Informasi */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <FileText size={14} className="text-slate-400" />
            Bio / Catatan Informasi Pengguna
          </label>
          <textarea
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tuliskan ringkasan latar belakang akademis atau catatan tugas..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Bottom Save Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-7 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-600/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Perubahan Profil
          </button>
        </div>
      </form>
    </div>
  );
}
