// FILE INI HARUS DI: app/dashboard/layout.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/app/dashboard/actions';
import type { Database } from '@/lib/types/database.types';

type HdUserRow = Database['public']['Tables']['hd_users']['Row'];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth: middleware.ts sudah redirect kalau belum login, tapi
  // JANGAN PERNAH hanya mengandalkan middleware -- selalu verifikasi ulang
  // di layer server component/action yang benar-benar mengakses data.
  if (!user) {
    redirect('/login');
  }

  // CATATAN TEKNIS: cast eksplisit ke HdUserRow karena parser tipe otomatis
  // dari string select() di postgrest-js kadang gagal resolve (known
  // limitation), menghasilkan tipe 'never'. Cast manual ini tetap
  // type-safe karena HdUserRow adalah interface yang benar-benar
  // mencerminkan schema database (lihat lib/types/database.types.ts).
  const { data } = await supabase
    .from('hd_users')
    .select('email, full_name, role')
    .eq('id', user.id)
    .single();
  const profile = data as Pick<HdUserRow, 'email' | 'full_name' | 'role'> | null;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="font-display text-lg font-semibold text-foreground">
          Human Design <span className="text-accent">Enterprise</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="text-foreground">{profile?.full_name ?? profile?.email}</p>
            <p className="text-foreground-subtle capitalize">{profile?.role}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-border px-4 py-2 text-sm text-foreground-muted hover:bg-surface hover:text-foreground"
            >
              Keluar
            </button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
