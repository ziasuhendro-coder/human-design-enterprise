import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('hd_users')
    .select('*')
    .eq('id', user!.id)
    .single();

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

