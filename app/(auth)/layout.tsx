export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Panel kiri: branding + motif signature -- disembunyikan di mobile
          supaya form jadi fokus utama pada layar kecil (workflow developer
          ini sendiri mobile-first, dan pengguna akhir kemungkinan besar
          juga banyak yang akses dari HP). */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-surface p-12 lg:flex bg-constellation">
        <div className="font-display text-2xl font-semibold text-foreground">
          Human Design <span className="text-accent">Enterprise</span>
        </div>
        <div className="max-w-md">
          <p className="font-display text-3xl leading-snug text-foreground">
            Pahami desain energi Anda, ambil keputusan selaras dengan diri
            sejati.
          </p>
          <p className="mt-4 text-foreground-muted">
            Platform Human Design profesional untuk individu dan praktisi.
          </p>
        </div>
        <div className="text-sm text-foreground-subtle">
          &copy; {new Date().getFullYear()} Human Design Enterprise
        </div>
      </div>

      {/* Panel kanan: form */}
      <div className="flex w-full flex-col items-center justify-center bg-background p-6 lg:w-1/2 lg:p-12">
        <div className="mb-8 font-display text-xl font-semibold text-foreground lg:hidden">
          Human Design <span className="text-accent">Enterprise</span>
        </div>
        <div className="w-full max-w-sm animate-fade-in">{children}</div>
      </div>
    </div>
  );
}

