// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : app/id/x9-panel/page.tsx
// =====================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AssignLicenseForm from '@/components/panel/AssignLicenseForm';
import LicensesTable from '@/components/panel/LicensesTable';

export const dynamic = 'force-dynamic';

export default async function MasterPanelPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('hd_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'master') {
    redirect('/dashboard');
  }

  // Ambil daftar user untuk dropdown
  const { data: users } = await supabase
    .from('hd_users')
    .select('id, email, full_name')
    .order('email', { ascending: true });

  // Ambil daftar lisensi yang sudah dibuat, sekalian join info user
  const { data: licenses } = await supabase
    .from('hd_licenses')
    .select(`
      id,
      code,
      license_type,
      status,
      activated_at,
      expires_at,
      notes,
      created_at,
      assigned_user:assigned_user_id ( email, full_name )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">
        Human Design <span className="text-orange-400">Enterprise</span>
      </h1>
      <p className="text-sm text-gray-400 mb-8">Master Panel — Manajemen Lisensi</p>

      <AssignLicenseForm users={users ?? []} />

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Daftar Lisensi</h2>
        <LicensesTable licenses={licenses ?? []} />
      </div>
    </div>
  );
}
