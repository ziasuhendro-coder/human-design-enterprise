import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database.types';

/**
 * Supabase client untuk Server Components, Server Actions, dan Route Handlers.
 *
 * PENTING (keamanan): di kode server, SELALU verifikasi sesi lewat
 * `supabase.auth.getUser()`, JANGAN pakai `getSession()` untuk keputusan
 * otorisasi. `getUser()` memvalidasi token langsung ke Supabase Auth server,
 * sedangkan `getSession()` hanya membaca cookie lokal yang bisa dipalsukan
 * di sisi client tanpa validasi ulang.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          } catch {
            // `setAll` dipanggil dari Server Component -- ini aman diabaikan
            // selama middleware.ts sudah menangani refresh sesi. Next.js
            // tidak mengizinkan Server Component menulis cookie langsung.
          }
        },
      },
    }
  );
}

/**
 * Admin client dengan service_role key -- BYPASS RLS sepenuhnya.
 * HANYA dipakai di Server Actions/Route Handlers untuk operasi istimewa
 * (mis. promosi role oleh master). JANGAN PERNAH import ini di kode yang
 * bisa dijangkau Client Component.
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Admin client tidak pernah menulis cookie sesi.
        },
      },
    }
  );
}

