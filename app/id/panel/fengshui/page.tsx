'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // sesuaikan path import supabase client di project kamu

// =========================================================
// Data referensi Fengshui / Kua Number (dihitung, bukan dari database)
// =========================================================
type KuaInfo = {
  kua: number;
  kelompok: 'Timur' | 'Barat';
  elemen: string;
  arahBaik: string[];
  arahTerbaik: string;
  arahBuruk: string[];
  arahTerburuk: string;
};

const DATA_KUA: Record<number, KuaInfo> = {
  1: { kua: 1, kelompok: 'Timur', elemen: 'Air', arahBaik: ['Tenggara', 'Timur', 'Selatan', 'Utara'], arahTerbaik: 'Tenggara', arahBuruk: ['Barat', 'Timur Laut', 'Barat Laut', 'Barat Daya'], arahTerburuk: 'Barat Daya' },
  2: { kua: 2, kelompok: 'Barat', elemen: 'Tanah', arahBaik: ['Timur Laut', 'Barat', 'Barat Laut', 'Barat Daya'], arahTerbaik: 'Timur Laut', arahBuruk: ['Timur', 'Utara', 'Selatan', 'Tenggara'], arahTerburuk: 'Tenggara' },
  3: { kua: 3, kelompok: 'Timur', elemen: 'Kayu', arahBaik: ['Selatan', 'Utara', 'Tenggara', 'Timur'], arahTerbaik: 'Selatan', arahBuruk: ['Barat Laut', 'Barat Daya', 'Barat', 'Timur Laut'], arahTerburuk: 'Timur Laut' },
  4: { kua: 4, kelompok: 'Timur', elemen: 'Kayu', arahBaik: ['Utara', 'Selatan', 'Timur', 'Tenggara'], arahTerbaik: 'Utara', arahBuruk: ['Barat Daya', 'Barat Laut', 'Timur Laut', 'Barat'], arahTerburuk: 'Barat' },
  6: { kua: 6, kelompok: 'Barat', elemen: 'Logam', arahBaik: ['Barat', 'Timur Laut', 'Barat Daya', 'Barat Laut'], arahTerbaik: 'Barat', arahBuruk: ['Selatan', 'Tenggara', 'Timur', 'Utara'], arahTerburuk: 'Utara' },
  7: { kua: 7, kelompok: 'Barat', elemen: 'Logam', arahBaik: ['Barat Laut', 'Barat Daya', 'Timur Laut', 'Barat'], arahTerbaik: 'Barat Laut', arahBuruk: ['Utara', 'Timur', 'Tenggara', 'Selatan'], arahTerburuk: 'Selatan' },
  8: { kua: 8, kelompok: 'Barat', elemen: 'Tanah', arahBaik: ['Barat Daya', 'Barat Laut', 'Barat', 'Timur Laut'], arahTerbaik: 'Barat Daya', arahBuruk: ['Tenggara', 'Selatan', 'Utara', 'Timur'], arahTerburuk: 'Timur' },
  9: { kua: 9, kelompok: 'Timur', elemen: 'Api', arahBaik: ['Timur', 'Tenggara', 'Utara', 'Selatan'], arahTerbaik: 'Timur', arahBuruk: ['Barat Laut', 'Barat Daya', 'Barat', 'Timur Laut'], arahTerburuk: 'Barat' },
};

