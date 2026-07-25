import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Link Tidak Valid',
};

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-bg">
        <svg
          className="h-8 w-8 text-danger"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Link tidak valid atau kedaluwarsa
        </h1>
        <p className="mt-2 max-w-sm text-sm text-foreground-muted">
          Link konfirmasi ini mungkin sudah pernah dipakai atau sudah lewat
          batas waktu. Silakan minta link baru.
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-hover"
      >
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}

