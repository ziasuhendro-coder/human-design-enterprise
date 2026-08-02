'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client'; // sesuaikan path import supabase client di project kamu

const DAFTAR_PANEL = [
  { code: 'lumina', label: 'Lumina HD', desc: 'Insight tambahan dari chart Human Design', icon: '✨', href: '/id/panel/lumina' },
  { code: 'primbon', label: 'Primbon', desc: 'Weton, neptu, dan sifat hari lahir', icon: '🌙', href: '/id/panel/primbon' },
  { code: 'tarot', label: 'Tarot', desc: 'Tarik kartu, dapatkan pesan hari ini', icon: '🎴', href: '/id/panel/tarot' },
  { code: 'fengshui', label: 'Fengshui', desc: 'Kua Number dan arah keberuntungan', icon: '🧭', href: '/id/panel/fengshui' },
  { code: 'zodiak', label: 'Zodiak', desc: 'Sifat dan elemen zodiak barat kamu', icon: '♈', href: '/id/panel/zodiak' },
  { code: 'grafologi', label: 'Grafologi', desc: 'Analisis karakter dari tanda tangan', icon: '✍️', href: '/id/panel/grafologi' },
  { code: 'nomorologi', label: 'Nomorologi', desc: 'Life Path & Destiny Number dari nama', icon: '🔢', href: '/id/panel/nomorologi' },
];

export default function PanelHubPage() {
  // NOTE: pakai 'as any' karena hd_panel_access belum di lib/types/database.types.ts
  const supabase = createClient() as any;

  const [panelTerbuka, setPanelTerbuka] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    muatAksesPanel();
  }, []);

  async function muatAksesPanel() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('hd_panel_access')
      .select('panel_code, is_active, expires_at')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const sekarang = new Date();
    const kodeAktif = new Set<string>(
      (data ?? [])
        .filter((row: any) => !row.expires_at || new Date(row.expires_at) > sekarang)
        .map((row: any) => row.panel_code)
    );

    setPanelTerbuka(kodeAktif);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0d0b12] text-[#ece6da] px-5 py-8">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#a68a56] mb-1">
            Human Design Enterprise
          </p>
          <h1 className="font-serif text-3xl text-[#f4ecd8]">Panel Refleksi Diri</h1>
        </header>

        {loading ? (
          <p className="text-center text-sm text-[#5c5468]">Memuat akses panel...</p>
        ) : (
          <div className="space-y-3">
            {DAFTAR_PANEL.map((p) => {
              const terbuka = panelTerbuka.has(p.code);
              const Konten = (
                <div
                  className={`rounded-xl border px-4 py-4 flex items-center gap-4 transition ${
                    terbuka
                      ? 'border-[#332c40] bg-[#171420] active:scale-[0.98]'
                      : 'border-[#241f2e] bg-[#131019] opacity-60'
                  }`}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg text-[#f4ecd8]">{p.label}</span>
                      {!terbuka && <span className="text-xs text-[#5c5468]">🔒</span>}
                    </div>
                    <p className="text-xs text-[#8d84a0] mt-0.5">{p.desc}</p>
                  </div>
                </div>
              );

              return terbuka ? (
                <Link key={p.code} href={p.href}>
                  {Konten}
                </Link>
              ) : (
                <div key={p.code}>{Konten}</div>
              );
            })}

            {panelTerbuka.size === 0 && (
              <div className="text-center pt-6">
                <p className="text-sm text-[#8d84a0] mb-4">
                  Kamu belum punya akses ke panel manapun.
                </p>
                <Link
                  href="/id/redeem"
                  className="inline-block rounded-lg bg-[#a68a56] text-[#0d0b12] font-medium px-6 py-3"
                >
                  Tukar Kode Lisensi
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

