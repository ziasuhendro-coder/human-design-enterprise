'use server';

import { createClient } from '@/lib/supabase/server';
import { signupSchema } from '@/lib/validations/auth';

export interface SignupActionState {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
}

export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    agreeToTerms: formData.get('agreeToTerms') === 'on',
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.errors.forEach((err) => {
      if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
    });
    return { error: null, fieldErrors, success: false };
  }

  const { fullName, email, password } = parsed.data;
  const supabase = createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (authError) {
    // Supabase mengembalikan pesan berbeda untuk email yang sudah terdaftar.
    // Kita tetap beri pesan yang cukup jelas di sini (BEDA dengan login --
    // di signup, mengonfirmasi "email sudah terdaftar" adalah wajar dan
    // membantu, bukan celah keamanan seperti di login).
    if (authError.message.toLowerCase().includes('already registered')) {
      return {
        error: 'Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.',
        fieldErrors: null,
        success: false,
      };
    }
    return { error: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.', fieldErrors: null, success: false };
  }

  return { error: null, fieldErrors: null, success: true };
}

