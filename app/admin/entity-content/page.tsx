// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : app/admin/entity-content/page.tsx
// =====================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EntityContentManager from '@/components/panel/EntityContentManager';

export default async function EntityContentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('hd_users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (!profile || profile.role !== 'master') {
    redirect('/dashboard');
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ color: '#f5a623', marginBottom: 4 }}>Human Design Enterprise</h1>
      <p style={{ color: '#888888', marginBottom: 24 }}>Master Panel — Manajemen Konten Interpretasi</p>
      <EntityContentManager />
    </div>
  );
                                                                                                      }
