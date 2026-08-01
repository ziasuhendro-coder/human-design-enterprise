'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client'; // sesuaikan path import supabase client di project kamu

type HasilGrafologi = {
  tekanan: string;
  kemiringan: string;
  ukuran: string;
  kesan_karakter: string;
};

export default function GrafologiPanelPage() {
  // NOTE: tabel hd_grafologi_readings belum ada di lib/types/database.types.ts (belum di-generate ulang)
  const supabase = createClient() as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasil, setHasil] = useState<HasilGrafologi | null>(null);
  const [saving, setSaving] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setHasil(null);
    setTersimpan(false);
    setError(null);
  }

  function fileKeBase64(file: File): Promise<{ base64: string; mediaType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, mediaType: file.type });
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  }

  async function analisisTandaTangan() {
    if (!imageFile) return;
    setAnalyzing(true);
    setError(null);

    try {
      const { base64, mediaType } = await fileKeBase64(imageFile);

      const res = await fetch('/api/grafologi/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Gagal menganalisis tanda tangan.');
        setAnalyzing(false);
        return;
      }

      setHasil(data.hasil);
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function simpanHasil() {
    if (!hasil || !imageFile) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Sesi login tidak ditemukan.');
      setSaving(false);
      return;
    }

    // Upload foto ke Supabase Storage bucket 'hd-signatures'
    const namaFile = `${user.id}/${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('hd-signatures')
      .upload(namaFile, imageFile);

    if (uploadError) {
      alert('Gagal mengunggah foto.');
      setSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('hd-signatures').getPublicUrl(namaFile);

    const { error: insertError } = await supabase.from('hd_grafologi_readings').insert({
      user_id: user.id,
      image_url: urlData.publicUrl,
      result_data: hasil,
    });

    setSaving(false);
    if (insertError) {
      alert('Gagal menyimpan hasil.');
      return;
    }
    setTersimpan(true);
  }

  function ulangiDariAwal() {
    setImageFile(null);
    setPreviewUrl(null);
    setHasil(null);
    setTersimpan(false);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-[#0d0b12] text-[#ece6da] px-5 py-8">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#a68a56] mb-1">
            Human Design Enterprise
          </p>
          <h1 className="font-serif text-3xl text-[#f4ecd8]">Grafologi</h1>
          <p className="text-xs text-[#8d84a0] mt-2 italic">
            Untuk hiburan &amp; refleksi diri, bukan diagnosis psikologis
          </p>
        </header>

        {/* ---------------- INPUT FOTO ---------------- */}
        {!hasil && (
          <div className="space-y-4">
            {previewUrl ? (
              <div className="rounded-lg border border-[#332c40] bg-white p-4">
                <img src={previewUrl} alt="Preview tanda tangan" className="w-full h-auto rounded" />
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-[#332c40] bg-[#171420] py-12 text-center"
              >
                <p className="text-3xl mb-2">✍️</p>
                <p className="text-sm text-[#c9bfa8]">Ketuk untuk ambil foto atau unggah</p>
                <p className="text-xs text-[#5c5468] mt-1">Tanda tangan di kertas putih polos, pencahayaan cukup</p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={pilihFoto}
              className="hidden"
            />

            {previewUrl && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg border border-[#332c40] text-[#c9bfa8] py-2 text-sm"
              >
                Ganti Foto
              </button>
            )}

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              onClick={analisisTandaTangan}
              disabled={!imageFile || analyzing}
              className="w-full rounded-lg bg-[#a68a56] text-[#0d0b12] font-medium py-3 disabled:opacity-50"
            >
              {analyzing ? 'Menganalisis...' : 'Analisis Tanda Tangan'}
            </button>
          </div>
        )}

        {/* ---------------- HASIL ---------------- */}
        {hasil && (
          <div className="space-y-4">
            {previewUrl && (
              <div className="rounded-lg border border-[#332c40] bg-white p-3">
                <img src={previewUrl} alt="Tanda tangan" className="w-full h-auto rounded max-h-40 object-contain" />
              </div>
            )}

            <div className="rounded-lg border border-[#332c40] bg-[#171420] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">Tekanan</p>
              <p className="text-sm text-[#c9bfa8]">{hasil.tekanan}</p>
            </div>
            <div className="rounded-lg border border-[#332c40] bg-[#171420] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">Kemiringan</p>
              <p className="text-sm text-[#c9bfa8]">{hasil.kemiringan}</p>
            </div>
            <div className="rounded-lg border border-[#332c40] bg-[#171420] px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-1">Ukuran</p>
              <p className="text-sm text-[#c9bfa8]">{hasil.ukuran}</p>
            </div>
            <div className="rounded-xl border border-[#a68a56] bg-[#221c2c] px-5 py-5">
              <p className="text-xs uppercase tracking-widest text-[#8d84a0] mb-2">Kesan Karakter</p>
              <p className="text-sm text-[#f4ecd8]">{hasil.kesan_karakter}</p>
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

            <button
              onClick={ulangiDariAwal}
              className="w-full rounded-lg text-[#8d84a0] py-2 text-sm"
            >
              Analisis Tanda Tangan Lain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

