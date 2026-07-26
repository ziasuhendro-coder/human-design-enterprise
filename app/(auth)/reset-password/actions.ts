// FILE INI HARUS DI: app/(auth)/forgot-password/actions.ts

'use server';

import { createClient } from '@/lib/supabase/server';
import { forgotPasswordSchema, verifyOtpResetSchema } from '@/lib/validations/auth';

export interface ForgotPasswordActionState {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
  email: string | null;
}

/**
 * Langkah 1: kirim kode OTP 6-digit ke email. TIDAK memakai redirectTo /
 * link sama sekali -- user akan memasukkan kode secara manual di langkah 2,
 * sehingga kebal dari masalah link "termakan" oleh pemindai email otomatis
 * (Gmail, Outlook, dsb).
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
    return { error: null, fieldErrors, success: false, email: null };
  }

  const { email } = parsed.data;
  const supabase = createClient();

  // CATATAN KEAMANAN: kita TIDAK mengecek isi error untuk membedakan "email
  // tidak ditemukan" vs error lain -- selalu tampilkan pesan sukses generic
  // yang sama (user enumeration protection).
  await supabase.auth.resetPasswordForEmail(email);

  return { error: null, fieldErrors: null, success: true, email };
}

export interface VerifyOtpResetActionState {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
}

/**
 * Langkah 2: verifikasi kode OTP + set password baru sekaligus.
 * verifyOtp() dengan type 'recovery' membuat sesi valid (identitas
 * terverifikasi lewat kode), lalu langsung dipakai untuk updateUser().
 */
export async function verifyOtpResetAction(
  _prevState: VerifyOtpResetActionState,
  formData: FormData
): Promise<VerifyOtpResetActionState> {
  const parsed = verifyOtpResetSchema.safeParse({
    email: formData.get('email'),
    otp: formData.get('otp'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.errors.forEach((err) => {
      if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
    });
    return { error: null, fieldErrors, success: false };
  }

  const { email, otp, password } = parsed.data;
  const supabase = createClient();

  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'recovery',
  });

  if (verifyError) {
    return {
      error: 'Kode salah atau sudah kedaluwarsa. Silakan minta kode baru.',
      fieldErrors: null,
      success: false,
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });

  if (updateError) {
    return {
      error: 'Gagal mengubah password. Silakan coba lagi.',
      fieldErrors: null,
      success: false,
    };
  }

  return { error: null, fieldErrors: null, success: true };
}
