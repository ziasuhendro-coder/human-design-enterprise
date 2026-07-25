import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Verifikasi Email',
};

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted">
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Cek email Anda
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Kami sudah mengirim link konfirmasi ke email Anda. Klik link
          tersebut untuk mengaktifkan akun sebelum bisa masuk.
        </p>
      </div>

      <p className="text-sm text-foreground-subtle">
        Tidak menerima email? Cek folder spam, atau{' '}
        <Link href="/signup" className="text-primary hover:text-primary-hover">
          coba daftar ulang
        </Link>
        .
      </p>

      <Link
        href="/login"
        className="text-sm font-medium text-primary hover:text-primary-hover"
      >
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}

