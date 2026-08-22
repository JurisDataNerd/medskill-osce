import html2pdf from "html2pdf.js";

/**
 * Generate and download a PDF file from an HTML element using html2pdf.js
 * @param {HTMLElement} element - The DOM element to convert to PDF
 * @param {Object} options - Customization options (filename, orientation, etc.)
 * @returns {Promise<void>}
 */
export async function exportElementToPdf(element, options = {}) {
  if (!element) {
    throw new Error("Target element for PDF export was not found.");
  }

  const {
    filename = "Laporan_Hasil_OSCE.pdf",
    format = "a4",
    orientation = "portrait",
    margin = [8, 8, 8, 8], // [top, left, bottom, right] in mm
  } = options;

  const opt = {
    margin: margin,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2, // 2x resolution for crisp text & borders
      useCORS: true,
      logging: false,
      letterRendering: true,
    },
    jsPDF: {
      unit: "mm",
      format: format,
      orientation: orientation,
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (err) {
    console.error("html2pdf generation error, falling back to window.print():", err);
    window.print();
    return false;
  }
}

/**
 * Trigger clean browser print dialog with styled print media
 */
export function printElementDirectly() {
  window.print();
}
