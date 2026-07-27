// ============================================================
// AKSI: GANTI ISI FILE YANG SUDAH ADA
// PATH   : app/(auth)/forgot-password/actions.ts
// ============================================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { forgotPasswordSchema } from '@/lib/validations/auth';

export interface ForgotPasswordActionState {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
}

/**
 * CATATAN: Kembali memakai alur link (bukan OTP) sebagai solusi sementara
 * -- setup SMTP custom sempat bermasalah (Supabase melapor sukses kirim
 * tapi email tidak sampai di Resend). Ini dicatat sebagai item perbaikan
 * sebelum go-live publik. Alur link ini sudah terbukti berhasil sebelumnya
 * memakai layanan email bawaan Supabase.
 */
export async function forgotPasswordAction(
  _prevState: ForgotPasswordActionState,
  formData: FormData
): Promise<ForgotPasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.errors.forEach((err) => {
      if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
    });
    return { error: null, fieldErrors, success: false };
  }

  const { email } = parsed.data;
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // CATATAN KEAMANAN: kita TIDAK mengecek isi error untuk membedakan "email
  // tidak ditemukan" vs error lain -- selalu tampilkan pesan sukses generic
  // yang sama (user enumeration protection).
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-callback`,
  });

  return { error: null, fieldErrors: null, success: true };
}
