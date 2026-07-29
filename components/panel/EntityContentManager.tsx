// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : components/panel/EntityContentManager.tsx
// =====================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  TYPE_NAMES,
  AUTHORITY_NAMES,
  PROFILE_CODES,
  CENTER_NAMES,
  CHANNEL_CODES,
  PLANET_NAMES,
} from '@/lib/humandesign/data/entityNames';
import { ENTITY_TYPE_REGISTRY, EntityType } from '@/lib/humandesign/data/entityContentSchemas';

type EntityStatus = 'none' | 'unreviewed' | 'reviewed';

interface EntityRow {
  key: string;
  status: EntityStatus;
}

const ENTITY_KEYS_MAP: Record<EntityType, string[]> = {
  type: TYPE_NAMES,
  authority: AUTHORITY_NAMES,
  profile: PROFILE_CODES,
  center: CENTER_NAMES,
  channel: CHANNEL_CODES,
  planet: PLANET_NAMES,
};

const tabStyle = (active: boolean) => ({
  padding: '8px 16px',
  background: active ? '#f5a623' : '#222222',
  color: active ? '#000000' : '#cccccc',
  border: 'none',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: active ? 700 : 400,
  cursor: 'pointer',
  marginRight: 8,
  marginBottom: 8,
});
const rowStyle = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #333333' };
const badgeStyle = (status: EntityStatus) => ({
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 12,
  background: status === 'reviewed' ? '#1a4a1a' : status === 'unreviewed' ? '#4a3a10' : '#333333',
  color: status === 'reviewed' ? '#88ff88' : status === 'unreviewed' ? '#ffcc66' : '#999999',
});
const buttonStyle = { padding: '6px 12px', background: '#f5a623', color: '#000000', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer' };
const smallButtonStyle = { ...buttonStyle, background: '#333333', color: '#eeeeee' };

export default function EntityContentManager() {
  const [activeType, setActiveType] = useState<EntityType>('type');
  const [rows, setRows] = useState<EntityRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [expandedContent, setExpandedContent] = useState<{ content_id: unknown; content_en: unknown } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = ENTITY_TYPE_REGISTRY.find((c) => c.entityType === activeType)!;

  const loadList = useCallback(async (entityType: EntityType) => {
    setLoadingList(true);
    setError(null);
    setExpandedKey(null);
    setExpandedContent(null);

    const cfg = ENTITY_TYPE_REGISTRY.find((c) => c.entityType === entityType)!;
    const allKeys = ENTITY_KEYS_MAP[entityType];
    const supabase = createClient();

    // Tabel-tabel ini belum terdaftar di Supabase generated types,
    // jadi kita cast ke `any` supaya TypeScript tidak memaksa
    // tabel bertipe `never`.
    const { data, error: fetchError } = await (supabase.from(cfg.tableName) as any).select(
      `${cfg.keyColumn}, reviewed`
    );

    if (fetchError) {
      setError(`Gagal memuat daftar ${cfg.label}`);
      setLoadingList(false);
      return;
    }

    const existingMap = new Map<string, boolean>();
    (data ?? []).forEach((row: Record<string, unknown>) => {
      existingMap.set(String(row[cfg.keyColumn]), Boolean(row.reviewed));
    });

    const builtRows: EntityRow[] = allKeys.map((key) => ({
      key,
      status: existingMap.has(key) ? (existingMap.get(key) ? 'reviewed' : 'unreviewed') : 'none',
    }));

    setRows(builtRows);
    setLoadingList(false);
  }, []);

  useEffect(() => {
    loadList(activeType);
  }, [activeType, loadList]);

  async function handleGenerate(entityKey: string) {
    setLoadingKey(entityKey);
    setError(null);
    try {
      const res = await fetch('/api/admin/entity-content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: activeType, entityKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`${entityKey}: ${data.error ?? 'Gagal generate'}`);
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.key === entityKey ? { ...r, status: 'unreviewed' } : r))
      );
      setExpandedKey(entityKey);
      setExpandedContent({ content_id: data.content_id, content_en: data.content_en });
    } catch (err) {
      setError(`${entityKey}: ${err instanceof Error ? err.message : 'Kesalahan tidak diketahui'}`);
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleViewOrCollapse(entityKey: string) {
    if (expandedKey === entityKey) {
      setExpandedKey(null);
      setExpandedContent(null);
      return;
    }
    const supabase = createClient();
    // hd_*_content belum terdaftar di Supabase generated types,
    // jadi kita cast ke `any` supaya TypeScript tidak memaksa
    // tabel bertipe `never`.
    const { data, error: fetchError } = await (supabase.from(config.tableName) as any)
      .select('content_id, content_en')
      .eq(config.keyColumn, entityKey)
      .single();

    if (fetchError || !data) {
      setError(`Gagal memuat konten ${entityKey}`);
      return;
    }
    setExpandedKey(entityKey);
    setExpandedContent(data as { content_id: unknown; content_en: unknown });
  }

  async function handleMarkReviewed(entityKey: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // hd_*_content belum terdaftar di Supabase generated types,
    // jadi kita cast ke `any` supaya TypeScript tidak memaksa
    // tabel bertipe `never`.
    const { error: updateError } = await (supabase.from(config.tableName) as any)
      .update({ reviewed: true, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
      .eq(config.keyColumn, entityKey);

    if (updateError) {
      setError(`Gagal menandai ${entityKey} sebagai reviewed`);
      return;
    }
    setRows((prev) => prev.map((r) => (r.key === entityKey ? { ...r, status: 'reviewed' } : r)));
  }

  function renderContentBlock(content: unknown, lang: 'ID' | 'EN') {
    if (activeType === 'center' && content && typeof content === 'object') {
      const c = content as { defined?: Record<string, string>; open?: Record<string, string> };
      return (
        <div style={{ marginBottom: 10 }}>
          <strong style={{ color: '#f5a623' }}>Defined ({lang})</strong>
          {Object.entries(c.defined ?? {}).map(([k, v]) => (
            <div key={k} style={{ color: '#cccccc', fontSize: 12, marginBottom: 4 }}>
              <em>{k}:</em> {v}
            </div>
          ))}
          <strong style={{ color: '#f5a623' }}>Open ({lang})</strong>
          {Object.entries(c.open ?? {}).map(([k, v]) => (
            <div key={k} style={{ color: '#cccccc', fontSize: 12, marginBottom: 4 }}>
              <em>{k}:</em> {v}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div style={{ marginBottom: 10 }}>
        <strong style={{ color: '#f5a623' }}>{lang}</strong>
        {Object.entries((content as Record<string, string>) ?? {}).map(([k, v]) => (
          <div key={k} style={{ color: '#cccccc', fontSize: 12, marginBottom: 4 }}>
            <em>{k}:</em> {v}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        {ENTITY_TYPE_REGISTRY.map((c) => (
          <button
            key={c.entityType}
            style={tabStyle(activeType === c.entityType)}
            onClick={() => setActiveType(c.entityType)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: 12, background: '#4a1010', color: '#ff8888', borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loadingList ? (
        <div style={{ color: '#888888' }}>Memuat...</div>
      ) : (
        rows.map((row) => (
          <div key={row.key}>
            <div style={rowStyle}>
              <span style={{ flex: 1 }}>{row.key}</span>
              <span style={badgeStyle(row.status)}>
                {row.status === 'reviewed' ? 'Reviewed' : row.status === 'unreviewed' ? 'Belum Direview' : 'Belum Ada'}
              </span>
              <button
                style={buttonStyle}
                disabled={loadingKey === row.key}
                onClick={() => handleGenerate(row.key)}
              >
                {loadingKey === row.key ? '...' : row.status === 'none' ? 'Generate' : 'Regenerate'}
              </button>
              {row.status !== 'none' && (
                <button style={smallButtonStyle} onClick={() => handleViewOrCollapse(row.key)}>
                  {expandedKey === row.key ? 'Tutup' : 'Lihat'}
                </button>
              )}
              {row.status === 'unreviewed' && (
                <button style={smallButtonStyle} onClick={() => handleMarkReviewed(row.key)}>
                  Tandai Reviewed
                </button>
              )}
            </div>

            {expandedKey === row.key && expandedContent && (
              <div style={{ padding: 16, background: '#151515', marginBottom: 8, fontSize: 13 }}>
                {renderContentBlock(expandedContent.content_id, 'ID')}
                {renderContentBlock(expandedContent.content_en, 'EN')}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
