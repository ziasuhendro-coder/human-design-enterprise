'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // sesuaikan path import supabase client di project kamu

const NAMA_PANEL: Record<string, string> = {
  lumina: 'Lumina HD',
  primbon: 'Primbon',
  tarot: 'Tarot',
  fengshui: 'Fengshui',
  zodiak: 'Zodiak',
  grafologi: 'Grafologi',
  nomorologi: 'Nomorologi',
};

export default function RedeemLisensiPage() {
  const supabase = createClient() as any;

  const [kode, setKode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelTerbuka, setPanelTerbuka] = useState<string[] | null>(null);

  async function tukarKode() {
    if (!kode.trim()) return;
    setLoading(true);
    setError(null);
    setPanelTerbuka(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError('Kamu harus login dulu.');
      setLoading(false);
      return;
    }

    const { data, error: fnError } = await supabase.functions.invoke('redeem-license-key', {
      body: { code: kode.trim() },
    });

    setLoading(false);

    if (fnError || data?.error) {
      setError(data?.error ?? 'Gagal menukar kode lisensi.');
      return;
    }

    setPanelTerbuka(data.panels_granted ?? []);
    setKode('');
  }

  return (
    <div className="min-h-screen bg-[#0d0b12] text-[#ece6da] px-5 py-8">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#a68a56] mb-1">
            Human Design Enterprise
          </p>
          <h1 className="font-serif text-3xl text-[#f4ecd8]">Tukar Kode Lisensi</h1>
        </header>

        {!panelTerbuka ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#c9bfa8] mb-2">Kode lisensi</label>
              <input
                type="text"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                placeholder="HDE-XXXX-XXXX"
                className="w-full rounded-lg bg-[#171420] border border-[#332c40] px-4 py-3 text-sm font-mono tracking-wider placeholder:text-[#5c5468] placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-1 focus:ring-[#a68a56]"
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              onClick={tukarKode}
              disabled={!kode.trim() || loading}
              className="w-full rounded-lg bg-[#a68a56] text-[#0d0b12] font-medium py-3 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Tukar Kode'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-[#3d5c46] bg-[#182219] px-5 py-6">
              <p className="text-2xl mb-2">✓</p>
              <p className="font-serif text-xl text-[#f4ecd8] mb-3">Lisensi Berhasil Diaktifkan</p>
              <div className="space-y-1 text-left">
                {panelTerbuka.map((p) => (
                  <p key={p} className="text-sm text-[#8fb89a]">
                    ✓ {NAMA_PANEL[p] ?? p}
                  </p>
                ))}
              </div>
            </div>
            <p className="text-xs text-[#8d84a0]">
              Panel-panel di atas sudah bisa kamu akses sekarang.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

