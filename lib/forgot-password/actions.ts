// FILE INI HARUS DI: app/(auth)/forgot-password/actions.ts

'use server';

import { createClient } from '@/lib/supabase/server';
import { forgotPasswordSchema } from '@/lib/validations/auth';

export interface ForgotPasswordActionState {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
}

/**
 * Pesan sukses SELALU sama, baik email terdaftar maupun tidak -- ini
 * SENGAJA (user enumeration protection), sama seperti prinsip di login.
 */
const GENERIC_SUCCESS_MESSAGE =
  'Jika email tersebut terdaftar, kami sudah mengirim link reset password.';

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

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?redirectTo=/reset-password`,
  });

  // CATATAN KEAMANAN: kita TIDAK mengecek isi `error` untuk membedakan
  // "email tidak ditemukan" vs error lain -- selalu tampilkan pesan sukses
  // generic yang sama. Rate limit (429) dari Supabase pun sengaja tidak
  // dibedakan di sini untuk alasan yang sama.
  void error;

  return { error: null, fieldErrors: null, success: true };
}

