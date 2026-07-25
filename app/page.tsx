import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Root route ("/") tidak menampilkan konten -- hanya mengarahkan pengguna
 * berdasarkan status login. Landing page publik akan ditambahkan di modul
 * marketing terpisah (di luar scope Fase 2: Auth).
 */
export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  redirect('/login');
}

