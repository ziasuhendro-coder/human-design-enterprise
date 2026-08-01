'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; // sesuaikan path import supabase client di project kamu

const SEMUA_PANEL = [
  { code: 'lumina', label: 'Lumina HD' },
  { code: 'primbon', label: 'Primbon' },
  { code: 'tarot', label: 'Tarot' },
  { code: 'fengshui', label: 'Fengshui' },
  { code: 'zodiak', label: 'Zodiak' },
  { code: 'grafologi', label: 'Grafologi' },
  { code: 'nomorologi', label: 'Nomorologi' },
];

const JENIS_LISENSI = [
  { value: 'trial', label: 'Trial (7 hari)', hari: 7 },
  { value: '1_month', label: '1 Bulan', hari: 30 },
  { value: '6_month', label: '6 Bulan', hari: 180 },
  { value: '1_year', label: '1 Tahun', hari: 365 },
  { value: 'permanent', label: 'Permanen', hari: 36500 },
];

function generateKode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa 0/O/1/I biar tidak rancu
  const bagian = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `HDE-${bagian()}-${bagian()}`;
}

export default function X9PanelPage() {
  // NOTE: pakai 'as any' karena panel_codes & beberapa tabel belum di lib/types/database.types.ts
  const supabase = createClient() as any;

  const [licenseType, setLicenseType] = useState('1_month');
  const [panelDipilih, setPanelDipilih] = useState<string[]>([]); // kosong = all-access
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [kodeBaru, setKodeBaru] = useState<string | null>(null);
  const [daftarLisensi, setDaftarLisensi] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    muatDaftarLisensi();
  }, []);

  async function muatDaftarLisensi() {
    setLoadingList(true);
    const { data } = await supabase
      .from('hd_licenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    setDaftarLisensi(data ?? []);
    setLoadingList(false);
  }

  function toggelPanel(code: string) {
    setPanelDipilih((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  }

  async function generateLisensi() {
    setGenerating(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Sesi login tidak ditemukan.');
      setGenerating(false);
      return;
    }

    const jenis = JENIS_LISENSI.find((j) => j.value === licenseType)!;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + jenis.hari);

    const kode = generateKode();

    const { error: insertError } = await supabase.from('hd_licenses').insert({
      code: kode,
      license_type: licenseType,
      status: 'active',
      assigned_by: user.id,
      expires_at: expiresAt.toISOString(),
      panel_codes: panelDipilih.length > 0 ? panelDipilih : null,
      notes: notes || null,
    });

    setGenerating(false);

    if (insertError) {
      setError('Gagal generate lisensi: ' + insertError.message);
      return;
    }

    setKodeBaru(kode);
    setNotes('');
    muatDaftarLisensi();
  }

  return (
    <div className="min-h-screen bg-[#0d0b12] text-[#ece6da] px-5 py-8">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#a68a56] mb-1">
            Master Panel
          </p>
          <h1 className="font-serif text-3xl text-[#f4ecd8]">Generate Lisensi</h1>
        </header>

        {/* ---------------- FORM GENERATE ---------------- */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm text-[#c9bfa8] mb-2">Jenis lisensi</label>
            <div className="grid grid-cols-2 gap-2">
              {JENIS_LISENSI.map((j) => (
                <button
                  key={j.value}
                  onClick={() => setLicenseType(j.value)}
                  className={`rounded-lg border py-2 text-xs transition ${
                    licenseType === j.value
                      ? 'border-[#a68a56] bg-[#221c2c] text-[#f4ecd8]'
                      : 'border-[#332c40] bg-[#171420] text-[#c9bfa8]'
                  }`}
                >
                  {j.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#c9bfa8] mb-2">
              Panel yang dibuka (kosongkan = semua panel)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SEMUA_PANEL.map((p) => (
                <button
                  key={p.code}
                  onClick={() => toggelPanel(p.code)}
                  className={`rounded-lg border py-2 text-xs transition ${
                    panelDipilih.includes(p.code)
                      ? 'border-[#a68a56] bg-[#221c2c] text-[#f4ecd8]'
                      : 'border-[#332c40] bg-[#171420] text-[#c9bfa8]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#c9bfa8] mb-2">Catatan (opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Untuk pelanggan A, promo bulan Agustus"
              className="w-full rounded-lg bg-[#171420] border border-[#332c40] px-4 py-3 text-sm placeholder:text-[#5c5468] focus:outline-none focus:ring-1 focus:ring-[#a68a56]"
            />
          </div>

          <button
            onClick={generateLisensi}
            disabled={generating}
            className="w-full rounded-lg bg-[#a68a56] text-[#0d0b12] font-medium py-3 disabled:opacity-50"
          >
            {generating ? 'Membuat...' : 'Generate Kode Lisensi'}
          </button>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          {kodeBaru && (
            <div className="rounded-xl border border-[#a68a56] bg-[#221c2c] px-5 py-5 text-center">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">
                Kode Baru Dibuat
              </p>
              <p className="font-mono text-xl text-[#f4ecd8] tracking-wider">{kodeBaru}</p>
            </div>
          )}
        </div>

        {/* ---------------- DAFTAR LISENSI ---------------- */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-3">
            30 Lisensi Terbaru
          </p>
          {loadingList ? (
            <p className="text-sm text-[#5c5468]">Memuat...</p>
          ) : (
            <div className="space-y-2">
              {daftarLisensi.map((lic) => (
                <div
                  key={lic.id}
                  className="rounded-lg border border-[#332c40] bg-[#171420] px-4 py-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm text-[#f4ecd8]">{lic.code}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        lic.assigned_user_id
                          ? 'bg-[#3d5c46] text-[#8fb89a]'
                          : 'bg-[#332c40] text-[#c9bfa8]'
                      }`}
                    >
                      {lic.assigned_user_id ? 'Terpakai' : 'Belum dipakai'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8d84a0] mt-1">
                    {lic.license_type} · {lic.panel_codes ? lic.panel_codes.join(', ') : 'Semua panel'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
