'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // sesuaikan path import supabase client di project kamu

// =========================================================
// Tipe data
// =========================================================
type TarotCard = {
  id: string;
  card_name: string;
  arcana_type: string;
  meaning_upright: string;
  meaning_reversed: string;
  image_url: string | null;
};

type DrawnCard = {
  card: TarotCard;
  reversed: boolean;
  revealed: boolean;
};

const SPREAD_OPTIONS = [
  { count: 1, label: '1 Kartu', desc: 'Fokus hari ini' },
  { count: 3, label: '3 Kartu', desc: 'Masa Lalu · Kini · Masa Depan' },
  { count: 5, label: '5 Kartu', desc: 'Situasi lengkap' },
];

export default function TarotPanelPage() {
  // NOTE: tabel hd_tarot_cards & hd_tarot_readings belum ada di lib/types/database.types.ts
  // (belum di-generate ulang). Pakai 'as any' sementara supaya build tidak gagal.
  // Setelah types di-generate ulang nanti, 'as any' ini boleh dihapus.
  const supabase = createClient() as any;

  const [step, setStep] = useState<'pilih' | 'menarik' | 'selesai'>('pilih');
  const [spreadCount, setSpreadCount] = useState<number>(3);
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------
  // Mulai sesi: ambil kartu random dari hd_tarot_cards
  // ---------------------------------------------------------
  async function mulaiMenarikKartu() {
    setLoading(true);
    const { data: allCards, error } = await supabase
      .from('hd_tarot_cards')
      .select('*');

    if (error || !allCards || allCards.length === 0) {
      alert('Gagal memuat dek kartu. Coba lagi.');
      setLoading(false);
      return;
    }

    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, spreadCount).map((card) => ({
      card: card as TarotCard,
      reversed: Math.random() < 0.5,
      revealed: false,
    }));

    setDrawnCards(selected);
    setStep('menarik');
    setLoading(false);
  }

  // ---------------------------------------------------------
  // Balik satu kartu (progresif, satu per satu)
  // ---------------------------------------------------------
  function bukaKartu(index: number) {
    setDrawnCards((prev) =>
      prev.map((dc, i) => (i === index ? { ...dc, revealed: true } : dc))
    );
  }

  const semuaTerbuka = drawnCards.length > 0 && drawnCards.every((dc) => dc.revealed);
  const kartuBerikutnyaIndex = drawnCards.findIndex((dc) => !dc.revealed);

  // ---------------------------------------------------------
  // Simpan hasil ke hd_tarot_readings
  // ---------------------------------------------------------
  async function simpanHasil() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Sesi login tidak ditemukan.');
      setSaving(false);
      return;
    }

    const result_data = drawnCards.map((dc, i) => ({
      posisi: i + 1,
      nama_kartu: dc.card.card_name,
      terbalik: dc.reversed,
      makna: dc.reversed ? dc.card.meaning_reversed : dc.card.meaning_upright,
    }));

    const { error } = await supabase.from('hd_tarot_readings').insert({
      user_id: user.id,
      input_data: { pertanyaan: question, jumlah_kartu: spreadCount },
      result_data,
    });

    setSaving(false);
    if (error) {
      alert('Gagal menyimpan hasil pembacaan.');
      return;
    }
    setStep('selesai');
  }

  function ulangiDariAwal() {
    setDrawnCards([]);
    setQuestion('');
    setStep('pilih');
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="min-h-screen bg-[#0d0b12] text-[#ece6da] px-5 py-8">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#a68a56] mb-1">
            Human Design Enterprise
          </p>
          <h1 className="font-serif text-3xl text-[#f4ecd8]">Meja Tarot</h1>
        </header>

        {/* ---------------- STEP: PILIH ---------------- */}
        {step === 'pilih' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#c9bfa8] mb-2">
                Apa yang ingin kamu tanyakan? (opsional)
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Contoh: Bagaimana arah kariermu bulan ini?"
                className="w-full rounded-lg bg-[#171420] border border-[#332c40] px-4 py-3 text-sm placeholder:text-[#5c5468] focus:outline-none focus:ring-1 focus:ring-[#a68a56]"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-[#c9bfa8] mb-2">Pilih jumlah kartu</p>
              {SPREAD_OPTIONS.map((opt) => (
                <button
                  key={opt.count}
                  onClick={() => setSpreadCount(opt.count)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition ${
                    spreadCount === opt.count
                      ? 'border-[#a68a56] bg-[#221c2c]'
                      : 'border-[#332c40] bg-[#171420]'
                  }`}
                >
                  <span className="font-medium text-[#f4ecd8]">{opt.label}</span>
                  <span className="block text-xs text-[#8d84a0]">{opt.desc}</span>
                </button>
              ))}
            </div>

            <button
              onClick={mulaiMenarikKartu}
              disabled={loading}
              className="w-full rounded-lg bg-[#a68a56] text-[#0d0b12] font-medium py-3 disabled:opacity-50"
            >
              {loading ? 'Mengocok kartu...' : 'Kocok & Tarik Kartu'}
            </button>
          </div>
        )}

        {/* ---------------- STEP: MENARIK (progresif) ---------------- */}
        {step === 'menarik' && (
          <div className="space-y-4">
            {question && (
              <p className="text-xs text-[#8d84a0] text-center italic mb-2">
                “{question}”
              </p>
            )}

            {drawnCards.map((dc, i) => {
              const bisaDibuka = i === kartuBerikutnyaIndex;
              const terkunci = !dc.revealed && !bisaDibuka;

              return (
                <button
                  key={i}
                  onClick={() => bisaDibuka && bukaKartu(i)}
                  disabled={!bisaDibuka && !dc.revealed}
                  className={`w-full text-left rounded-xl border px-4 py-4 transition ${
                    dc.revealed
                      ? 'border-[#a68a56] bg-[#221c2c]'
                      : bisaDibuka
                      ? 'border-[#4a3f5c] bg-[#171420] active:scale-[0.98]'
                      : 'border-[#241f2e] bg-[#131019] opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-widest uppercase text-[#8d84a0]">
                      Kartu {i + 1}
                    </span>
                    {terkunci && <span className="text-xs text-[#5c5468]">🔒</span>}
                  </div>

                  {!dc.revealed ? (
                    <p className="mt-2 text-sm text-[#c9bfa8]">
                      {bisaDibuka ? 'Ketuk untuk membuka kartu ini' : 'Buka kartu sebelumnya dulu'}
                    </p>
                  ) : (
                    <div className="mt-2">
                      <p className="font-serif text-lg text-[#f4ecd8]">
                        {dc.card.card_name}
                        {dc.reversed && <span className="text-[#8d84a0] text-sm"> (Terbalik)</span>}
                      </p>
                      <p className="mt-1 text-sm text-[#c9bfa8]">
                        {dc.reversed ? dc.card.meaning_reversed : dc.card.meaning_upright}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}

            {semuaTerbuka && (
              <button
                onClick={simpanHasil}
                disabled={saving}
                className="w-full rounded-lg bg-[#a68a56] text-[#0d0b12] font-medium py-3 mt-2 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Pembacaan Ini'}
              </button>
            )}
          </div>
        )}

        {/* ---------------- STEP: SELESAI ---------------- */}
        {step === 'selesai' && (
          <div className="text-center space-y-6 py-8">
            <p className="text-[#f4ecd8] font-serif text-xl">Pembacaan tersimpan</p>
            <p className="text-sm text-[#8d84a0]">
              Kamu bisa melihatnya lagi di riwayat panel Tarot.
            </p>
            <button
              onClick={ulangiDariAwal}
              className="w-full rounded-lg border border-[#a68a56] text-[#a68a56] font-medium py-3"
            >
              Tarik Kartu Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
