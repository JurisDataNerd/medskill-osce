import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
  Building2,
  Sliders,
  Clock,
  Database,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Bell,
  Sparkles,
  ShieldCheck,
  Server,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("institution"); // institution, nbl, rotation, server, notification
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [settings, setSettings] = useState({
    institution_name: "Fakultas Kedokteran & Kesehatan - Universitas Indonesia",
    accreditation: "LAM-PTKes Unggul (A)",
    institution_code: "FK-UI-2026",
    address: "Jl. Salemba Raya No. 6, Jakarta Pusat, DKI Jakarta",
    committee_lead: "Prof. dr. Ari Fahrial Syam, Sp.PD-KGEH, MMB",
    logo_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=150&auto=format&fit=crop&q=80",
    
    // NBL Settings
    nbl_method: "borderline_regression",
    default_nbl_cutoff: 72.4,
    min_station_score: 60.0,
    mandatory_safety_pass: true,

    // Rotation Settings
    default_station_minutes: 12,
    default_break_minutes: 3,
    warning_bell_offset_minutes: 2,
    audio_bell_enabled: true,

    // Server Config
    supabase_project_ref: "djigelqahkzfmwvpncvr",
    supabase_schema: "osce",
    realtime_channel_status: "connected",

    // Notification Config
    auto_email_results: true,
    smtp_host: "smtp.medskill-lms.ac.id",
    smtp_port: 587,
    wa_notification_webhook: "https://api.whatsapp.com/v1/osce-notifications",
  });

  // Load persistent settings from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("medskill_osce_settings");
    if (saved) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }
  }, []);

  function handleSaveSettings(e) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("medskill_osce_settings", JSON.stringify(settings));
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  }

  function playTestAudioBell(type) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === "start") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === "warning") {
        [0, 0.25].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(660, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.18);
        });
      } else if (type === "siren") {
        [0, 0.3, 0.6].forEach((delay, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(idx === 2 ? 987.77 : 523.25, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.22);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AdminLayout>
      {/* Toast Save Notification */}
      {saveSuccess && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-400 bg-emerald-500 p-4 text-white shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-white animate-bounce" />
            <span className="text-xs font-black uppercase tracking-wider">
              Pengaturan Sistem Institusi Berhasil Diperbarui & Disimpan!
            </span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Pengaturan Sistem & Konfigurasi Institusi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Kelola profil institusi kedokteran, standar nilai NBL, durasi sirkuit, dan koneksi server Supabase.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Simpan Perubahan
        </button>
      </div>

      {/* Tabs Header */}
      <div className="mb-6 flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("institution")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === "institution"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Building2 size={16} />
          Profil Institusi
        </button>
        <button
          onClick={() => setActiveTab("nbl")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === "nbl"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sliders size={16} />
          Standar Nilai (NBL)
        </button>
        <button
          onClick={() => setActiveTab("rotation")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === "rotation"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Clock size={16} />
          Durasi & Sinyal Bel
        </button>
        <button
          onClick={() => setActiveTab("server")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === "server"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Database size={16} />
          Server Supabase Database
        </button>
        <button
          onClick={() => setActiveTab("notification")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === "notification"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Mail size={16} />
          Notifikasi Email & WA
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* TAB 1: PROFIL INSTITUSI */}
        {activeTab === "institution" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 size={18} className="text-blue-600" />
              Identitas Institusi Kedokteran & Panitia Ujian
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Institusi / Fakultas
                </label>
                <input
                  type="text"
                  value={settings.institution_name}
                  onChange={(e) => setSettings({ ...settings, institution_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Akreditasi Institusi
                </label>
                <input
                  type="text"
                  value={settings.accreditation}
                  onChange={(e) => setSettings({ ...settings, accreditation: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Lembaga Institusi
                </label>
                <input
                  type="text"
                  value={settings.institution_code}
                  onChange={(e) => setSettings({ ...settings, institution_code: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dekan / Ketua Panitia Ujian OSCE
                </label>
                <input
                  type="text"
                  value={settings.committee_lead}
                  onChange={(e) => setSettings({ ...settings, committee_lead: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Kampus / RS Pendidikan
                </label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STANDAR NILAI (NBL) */}
        {activeTab === "nbl" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders size={18} className="text-purple-600" />
              Konfigurasi Standar Nilai Batas Lulus (NBL)
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Metode Standarisasi NBL Default
                </label>
                <select
                  value={settings.nbl_method}
                  onChange={(e) => setSettings({ ...settings, nbl_method: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="borderline_regression">Borderline Regression Method (Standar Nasional KIPDI)</option>
                  <option value="angoff">Modified Angoff Method</option>
                  <option value="fixed">Fixed Cutoff Standard (70.0 Pts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Angkat Batas NBL Default (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.default_nbl_cutoff}
                  onChange={(e) => setSettings({ ...settings, default_nbl_cutoff: parseFloat(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Mandatory Safety Item Pass (Resusitasi & Sterilitas)</h4>
                  <p className="text-[11px] text-slate-500">Jika diaktifkan, peserta wajib lulus poin keselamatan kritis di stase gawat darurat.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.mandatory_safety_pass}
                  onChange={(e) => setSettings({ ...settings, mandatory_safety_pass: e.target.checked })}
                  className="h-4 w-4 rounded-md text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DURASI & BEL AUDIO */}
        {activeTab === "rotation" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock size={18} className="text-emerald-600" />
              Durasi Stase & Pengujian Sinyal Bel Audio
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Durasi Stase Ujian Default (Menit)
                </label>
                <input
                  type="number"
                  value={settings.default_station_minutes}
                  onChange={(e) => setSettings({ ...settings, default_station_minutes: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Durasi Jeda Istirahat / Break (Menit)
                </label>
                <input
                  type="number"
                  value={settings.default_break_minutes}
                  onChange={(e) => setSettings({ ...settings, default_break_minutes: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peringatan Waktu Tersisa (Menit)
                </label>
                <input
                  type="number"
                  value={settings.warning_bell_offset_minutes}
                  onChange={(e) => setSettings({ ...settings, warning_bell_offset_minutes: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Test Audio Synthesizer Controls */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Volume2 size={16} className="text-indigo-600" />
                Uji Sinyal Bel Audio Synthesizer Web Audio API:
              </h4>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => playTestAudioBell("start")}
                  className="rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-xs font-bold text-indigo-900 hover:bg-indigo-50 transition flex items-center gap-1.5"
                >
                  <Bell size={14} className="text-indigo-600" />
                  Bel 1x (Mulai Stase / Reading Time)
                </button>
                <button
                  type="button"
                  onClick={() => playTestAudioBell("warning")}
                  className="rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 transition flex items-center gap-1.5"
                >
                  <AlertCircle size={14} className="text-amber-600" />
                  Bel 2x (Peringatan 2 Menit Tersisa)
                </button>
                <button
                  type="button"
                  onClick={() => playTestAudioBell("siren")}
                  className="rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-900 hover:bg-rose-50 transition flex items-center gap-1.5"
                >
                  <AlertCircle size={14} className="text-rose-600" />
                  Bel 3x (Selesai & Rotasi Stase)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUPABASE DATABASE */}
        {activeTab === "server" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Database size={18} className="text-blue-600" />
              Status Koneksi Server Supabase PostgreSQL
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Status Supabase Realtime</span>
                <span className="text-lg font-black text-emerald-950 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  CONNECTED & ACTIVE
                </span>
                <span className="text-[11px] text-emerald-800 block font-mono">Reference: djigelqahkzfmwvpncvr</span>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Target Database Schema</span>
                <span className="text-lg font-black text-blue-950 font-mono">osce</span>
                <span className="text-[11px] text-blue-800 block">Isolasi Tabel Simulation Active</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFIKASI EMAIL */}
        {activeTab === "notification" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Mail size={18} className="text-purple-600" />
              Integrasi Email & WhatsApp Notification Webhook
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kirim Email Otomatis Ke Peserta Saat Hasil Dipublikasi</h4>
                  <p className="text-[11px] text-slate-500">Kirim lembar hasil nilai transkrip dan berita acara ke email mahasiswa.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.auto_email_results}
                  onChange={(e) => setSettings({ ...settings, auto_email_results: e.target.checked })}
                  className="h-4 w-4 rounded-md text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Broadcast Webhook URL
                </label>
                <input
                  type="text"
                  value={settings.wa_notification_webhook}
                  onChange={(e) => setSettings({ ...settings, wa_notification_webhook: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </AdminLayout>
  );
}
