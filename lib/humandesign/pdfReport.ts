// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/pdfReport.ts
// =====================================================

import {
  TYPE_CONTENT_FIELDS,
  AUTHORITY_CONTENT_FIELDS,
  PROFILE_CONTENT_FIELDS,
} from '@/lib/humandesign/data/entityContentSchemas';

interface BuildPdfReportParams {
  name: string;
  typeLabel: string;
  authorityLabel: string;
  profile: string;
  signature: string;
  notSelf: string;
  typeContent: Record<string, string> | null;
  authorityContent: Record<string, string> | null;
  profileContent: Record<string, string> | null;
  bodygraphImageDataUrl: string | null;
  bodygraphImageAspect: number;
}

export async function buildAndDownloadPdfReport(params: BuildPdfReportParams) {
  const { jsPDF } = await import('jspdf');
  const {
    name,
    typeLabel,
    authorityLabel,
    profile,
    signature,
    notSelf,
    typeContent,
    authorityContent,
    profileContent,
    bodygraphImageDataUrl,
    bodygraphImageAspect,
  } = params;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function ensureSpace(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function addMainTitle(text: string) {
    ensureSpace(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text(text, margin, y);
    y += 26;
  }

  function addSubTitle(text: string) {
    ensureSpace(20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(text, margin, y);
    y += 20;
  }

  function addSectionHeading(text: string) {
    ensureSpace(28);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(180, 100, 20);
    doc.text(text, margin, y);
    y += 6;
    doc.setDrawColor(220, 170, 90);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  }

  function addFieldLabel(text: string) {
    ensureSpace(16);
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(text, margin, y);
    y += 14;
  }

  function addParagraph(text: string) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(60, 60, 60);
    const lines: string[] = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      ensureSpace(14);
      doc.text(line, margin, y);
      y += 14;
    }
    y += 8;
  }

  function addFieldSection(
    fields: { key: string; label: string }[],
    content: Record<string, string> | null
  ) {
    if (!content) {
      addParagraph('Konten belum tersedia untuk entitas ini.');
      return;
    }
    for (const field of fields) {
      const value = content[field.key];
      if (!value) continue;
      addFieldLabel(field.label);
      addParagraph(value);
    }
  }

  // ---- Cover / Hero section ----
  addMainTitle('Laporan Human Design');
  addSubTitle(
    `${name} · Dibuat ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`
  );

  ensureSpace(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text(`Type: ${typeLabel}`, margin, y);
  y += 16;
  doc.text(`Authority: ${authorityLabel}`, margin, y);
  y += 16;
  doc.text(`Profile: ${profile}`, margin, y);
  y += 16;
  doc.text(`Signature: ${signature}   ·   Not-Self: ${notSelf}`, margin, y);
  y += 24;

  if (bodygraphImageDataUrl) {
    const imgWidth = contentWidth * 0.6;
    const imgHeight = imgWidth / bodygraphImageAspect;
    ensureSpace(imgHeight + 20);
    const imgX = margin + (contentWidth - imgWidth) / 2;
    doc.addImage(bodygraphImageDataUrl, 'PNG', imgX, y, imgWidth, imgHeight);
    y += imgHeight + 20;
  }

  // ---- Type section ----
  addSectionHeading(`Type — ${typeLabel}`);
  addFieldSection(TYPE_CONTENT_FIELDS, typeContent);

  // ---- Authority section ----
  addSectionHeading(`Authority — ${authorityLabel}`);
  addFieldSection(AUTHORITY_CONTENT_FIELDS, authorityContent);

  // ---- Profile section ----
  addSectionHeading(`Profile — ${profile}`);
  addFieldSection(PROFILE_CONTENT_FIELDS, profileContent);

  // ---- Disclaimer ----
  addSectionHeading('Disclaimer');
  addParagraph(
    'Laporan ini dihasilkan dengan bantuan AI berdasarkan sistem Human Design, dan dimaksudkan sebagai alat bantu refleksi diri (self-knowledge). Ini BUKAN fakta ilmiah, diagnosis medis, diagnosis psikologis, atau jaminan atas kejadian di masa depan. Gunakan sebagai bahan eksplorasi, bukan kebenaran mutlak.'
  );

  const fileNameSafe = name.trim().replace(/[^a-zA-Z0-9]+/g, '_') || 'laporan';
  doc.save(`human-design-${fileNameSafe}.pdf`);
}
