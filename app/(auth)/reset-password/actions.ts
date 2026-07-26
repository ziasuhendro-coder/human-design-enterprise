// FILE INI HARUS DI: app/(auth)/reset-password/actions.ts

'use server';

import { createClient } from '@/lib/supabase/server';
import { resetPasswordSchema } from '@/lib/validations/auth';

export interface ResetPasswordActionState {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordActionState,
  formData: FormData
): Promise<ResetPasswordActionState> {
  const parsed = resetPasswordSchema.safeParse({
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

  const supabase = createClient();

  // Butuh sesi recovery yang valid (dibuat oleh /auth/callback setelah
  // pengguna klik link email). Kalau tidak ada sesi, berarti pengguna
  // membuka halaman ini langsung tanpa lewat link yang sah.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: 'Sesi reset password sudah kedaluwarsa. Silakan minta link baru.',
      fieldErrors: null,
      success: false,
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      error: 'Gagal mengubah password. Silakan coba lagi atau minta link baru.',
      fieldErrors: null,
      success: false,
    };
  }

  return { error: null, fieldErrors: null, success: true };
}

