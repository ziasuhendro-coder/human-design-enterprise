// =====================================================
// AKSI: GANTI SELURUH ISI FILE
// PATH  : app/id/hd-test/page.tsx
// =====================================================
// Halaman ini SEMENTARA, khusus untuk menguji manual endpoint kalkulasi
// chart sebelum form onboarding resmi dibangun di Fase 5.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TimezoneOption {
  id: string;
  city_name: string;
  region: string | null;
  utc_offset_hours: number;
}

export default function HdTestPage() {
  const [timezones, setTimezones] = useState<TimezoneOption[]>([]);
  const [birthDate, setBirthDate] = useState('1948-04-09');
  const [birthTime, setBirthTime] = useState('00:05');
  const [timezoneId, setTimezoneId] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('hd_timezones')
      .select('id, city_name, region, utc_offset_hours')
      .order('city_name')
      .returns<TimezoneOption[]>()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(`Gagal memuat daftar timezone: ${fetchError.message}`);
          return;
        }
        const list = data ?? [];
        setTimezones(list);
        const montreal = list.find((tz) => tz.city_name === 'Montreal');
        if (montreal) setTimezoneId(montreal.id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/humandesign/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime, timezoneId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request gagal dengan status ${res.status}`);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesalahan tidak diketahui');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24, fontFamily: 'monospace' }}>
      <h1>🧪 Test Kalkulasi Human Design (Sementara)</h1>
      <p style={{ color: '#888', fontSize: 14 }}>
        Default terisi data Ra Uru Hu (pendiri Human Design) — hasil yang diharapkan:
        Type <b>Manifestor</b>, Authority <b>Splenic</b>.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
