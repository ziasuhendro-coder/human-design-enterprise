'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // sesuaikan path import supabase client di project kamu

// =========================================================
// Data referensi Zodiak (dihitung, bukan dari database)
// =========================================================
type ZodiakInfo = {
  nama: string;
  simbol: string;
  elemen: string;
  tanggalMulai: [number, number]; // [bulan, tanggal]
  sifat: string;
};

const DAFTAR_ZODIAK: ZodiakInfo[] = [
  { nama: 'Capricorn', simbol: '♑', elemen: 'Tanah', tanggalMulai: [12, 22], sifat: 'disiplin, ambisius, bertanggung jawab, sedikit keras kepala' },
  { nama: 'Aquarius', simbol: '♒', elemen: 'Udara', tanggalMulai: [1, 20], sifat: 'independen, orisinal, humanis, kadang sulit ditebak' },
  { nama: 'Pisces', simbol: '♓', elemen: 'Air', tanggalMulai: [2, 19], sifat: 'penuh empati, imajinatif, intuitif, mudah larut dalam emosi' },
  { nama: 'Aries', simbol: '♈', elemen: 'Api', tanggalMulai: [3, 21], sifat: 'berani, penuh energi, kompetitif, kadang tidak sabaran' },
  { nama: 'Taurus', simbol: '♉', elemen: 'Tanah', tanggalMulai: [4, 20], sifat: 'setia, tekun, menyukai kenyamanan, agak keras kepala' },
  { nama: 'Gemini', simbol: '♊', elemen: 'Udara', tanggalMulai: [5, 21], sifat: 'komunikatif, ingin tahu, adaptif, kadang plin-plan' },
  { nama: 'Cancer', simbol: '♋', elemen: 'Air', tanggalMulai: [6, 21], sifat: 'penyayang, protektif, sensitif, dekat dengan keluarga' },
  { nama: 'Leo', simbol: '♌', elemen: 'Api', tanggalMulai: [7, 23], sifat: 'percaya diri, dermawan, suka jadi pusat perhatian' },
  { nama: 'Virgo', simbol: '♍', elemen: 'Tanah', tanggalMulai: [8, 23], sifat: 'teliti, praktis, perfeksionis, suka membantu' },
  { nama: 'Libra', simbol: '♎', elemen: 'Udara', tanggalMulai: [9, 23], sifat: 'menyukai keseimbangan, diplomatis, sosial, sulit mengambil keputusan' },
  { nama: 'Scorpio', simbol: '♏', elemen: 'Air', tanggalMulai: [10, 23], sifat: 'intens, penuh gairah, misterius, sulit melupakan luka' },
  { nama: 'Sagittarius', simbol: '♐', elemen: 'Api', tanggalMulai: [11, 22], sifat: 'optimis, suka petualangan, jujur blak-blakan' },
  { nama: 'Capricorn', simbol: '♑', elemen: 'Tanah', tanggalMulai: [12, 22], sifat: 'disiplin, ambisius, bertanggung jawab, sedikit keras kepala' },
];

const ELEMEN_DESKRIPSI: Record<string, string> = {
  Api: 'penuh semangat, spontan, dan mudah menyalakan motivasi orang lain',
  Tanah: 'realistis, stabil, dan mengutamakan hal-hal yang bisa diandalkan',
  Udara: 'suka berpikir, komunikatif, dan tertarik pada ide-ide baru',
  Air: 'peka terhadap perasaan, intuitif, dan mendalam secara emosional',
};

function hitungZodiak(tanggalLahir: string) {
  const target = new Date(tanggalLahir + 'T00:00:00');
  const bulan = target.getMonth() + 1;
  const tanggal = target.getDate();

  let zodiak = DAFTAR_ZODIAK[0]; // default Capricorn
  for (let i = DAFTAR_ZODIAK.length - 1; i >= 1; i--) {
    const [bMulai, tMulai] = DAFTAR_ZODIAK[i].tanggalMulai;
    if (bulan > bMulai || (bulan === bMulai && tanggal >= tMulai)) {
      zodiak = DAFTAR_ZODIAK[i];
      break;
    }
    if (bulan < bMulai) {
      zodiak = DAFTAR_ZODIAK[i - 1] ?? DAFTAR_ZODIAK[0];
    }
  }
  if (bulan === 1 && tanggal < 20) {
    zodiak = DAFTAR_ZODIAK[0];
  }

  return {
    nama: zodiak.nama,
    simbol: zodiak.simbol,
    elemen: zodiak.elemen,
    sifat: zodiak.sifat,
    deskripsiElemen: ELEMEN_DESKRIPSI[zodiak.elemen],
  };
}

type HasilZodiak = ReturnType<typeof hitungZodiak>;

export default function ZodiakPanelPage() {
  // NOTE: tabel hd_zodiak_data belum ada di lib/types/database.types.ts (belum di-generate ulang)
  const supabase = createClient() as any;

  const [tanggalLahir, setTanggalLahir] = useState('');
  const [hasil, setHasil] = useState<HasilZodiak | null>(null);
  const [saving, setSaving] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);

  function hitung() {
    if (!tanggalLahir) return;
    setHasil(hitungZodiak(tanggalLahir));
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

    const { error } = await supabase.from('hd_zodiak_data').insert({
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
          <h1 className="font-serif text-3xl text-[#f4ecd8]">Zodiak</h1>
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
            Lihat Zodiak
          </button>
        </div>

        {/* ---------------- HASIL ---------------- */}
        {hasil && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#a68a56] bg-[#221c2c] px-5 py-6 text-center">
              <p className="text-4xl mb-2">{hasil.simbol}</p>
              <p className="font-serif text-2xl text-[#f4ecd8]">{hasil.nama}</p>
              <p className="text-sm text-[#c9bfa8] mt-1">Elemen {hasil.elemen}</p>
            </div>

            <div className="rounded-lg border border-[#332c40] bg-[#171420] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">
                Karakter {hasil.nama}
              </p>
              <p className="text-sm text-[#c9bfa8]">{hasil.sifat}</p>
            </div>

            <div className="rounded-lg border border-[#332c40] bg-[#171420] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">
                Elemen {hasil.elemen}
              </p>
              <p className="text-sm text-[#c9bfa8]">{hasil.deskripsiElemen}</p>
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

