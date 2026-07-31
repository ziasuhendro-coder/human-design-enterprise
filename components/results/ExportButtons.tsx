// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : components/results/ExportButtons.tsx
// =====================================================

'use client';

import { useState, RefObject } from 'react';
import { buildAndDownloadPdfReport } from '@/lib/humandesign/pdfReport';

interface ExportButtonsProps {
  jpgTargetRef: RefObject<HTMLDivElement>;
  bodygraphRef: RefObject<HTMLDivElement>;
  name: string;
  typeLabel: string;
  authorityLabel: string;
  profile: string;
  signature: string;
  notSelf: string;
  typeContent: Record<string, string> | null;
  authorityContent: Record<string, string> | null;
  profileContent: Record<string, string> | null;
}

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 16,
  marginBottom: 8,
};

const buttonBaseStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px 16px',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  border: '1px solid rgba(245,166,35,0.35)',
  cursor: 'pointer',
};

const jpgButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  background: 'rgba(245,166,35,0.12)',
  color: '#f5a623',
};

const pdfButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  background: '#f5a623',
  color: '#000000',
};

export default function ExportButtons({
  jpgTargetRef,
  bodygraphRef,
  name,
  typeLabel,
  authorityLabel,
  profile,
  signature,
  notSelf,
  typeContent,
  authorityContent,
  profileContent,
}: ExportButtonsProps) {
  const [exportingJpg, setExportingJpg] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExportJpg() {
    if (!jpgTargetRef.current) return;
    setExportingJpg(true);
    setError(null);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(jpgTargetRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const link = document.createElement('a');
      const fileNameSafe = name.trim().replace(/[^a-zA-Z0-9]+/g, '_') || 'chart';
      link.href = dataUrl;
      link.download = `human-design-${fileNameSafe}.jpg`;
      link.click();
    } catch (err) {
      console.error('Gagal export JPG:', err);
      setError('Gagal membuat gambar JPG. Coba lagi.');
    } finally {
      setExportingJpg(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    setError(null);
    try {
      let bodygraphImageDataUrl: string | null = null;
      let bodygraphImageAspect = 1;

      if (bodygraphRef.current) {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(bodygraphRef.current, {
          backgroundColor: '#151515',
          scale: 2,
          useCORS: true,
        });
        bodygraphImageDataUrl = canvas.toDataURL('image/png');
        bodygraphImageAspect = canvas.width / canvas.height;
      }

      await buildAndDownloadPdfReport({
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
      });
    } catch (err) {
      console.error('Gagal export PDF:', err);
      setError('Gagal membuat laporan PDF. Coba lagi.');
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div>
      <div style={wrapperStyle}>
        <button style={jpgButtonStyle} onClick={handleExportJpg} disabled={exportingJpg}>
          {exportingJpg ? 'Membuat JPG...' : '📷 Export JPG'}
        </button>
        <button style={pdfButtonStyle} onClick={handleExportPdf} disabled={exportingPdf}>
          {exportingPdf ? 'Membuat PDF...' : '📄 Export PDF Lengkap'}
        </button>
      </div>
      {error && <div style={{ color: '#ff8888', fontSize: 12, marginBottom: 12 }}>{error}</div>}
    </div>
  );
}
