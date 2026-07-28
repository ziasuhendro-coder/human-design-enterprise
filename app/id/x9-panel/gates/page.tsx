// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : app/id/x9-panel/gates/page.tsx
// =====================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GATE_NAMES } from '@/lib/humandesign/data/gateNames';
import GateContentManager, { GateContentRow } from '@/components/panel/GateContentManager';

interface HdGateContentRow {
  gate_number: number;
  reviewed: boolean;
  generated_at: string | null;
}

export default async function GatesAdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('hd_users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (!profile || profile.role !== 'master') {
    redirect('/dashboard');
  }

  const { data: contentRows } = await supabase
    .from('hd_gate_content')
    .select('gate_number, reviewed, generated_at')
    .returns<HdGateContentRow[]>();

  const statusMap = new Map<number, HdGateContentRow>();
  (contentRows ?? []).forEach((row) => statusMap.set(row.gate_number, row));

  const gates: GateContentRow[] = Array.from({ length: 64 }, (_, i) => {
    const gateNumber = i + 1;
    const existing = statusMap.get(gateNumber);
    return {
      gateNumber,
      name: GATE_NAMES[gateNumber],
      status: !existing ? 'none' : existing.reviewed ? 'reviewed' : 'unreviewed',
      generatedAt: existing?.generated_at ?? null,
    };
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0f0f0', padding: 24 }}>
      <h1>Kelola Konten 64 Gate</h1>
      <p style={{ color: '#aaaaaa', fontSize: 14 }}>
        Generate konten via AI, review, lalu tandai "Reviewed" supaya tampil ke user.
      </p>
      <GateContentManager initialGates={gates} />
    </div>
  );
    }
