/**
 * Utility to format and parse Diagnosis Kerja (WDx) and Diagnosis Banding (DDx)
 * ensuring clean synchronization across Bank Soal, Kelola Sesi OSCE, and Examiner screens.
 */

export function formatDiagnosisText(wdx = "", ddxList = []) {
  const cleanWdx = (wdx || "").trim();
  const cleanDdx = Array.isArray(ddxList)
    ? ddxList.map((s) => (s || "").trim()).filter(Boolean)
    : [];

  const lines = [];
  if (cleanWdx) {
    lines.push(`WDx: ${cleanWdx}`);
  }
  cleanDdx.forEach((ddx, idx) => {
    lines.push(`DDx ${idx + 1}: ${ddx}`);
  });

  return lines.join("\n") || cleanWdx;
}

export function parseDiagnosisText(raw) {
  if (!raw || typeof raw !== "string") {
    return { wdx: "", ddxList: ["", ""] };
  }

  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  let extractedWdx = "";
  const extractedDdx = [];

  lines.forEach((line) => {
    // Clean prefix like "WDx:", "WDx (Diagnosis Kerja Utama):", "(Diagnosis Kerja Utama):"
    if (/^(wdx|\(wdx\)|diagnosis kerja)/i.test(line)) {
      let clean = line
        .replace(/^wdx\s*\([^)]*\)\s*:\s*/i, "")
        .replace(/^\([^)]*\)\s*:\s*/i, "")
        .replace(/^(wdx|diagnosis kerja utama|diagnosis kerja|kerja)[\s:]*/i, "")
        .trim();
      if (clean && !extractedWdx) extractedWdx = clean;
    }
    // Clean prefix like "DDx 1:", "DDx 1 (Diagnosis Banding 1):", "(Diagnosis Banding 1):"
    else if (/^(ddx|\(ddx\)|diagnosis banding)/i.test(line)) {
      let clean = line
        .replace(/^ddx\s*\d*\s*\([^)]*\)\s*:\s*/i, "")
        .replace(/^\([^)]*\)\s*:\s*/i, "")
        .replace(/^(ddx\s*\d*|diagnosis banding\s*\d*|banding\s*\d*)[\s:]*/i, "")
        .trim();
      if (clean) extractedDdx.push(clean);
    }
  });

  // Fallback: If no WDx label was matched, use first line if it's not a DDx line
  if (!extractedWdx && lines.length > 0) {
    if (!/^(ddx|\(ddx\)|diagnosis banding)/i.test(lines[0])) {
      extractedWdx = lines[0]
        .replace(/^wdx\s*\([^)]*\)\s*:\s*/i, "")
        .replace(/^\([^)]*\)\s*:\s*/i, "")
        .replace(/^(wdx|diagnosis kerja utama|diagnosis kerja|kerja)[\s:]*/i, "")
        .trim();
    }
  }

  return {
    wdx: extractedWdx,
    ddxList: extractedDdx.length > 0 ? extractedDdx : ["", ""],
  };
}
