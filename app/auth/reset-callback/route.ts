// ============================================================
// AKSI: BUAT FILE BARU
// PATH   : app/auth/reset-callback/route.ts
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Route callback KHUSUS untuk alur reset password -- terpisah dari
 * /auth/callback biasa (yang dipakai untuk konfirmasi signup).
 *
 * Kenapa terpisah: Supabase Redirect URLs allowlist tidak selalu
 * mempertahankan query string custom (mis. ?redirectTo=/reset-password)
 * dengan konsisten, sehingga bisa fallback diam-diam ke Site URL kalau
 * tidak cocok persis. Dengan path khusus ini (tanpa query string sama
 * sekali) dan didaftarkan persis di Supabase allowlist, tidak ada
 * ambiguitas -- tujuan redirect SELALU /reset-password.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

