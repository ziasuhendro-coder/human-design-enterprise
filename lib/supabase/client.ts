import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database.types';

/**
 * Supabase client untuk Client Components (browser).
 * Dipakai di komponen dengan directive 'use client', misalnya form
 * interaktif yang butuh realtime subscription atau client-side validation.
 *
 * Untuk Server Components/Server Actions, gunakan lib/supabase/server.ts
 * -- JANGAN gunakan client ini di sana, karena tidak bisa akses cookies
 * request secara langsung.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

