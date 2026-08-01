'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // sesuaikan path import supabase client di project kamu

// =========================================================
// Data referensi Nomorologi (dihitung, bukan dari database)
// =========================================================
const PETA_HURUF: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const ANGKA_MASTER = [11, 22, 33];

const MAKNA_ANGKA: Record<number, string> = {
  1: 'pemimpin alami, mandiri, penuh inisiatif, suka memulai hal baru',
  2: 'diplomatis, kooperatif, peka terhadap perasaan orang lain',
  3: 'ekspresif, kreatif, komunikator alami, menyukai keceriaan',
  4: 'pekerja keras, disiplin, praktis, dapat diandalkan',
  5: 'menyukai kebebasan, adaptif, suka perubahan dan petualangan',
  6: 'penuh tanggung jawab, penyayang, berorientasi keluarga dan komunitas',
  7: 'analitis, reflektif, tertarik pada hal spiritual dan pengetahuan dalam',
  8: 'ambisius, berorientasi pada kekuasaan dan pencapaian materi',
  9: 'humanis, dermawan, berpandangan luas, peduli pada sesama',
  11: 'angka master — intuisi sangat tajam, inspiratif, visioner spiritual',
  22: 'angka master — pembangun besar, mampu mewujudkan visi jadi kenyataan nyata',
  33: 'angka master — pengasuh sejati, penuh kasih, berdedikasi pada kebaikan orang lain',
};

function reduksiAngka(nilai: number): number {
  while (nilai > 9 && !ANGKA_MASTER.includes(nilai)) {
    nilai = String(nilai)
      .split('')
      .reduce((total, digit) => total + parseInt(digit, 10), 0);
  }
  return nilai;
}

function hitungLifePath(tanggalLahir: string): number {
  const digitSaja = tanggalLahir.replace(/-/g, '');
  const jumlah = digitSaja
    .split('')
    .reduce((total, digit) => total + parseInt(digit, 10), 0);
  return reduksiAngka(jumlah);
}

function hitungDestiny(namaLengkap: string): number {
  const hurufSaja = namaLengkap.toUpperCase().replace(/[^A-Z]/g, '');
  const jumlah = hurufSaja
    .split('')
    .reduce((total, huruf) => total + (PETA_HURUF[huruf] ?? 0), 0);
  return reduksiAngka(jumlah);
}

function hitungNomorologi(namaLengkap: string, tanggalLahir: string) {
  const lifePath = hitungLifePath(tanggalLahir);
  const destiny = hitungDestiny(namaLengkap);

  return {
    lifePath,
    destiny,
    maknaLifePath: MAKNA_ANGKA[lifePath],
    maknaDestiny: MAKNA_ANGKA[destiny],
  };
}

type HasilNomorologi = ReturnType<typeof hitungNomorologi>;

export default function NomorologiPanelPage() {
  // NOTE: tabel hd_numerologi_data belum ada di lib/types/database.types.ts (belum di-generate ulang)
  const supabase = createClient() as any;

  const [namaLengkap, setNamaLengkap] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [hasil, setHasil] = useState<HasilNomorologi | null>(null);
  const [saving, setSaving] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);

  function hitung() {
    if (!namaLengkap.trim() || !tanggalLahir) return;
    setHasil(hitungNomorologi(namaLengkap, tanggalLahir));
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

    const { error } = await supabase.from('hd_numerologi_data').insert({
      user_id: user.id,
      input_data: { nama_lengkap: namaLengkap, tanggal_lahir: tanggalLahir },
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
          <h1 className="font-serif text-3xl text-[#f4ecd8]">Nomorologi</h1>
        </header>

        {/* ---------------- INPUT ---------------- */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-[#c9bfa8] mb-2">Nama lengkap (sesuai akta lahir)</label>
            <input
              type="text"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Contoh: Suhendro Wijaya"
              className="w-full rounded-lg bg-[#171420] border border-[#332c40] px-4 py-3 text-sm placeholder:text-[#5c5468] focus:outline-none focus:ring-1 focus:ring-[#a68a56]"
            />
          </div>

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
            disabled={!namaLengkap.trim() || !tanggalLahir}
            className="w-full rounded-lg bg-[#a68a56] text-[#0d0b12] font-medium py-3 disabled:opacity-50"
          >
            Hitung Angka Kehidupan
          </button>
        </div>

        {/* ---------------- HASIL ---------------- */}
        {hasil && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#a68a56] bg-[#221c2c] px-5 py-6 text-center">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">
                Life Path Number
              </p>
              <p className="font-serif text-4xl text-[#f4ecd8]">{hasil.lifePath}</p>
              <p className="text-sm text-[#c9bfa8] mt-2">{hasil.maknaLifePath}</p>
            </div>

            <div className="rounded-lg border border-[#332c40] bg-[#171420] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">
                Destiny Number (dari nama)
              </p>
              <p className="font-serif text-2xl text-[#f4ecd8] mb-1">{hasil.destiny}</p>
              <p className="text-sm text-[#c9bfa8]">{hasil.maknaDestiny}</p>
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

