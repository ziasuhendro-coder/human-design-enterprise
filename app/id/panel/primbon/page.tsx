'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // sesuaikan path import supabase client di project kamu

// =========================================================
// Data referensi Primbon (dihitung, bukan dari database)
// =========================================================
const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NEPTU_HARI: Record<string, number> = {
  Minggu: 5, Senin: 4, Selasa: 3, Rabu: 7, Kamis: 8, Jumat: 6, Sabtu: 9,
};
const SIFAT_HARI: Record<string, string> = {
  Minggu: 'berwibawa, mudah bergaul, sedikit keras kepala',
  Senin: 'perasa, penyabar, mudah simpati pada orang lain',
  Selasa: 'berani, tegas, sedikit temperamen',
  Rabu: 'cerdas, banyak akal, mudah beradaptasi',
  Kamis: 'bijaksana, suka menolong, disegani',
  Jumat: 'lembut hati, penyayang, mudah iba',
  Sabtu: 'pekerja keras, teguh pendirian, agak keras kepala',
};

const PASARAN_URUT = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
const NEPTU_PASARAN: Record<string, number> = {
  Legi: 5, Pahing: 9, Pon: 7, Wage: 4, Kliwon: 8,
};
const SIFAT_PASARAN: Record<string, string> = {
  Legi: 'ramah, terbuka, mudah disukai orang banyak',
  Pahing: 'ambisius, pekerja keras, sedikit tergesa-gesa',
  Pon: 'tenang, bertanggung jawab, dipercaya banyak orang',
  Wage: 'pendiam, teliti, pemikir mendalam',
  Kliwon: 'penuh misteri, intuisi kuat, peka terhadap hal gaib',
};

// Anchor: 17 Agustus 1945 = Jumat Legi (fakta historis, dipakai sebagai titik acuan hitungan)
const ANCHOR_DATE = new Date('1945-08-17T00:00:00');
const ANCHOR_PASARAN_INDEX = 0; // Legi

function hitungWeton(tanggalLahir: string) {
  const target = new Date(tanggalLahir + 'T00:00:00');
  const namaHari = NAMA_HARI[target.getDay()];

  const selisihHari = Math.round(
    (target.getTime() - ANCHOR_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  const pasaranIndex = ((selisihHari % 5) + 5 + ANCHOR_PASARAN_INDEX) % 5;
  const namaPasaran = PASARAN_URUT[pasaranIndex];

  const neptuHari = NEPTU_HARI[namaHari];
  const neptuPasaran = NEPTU_PASARAN[namaPasaran];
  const totalNeptu = neptuHari + neptuPasaran;

  return {
    namaHari,
    namaPasaran,
    neptuHari,
    neptuPasaran,
    totalNeptu,
    weton: `${namaHari} ${namaPasaran}`,
    sifatHari: SIFAT_HARI[namaHari],
    sifatPasaran: SIFAT_PASARAN[namaPasaran],
  };
}

type HasilWeton = ReturnType<typeof hitungWeton>;

export default function PrimbonPanelPage() {
  // NOTE: tabel hd_primbon_data belum ada di lib/types/database.types.ts (belum di-generate ulang)
  const supabase = createClient() as any;

  const [tanggalLahir, setTanggalLahir] = useState('');
  const [hasil, setHasil] = useState<HasilWeton | null>(null);
  const [saving, setSaving] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);

  function hitung() {
    if (!tanggalLahir) return;
    setHasil(hitungWeton(tanggalLahir));
    setTersimpan(false);
  }

  async function simpanHasil() {
    if (!hasil) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Sesi login tidak ditemukan.');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('hd_primbon_data').insert({
      user_id: user.id,
      input_data: { tanggal_lahir: tanggalLahir },
      result_data: hasil,
    });

    setSaving(false);
    if (error) {
      alert('Gagal menyimpan hasil.');
      return;
    }
    setTersimpan(true);
  }

  return (
    <div className="min-h-screen bg-[#0d0b12] text-[#ece6da] px-5 py-8">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#a68a56] mb-1">
            Human Design Enterprise
          </p>
          <h1 className="font-serif text-3xl text-[#f4ecd8]">Primbon Jawa</h1>
        </header>

        {/* ---------------- INPUT ---------------- */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-[#c9bfa8] mb-2">Tanggal lahir</label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="w-full rounded-lg bg-[#171420] border border-[#332c40] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#a68a56]"
            />
          </div>

          <button
            onClick={hitung}
            disabled={!tanggalLahir}
            className="w-full rounded-lg bg-[#a68a56] text-[#0d0b12] font-medium py-3 disabled:opacity-50"
          >
            Hitung Weton
          </button>
        </div>

        {/* ---------------- HASIL ---------------- */}
        {hasil && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#a68a56] bg-[#221c2c] px-5 py-5 text-center">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">
                Weton Kamu
              </p>
              <p className="font-serif text-2xl text-[#f4ecd8]">{hasil.weton}</p>
              <p className="text-sm text-[#c9bfa8] mt-1">
                Neptu {hasil.neptuHari} + {hasil.neptuPasaran} = {hasil.totalNeptu}
              </p>
            </div>

            <div className="rounded-lg border border-[#332c40] bg-[#171420] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">
                Sifat hari {hasil.namaHari}
              </p>
              <p className="text-sm text-[#c9bfa8]">{hasil.sifatHari}</p>
            </div>

            <div className="rounded-lg border border-[#332c40] bg-[#171420] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">
                Sifat pasaran {hasil.namaPasaran}
              </p>
              <p className="text-sm text-[#c9bfa8]">{hasil.sifatPasaran}</p>
            </div>

            {!tersimpan ? (
              <button
                onClick={simpanHasil}
                disabled={saving}
                className="w-full rounded-lg border border-[#a68a56] text-[#a68a56] font-medium py-3 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Hasil'}
              </button>
            ) : (
              <p className="text-center text-sm text-[#8d84a0]">✓ Tersimpan di riwayat</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

