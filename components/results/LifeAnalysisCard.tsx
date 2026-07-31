// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : components/results/LifeAnalysisCard.tsx
// =====================================================

'use client';

import { useState } from 'react';
import { LIFE_ANALYSIS_CATEGORIES } from '@/lib/humandesign/data/lifeAnalysisSchema';

interface LifeAnalysisCardProps {
  typeName: string;
  authorityName: string;
  profileCode: string;
}

type CategoryContent = Record<string, Record<string, string>>;

const wrapperStyle: React.CSSProperties = {
  marginTop: 24,
  padding: 20,
  background: '#151515',
  borderRadius: 10,
};

const generateButtonStyle: React.CSSProperties = {
  padding: '12px 20px',
  background: '#f5a623',
  color: '#000000',
  border: 'none',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
};

const categoryHeaderStyle = (active: boolean): React.CSSProperties => ({
  padding: '12px 14px',
  background: active ? 'rgba(245,166,35,0.12)' : '#1e1e1e',
  border: '1px solid rgba(245,166,35,0.2)',
  borderRadius: 8,
  marginBottom: 8,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export default function LifeAnalysisCard({ typeName, authorityName, profileCode }: LifeAnalysisCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<CategoryContent | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  async function handleGenerate(forceRegenerate = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/humandesign/life-analysis/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeName, authorityName, profileCode, forceRegenerate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Gagal membuat analisis');
        return;
      }
      setContent(data.content_id as CategoryContent);
      setCached(Boolean(data.cached));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesalahan tidak diketahui');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wrapperStyle}>
      <h2 style={{ marginTop: 0 }}>Analisis Kehidupan Mendalam</h2>
      <p style={{ color: '#aaaaaa', fontSize: 13, marginBottom: 16 }}>
        Mencakup Asmara, Pernikahan, Keluarga, Karier, Bisnis, Keuangan, Pengembangan Diri, Energi &amp; Keseimbangan,
        dan Misi Kehidupan — berdasarkan kombinasi Type, Authority, dan Profile kamu.
      </p>

      {!content && (
        <button style={generateButtonStyle} onClick={() => handleGenerate(false)} disabled={loading}>
          {loading ? 'Membuat Analisis...' : '✨ Buat Analisis Kehidupan Lengkap'}
        </button>
      )}

      {error && <div style={{ color: '#ff8888', fontSize: 13, marginTop: 12 }}>{error}</div>}

      {content && (
        <div style={{ marginTop: 8 }}>
          {cached && (
            <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>
              Analisis ini sudah pernah dibuat sebelumnya untuk kombinasi Type/Authority/Profile ini.
            </div>
          )}
          {LIFE_ANALYSIS_CATEGORIES.map((cat) => {
            const isOpen = openCategory === cat.key;
            const catContent = content[cat.key] ?? {};
            return (
              <div key={cat.key}>
                <div style={categoryHeaderStyle(isOpen)} onClick={() => setOpenCategory(isOpen ? null : cat.key)}>
                  <span>{cat.emoji} {cat.label}</span>
                  <span>{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && (
                  <div style={{ padding: '4px 14px 16px 14px' }}>
                    {cat.fields.map((field) => {
                      const value = catContent[field.key];
                      if (!value) return null;
                      return (
                        <div key={field.key} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#f5a623', marginBottom: 2 }}>
                            {field.label}
                          </div>
                          <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#d5d5d5' }}>{value}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <button
            style={{ ...generateButtonStyle, background: '#333333', color: '#eee', marginTop: 8 }}
            onClick={() => handleGenerate(true)}
            disabled={loading}
          >
            {loading ? 'Membuat Ulang...' : '🔄 Buat Ulang Analisis'}
          </button>
        </div>
      )}
    </div>
  );
}
