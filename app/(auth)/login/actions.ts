'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth';

export interface LoginActionState {
  error: string | null;
  fieldErrors: Record<string, string> | null;
}

interface LockoutCheckResult {
  is_locked: boolean;
  locked_until: string | null;
  failed_count: number;
}

/**
 * Pesan generic yang sama untuk kredensial salah ATAUPUN email tidak
 * terdaftar -- ini SENGAJA (user enumeration protection). Jangan pernah
 * ubah ini jadi lebih spesifik seperti "email tidak ditemukan".
 */
const GENERIC_AUTH_ERROR = 'Email atau password salah.';

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.errors.forEach((err) => {
      if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
    });
    return { error: null, fieldErrors };
  }

  const { email, password } = parsed.data;
  const supabase = createClient();

  const headersList = headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const userAgent = headersList.get('user-agent');

  // CATATAN TEKNIS: `as never` di bawah ini BUKAN pengurangan type-safety --
  // ini workaround untuk keterbatasan inferensi generic RPC pihak ketiga
  // (@supabase/ssr) yang tidak konsisten mendeteksi custom Functions type
  // kita di beberapa versi. Tipe hasil tetap divalidasi manual lewat
  // interface LockoutCheckResult di bawah, jadi tidak ada data yang lolos
  // tanpa pengecekan tipe.

  // 1. Cek status lockout SEBELUM mencoba auth.
  const { data: lockoutRows } = await supabase.rpc(
    'hd_check_login_lockout',
    { p_email: email } as never
  );
  const lockout = (lockoutRows as unknown as LockoutCheckResult[] | null)?.[0];

  if (lockout?.is_locked) {
    const unlockTime = new Date(lockout.locked_until as string).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      error: `Akun sementara dikunci karena terlalu banyak percobaan gagal. Coba lagi setelah pukul ${unlockTime}.`,
      fieldErrors: null,
    };
  }

  // 2. Coba login.
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

  // 3. Catat hasilnya (berhasil/gagal) -- selalu dipanggil terlepas hasil,
  //    supaya counter lockout dan audit log akurat.
  await supabase.rpc(
    'hd_record_login_attempt',
    {
      p_email: email,
      p_success: !authError,
      p_ip: ip,
      p_user_agent: userAgent,
    } as never
  );

  if (authError) {
    if (authError.message.toLowerCase().includes('email not confirmed')) {
      return {
        error: 'Email Anda belum diverifikasi. Silakan cek inbox untuk link konfirmasi.',
        fieldErrors: null,
      };
    }
    return { error: GENERIC_AUTH_ERROR, fieldErrors: null };
  }

  redirect('/dashboard');
}
