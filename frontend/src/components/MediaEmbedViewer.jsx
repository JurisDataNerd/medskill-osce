import { useState } from "react";
import { ExternalLink, FileSpreadsheet, Image as ImageIcon, Eye, AlertCircle } from "lucide-react";

/**
 * Utility to convert Google Drive or external file URLs into iframe embeddable preview URLs
 */
export function getEmbeddableUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let url = rawUrl.trim();

  // Match Google Drive file IDs
  const driveFileRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/(?:[a-z]+\/d\/))([a-zA-Z0-9_-]+)/i;
  const match = url.match(driveFileRegex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // Handle Google Docs / Sheets / Slides preview
  if (url.includes("docs.google.com") && !url.includes("preview") && !url.includes("embedded=true")) {
    return url.replace(/\/edit.*$/, "/preview").replace(/\/view.*$/, "/preview");
  }

  // Handle standard PDF or document links via Google Viewer embed
  if (url.match(/\.pdf($|\?)/i)) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }

  return url;
}

/**
 * Universal Iframe & Media Viewer supporting Google Drive, Images, PDFs, and External Links
 */
export default function MediaEmbedViewer({
  src,
  alt = "Berkas Penunjang",
  height = "480px",
  className = "",
  zoomLevel = 1,
}) {
  const [loadError, setLoadError] = useState(false);
  const [useIframe, setUseIframe] = useState(false);

  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 text-slate-400 rounded-2xl text-center space-y-2">
        <AlertCircle size={32} className="text-amber-400" />
        <p className="text-xs font-semibold">Tautan berkas atau gambar penunjang belum tersedia.</p>
      </div>
    );
  }

  const cleanSrc = src.trim();
  const embedUrl = getEmbeddableUrl(cleanSrc);
  const isDriveUrl = cleanSrc.includes("drive.google.com") || cleanSrc.includes("docs.google.com");
  const isPdfOrDoc = cleanSrc.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)($|\?)/i);

  // If it's a Drive URL or PDF/Doc, iframe is required
  const isIframeMode = isDriveUrl || isPdfOrDoc || useIframe;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl space-y-2 ${className}`}>
      {/* Viewer Header / Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={15} className="text-emerald-400" />
          <span className="truncate max-w-xs">{alt}</span>
          {isDriveUrl && (
            <span className="rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] px-2 py-0.5 font-bold">
              Google Drive Embed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isDriveUrl && !isPdfOrDoc && (
            <button
              onClick={() => setUseIframe(!useIframe)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              {isIframeMode ? <ImageIcon size={13} /> : <Eye size={13} />}
              {isIframeMode ? "Mode Gambar Direct" : "Mode Frame Iframe"}
            </button>
          )}

          <a
            href={cleanSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-blue-300 hover:bg-slate-700 hover:text-white transition"
          >
            <ExternalLink size={13} />
            Buka di Tab Baru
          </a>
        </div>
      </div>

      {/* Main Render Area */}
      <div
        style={{ height }}
        className="relative w-full overflow-hidden bg-slate-950 flex items-center justify-center p-2"
      >
        {isIframeMode ? (
          <iframe
            src={embedUrl}
            title={alt}
            className="w-full h-full border-0 rounded-xl bg-white shadow-inner"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            onError={() => setLoadError(true)}
          />
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle size={32} className="text-amber-400" />
            <p className="text-xs text-slate-300 font-medium">
              Gagal memuat pratinjau gambar secara langsung.
            </p>
            <a
              href={cleanSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              <ExternalLink size={14} />
              Buka Berkas di Tab Baru
            </a>
          </div>
        ) : (
          <div className="w-full h-full overflow-auto flex items-center justify-center">
            <img
              src={cleanSrc}
              alt={alt}
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-200"
              onError={() => {
                // If direct image loading fails, attempt iframe or show fallback
                if (!useIframe) setUseIframe(true);
                else setLoadError(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