function hitungKua(tanggalLahir: string, jenisKelamin: 'pria' | 'wanita') {
  const tahun = new Date(tanggalLahir + 'T00:00:00').getFullYear();
  const duaDigit = tahun % 100;
  let jumlah = Math.floor(duaDigit / 10) + (duaDigit % 10);
  while (jumlah > 9) {
    jumlah = Math.floor(jumlah / 10) + (jumlah % 10);
  }

  let kuaMentah: number;
  if (jenisKelamin === 'pria') {
    kuaMentah = tahun >= 2000 ? 9 - jumlah : 10 - jumlah;
    if (kuaMentah === 0) kuaMentah = 9;
  } else {
    kuaMentah = tahun >= 2000 ? jumlah + 6 : jumlah + 5;
    while (kuaMentah > 9) {
      kuaMentah = Math.floor(kuaMentah / 10) + (kuaMentah % 10);
    }
  }

  // Kua 5 tidak dipakai, dikonversi
  if (kuaMentah === 5) {
    kuaMentah = jenisKelamin === 'pria' ? 2 : 8;
  }

  return DATA_KUA[kuaMentah];
}

type HasilFengshui = ReturnType<typeof hitungKua>;

export default function FengshuiPanelPage() {
  // NOTE: tabel hd_fengshui_results belum ada di lib/types/database.types.ts (belum di-generate ulang)
  const supabase = createClient() as any;

  const [tanggalLahir, setTanggalLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'pria' | 'wanita'>('pria');
  const [hasil, setHasil] = useState<HasilFengshui | null>(null);
  const [saving, setSaving] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);

  function hitung() {
    if (!tanggalLahir) return;
    setHasil(hitungKua(tanggalLahir, jenisKelamin));
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

    const { error } = await supabase.from('hd_fengshui_results').insert({
      user_id: user.id,
      input_data: { tanggal_lahir: tanggalLahir, jenis_kelamin: jenisKelamin },
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
          <h1 className="font-serif text-3xl text-[#f4ecd8]">Fengshui - Kua Number</h1>
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

          <div>
            <label className="block text-sm text-[#c9bfa8] mb-2">Jenis kelamin</label>
            <div className="flex gap-2">
              {(['pria', 'wanita'] as const).map((jk) => (
                <button
                  key={jk}
                  onClick={() => setJenisKelamin(jk)}
                  className={`flex-1 rounded-lg border py-3 text-sm capitalize transition ${
                    jenisKelamin === jk
                      ? 'border-[#a68a56] bg-[#221c2c] text-[#f4ecd8]'
                      : 'border-[#332c40] bg-[#171420] text-[#c9bfa8]'
                  }`}
                >
                  {jk}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={hitung}
            disabled={!tanggalLahir}
            className="w-full rounded-lg bg-[#a68a56] text-[#0d0b12] font-medium py-3 disabled:opacity-50"
          >
            Hitung Kua Number
          </button>
        </div>

        {/* ---------------- HASIL ---------------- */}
        {hasil && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#a68a56] bg-[#221c2c] px-5 py-6 text-center">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">
                Kua Number Kamu
              </p>
              <p className="font-serif text-4xl text-[#f4ecd8]">{hasil.kua}</p>
              <p className="text-sm text-[#c9bfa8] mt-1">
                Kelompok {hasil.kelompok} · Elemen {hasil.elemen}
              </p>
            </div>

            <div className="rounded-lg border border-[#3d5c46] bg-[#182219] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8fb89a] mb-1">
                Arah Terbaik (Sheng Chi)
              </p>
              <p className="text-sm text-[#c9bfa8]">{hasil.arahTerbaik}</p>
              <p className="text-xs text-[#8d84a0] mt-2">
                4 arah baik lainnya: {hasil.arahBaik.join(', ')}
              </p>
            </div>

            <div className="rounded-lg border border-[#5c3d3d] bg-[#221818] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#b88f8f] mb-1">
                Arah Paling Dihindari (Chueh Ming)
              </p>
              <p className="text-sm text-[#c9bfa8]">{hasil.arahTerburuk}</p>
              <p className="text-xs text-[#8d84a0] mt-2">
                Arah kurang baik lainnya: {hasil.arahBuruk.join(', ')}
              </p>
            </div>

            <p className="text-xs text-[#5c5468] text-center italic">
              Gunakan arah baik saat tidur, bekerja, atau menghadap pintu utama untuk hasil maksimal.
            </p>

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
