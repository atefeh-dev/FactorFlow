import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
/** Small margin so content doesn't touch the paper edge on any printer/viewer. */
const MARGIN_PT = 18;

export interface ExportPdfOptions {
  /** Called before/after generation so the caller can show a loading state. */
  onStart?: () => void;
  onFinish?: () => void;
}

/**
 * Rasterizes `element` (at 2x for crisp text) and slices the result across
 * as many A4 pages as needed, then triggers a real file download — no
 * print dialog, no "choose destination: Save as PDF" step.
 *
 * We render to an image rather than asking jsPDF to lay out text directly
 * because the invoice is Persian/RTL with custom fonts and table borders;
 * a pixel-accurate screenshot of what's already on screen is far more
 * reliable than re-implementing that layout in jsPDF's own text engine.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
  options: ExportPdfOptions = {}
): Promise<void> {
  options.onStart?.();
  try {
    // Avoids a common html2canvas artifact where a web font hasn't finished
    // loading yet, so the capture silently falls back to a system font.
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      onclone: (_doc, clonedEl) => {
        // Strip the on-screen framing (card border/shadow) that only makes
        // sense when the sheet is sitting on a page background — the PDF
        // itself IS the page, so those would just look like a stray border.
        clonedEl.style.boxShadow = "none";
        clonedEl.style.border = "none";
        clonedEl.style.margin = "0";

        // Interactive, on-screen-only affordances (e.g. a "copy total"
        // button) live inside the sheet for contextual placement but
        // should never appear in the actual document.
        clonedEl.querySelectorAll<HTMLElement>(".no-export").forEach((el) => {
          el.style.display = "none";
        });
      },
    });

    const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const contentWidthPt = A4_WIDTH_PT - MARGIN_PT * 2;
    const contentHeightPt = A4_HEIGHT_PT - MARGIN_PT * 2;

    // Points-per-source-pixel once the canvas is scaled to fill the page
    // width — used to figure out how many source pixels make up one page.
    const ptPerPx = contentWidthPt / canvas.width;
    const pageHeightPx = Math.floor(contentHeightPt / ptPerPx);

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    const pageCtx = pageCanvas.getContext("2d");
    if (!pageCtx) throw new Error("2D canvas context unavailable");

    let renderedPx = 0;
    let pageIndex = 0;

    while (renderedPx < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);
      pageCanvas.height = sliceHeightPx;

      pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(
        canvas,
        0,
        renderedPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );

      const sliceDataUrl = pageCanvas.toDataURL("image/jpeg", 0.95);
      const sliceHeightPt = sliceHeightPx * ptPerPx;

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(sliceDataUrl, "JPEG", MARGIN_PT, MARGIN_PT, contentWidthPt, sliceHeightPt);

      renderedPx += sliceHeightPx;
      pageIndex += 1;
    }

    pdf.save(filename);
  } finally {
    options.onFinish?.();
  }
}
