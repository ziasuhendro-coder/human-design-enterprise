// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : components/panel/GateContentManager.tsx
// =====================================================

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GateContentBody, GATE_CONTENT_FIELDS } from '@/lib/humandesign/data/gateContentSchema';

export interface GateContentRow {
  gateNumber: number;
  name: string;
  status: 'none' | 'unreviewed' | 'reviewed';
  generatedAt: string | null;
}

const rowStyle = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #333333' };
const badgeStyle = (status: string) => ({
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 12,
  background: status === 'reviewed' ? '#1a4a1a' : status === 'unreviewed' ? '#4a3a10' : '#333333',
  color: status === 'reviewed' ? '#88ff88' : status === 'unreviewed' ? '#ffcc66' : '#999999',
});
const buttonStyle = { padding: '6px 12px', background: '#f5a623', color: '#000000', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer' };
const smallButtonStyle = { ...buttonStyle, background: '#333333', color: '#eeeeee' };

export default function GateContentManager({ initialGates }: { initialGates: GateContentRow[] }) {
  const [gates, setGates] = useState(initialGates);
  const [loadingGate, setLoadingGate] = useState<number | null>(null);
  const [expandedGate, setExpandedGate] = useState<number | null>(null);
  const [expandedContent, setExpandedContent] = useState<{ content_id: GateContentBody; content_en: GateContentBody } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(gateNumber: number) {
    setLoadingGate(gateNumber);
    setError(null);
    try {
      const res = await fetch('/api/admin/gate-content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`Gate ${gateNumber}: ${data.error ?? 'Gagal generate'}`);
        return;
      }
      setGates((prev) =>
        prev.map((g) =>
          g.gateNumber === gateNumber ? { ...g, status: 'unreviewed', generatedAt: new Date().toISOString() } : g
        )
      );
      setExpandedGate(gateNumber);
      setExpandedContent({ content_id: data.content_id, content_en: data.content_en });
    } catch (err) {
      setError(`Gate ${gateNumber}: ${err instanceof Error ? err.message : 'Kesalahan tidak diketahui'}`);
    } finally {
      setLoadingGate(null);
    }
  }

  async function handleViewOrCollapse(gateNumber: number) {
    if (expandedGate === gateNumber) {
      setExpandedGate(null);
      setExpandedContent(null);
      return;
    }
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from('hd_gate_content')
      .select('content_id, content_en')
      .eq('gate_number', gateNumber)
      .single<{ content_id: GateContentBody; content_en: GateContentBody }>();

    if (fetchError || !data) {
      setError(`Gagal memuat konten Gate ${gateNumber}`);
      return;
    }
    setExpandedGate(gateNumber);
    setExpandedContent(data);
  }

  async function handleMarkReviewed(gateNumber: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error: updateError } = await supabase
      .from('hd_gate_content')
      .update({ reviewed: true, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
      .eq('gate_number', gateNumber);

    if (updateError) {
      setError(`Gagal menandai Gate ${gateNumber} sebagai reviewed`);
      return;
    }
    setGates((prev) => prev.map((g) => (g.gateNumber === gateNumber ? { ...g, status: 'reviewed' } : g)));
  }

  return (
    <div>
      {error && (
        <div style={{ padding: 12, background: '#4a1010', color: '#ff8888', borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {gates.map((gate) => (
        <div key={gate.gateNumber}>
          <div style={rowStyle}>
            <span style={{ width: 40 }}>#{gate.gateNumber}</span>
            <span style={{ flex: 1 }}>{gate.name}</span>
            <span style={badgeStyle(gate.status)}>
              {gate.status === 'reviewed' ? 'Reviewed' : gate.status === 'unreviewed' ? 'Belum Direview' : 'Belum Ada'}
            </span>
            <button
              style={buttonStyle}
              disabled={loadingGate === gate.gateNumber}
              onClick={() => handleGenerate(gate.gateNumber)}
            >
              {loadingGate === gate.gateNumber ? '...' : gate.status === 'none' ? 'Generate' : 'Regenerate'}
            </button>
            {gate.status !== 'none' && (
              <button style={smallButtonStyle} onClick={() => handleViewOrCollapse(gate.gateNumber)}>
                {expandedGate === gate.gateNumber ? 'Tutup' : 'Lihat'}
              </button>
            )}
            {gate.status === 'unreviewed' && (
              <button style={smallButtonStyle} onClick={() => handleMarkReviewed(gate.gateNumber)}>
                Tandai Reviewed
              </button>
            )}
          </div>

          {expandedGate === gate.gateNumber && expandedContent && (
            <div style={{ padding: 16, background: '#151515', marginBottom: 8, fontSize: 13 }}>
              {GATE_CONTENT_FIELDS.map((field) => (
                <div key={field.key} style={{ marginBottom: 10 }}>
                  <strong style={{ color: '#f5a623' }}>{field.label}</strong>
                  <div style={{ color: '#cccccc' }}>ID: {expandedContent.content_id[field.key]}</div>
                  <div style={{ color: '#888888' }}>EN: {expandedContent.content_en[field.key]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
                                      }
