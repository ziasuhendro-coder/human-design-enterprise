// FILE INI HARUS DI: app/dashboard/page.tsx

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/types/database.types';

export const metadata: Metadata = {
  title: 'Dashboard',
};

type HdUserRow = Database['public']['Tables']['hd_users']['Row'];

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('hd_users')
    .select('*')
    .eq('id', user!.id)
    .single();

  // CATATAN TEKNIS: cast eksplisit karena parser tipe select() postgrest-js
  // kadang gagal resolve (known limitation) -- lihat catatan yang sama di
  // app/dashboard/layout.tsx.
  const profile = data as HdUserRow | null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Selamat datang, {profile?.full_name ?? 'Pengguna'} 👋
      </h1>
      <p className="mt-2 text-foreground-muted">
        Fase 2 (Auth) berhasil terintegrasi penuh. Modul Human Design Profile
        akan dibangun di fase berikutnya.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-medium text-foreground-muted">
          Status Akun
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-foreground-subtle">Email</dt>
            <dd className="text-foreground">{profile?.email}</dd>
          </div>
          <div>
            <dt className="text-foreground-subtle">Role</dt>
            <dd className="capitalize text-foreground">{profile?.role}</dd>
          </div>
          <div>
            <dt className="text-foreground-subtle">Status</dt>
            <dd className="capitalize text-foreground">{profile?.status}</dd>
          </div>
          <div>
            <dt className="text-foreground-subtle">Bergabung sejak</dt>
            <dd className="text-foreground">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
