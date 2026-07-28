// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/data/gateWheelOrder.ts
// =====================================================

/**
 * Urutan 64 Gate mengelilingi Rave Mandala, dimulai dari Gate 41
 * pada 302° bujur ekliptik tropis (2°00' Aquarius).
 *
 * Urutan ini BUKAN 1,2,3...64 — melainkan mengikuti susunan I-Ching
 * King Wen yang disusun ulang oleh Ra Uru Hu berdasarkan simetri
 * biner heksagram. Urutan ini adalah konstanta baku dalam seluruh
 * literatur dan software Human Design resmi (Jovian Archive, dsb).
 *
 * Sumber verifikasi silang:
 * - Gate 41 @ 302.000° (2°00'00" Aquarius)
 * - Gate 19 @ 307.625° (7°37'30" Aquarius)
 * - Gate 64 @ 161.375° (11°22'30" Virgo)
 * (Ketiganya cocok dengan tabel derajat independen dari komunitas HD.)
 *
 * JANGAN UBAH URUTAN INI kecuali ada bukti kesalahan yang terverifikasi,
 * karena seluruh hasil chart bergantung pada urutan yang presisi.
 */
export const GATE_WHEEL_ORDER: readonly number[] = [
  41, 19, 13, 49, 30, 55, 37, 63,
  22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35,
  45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5,
  26, 11, 10, 58, 38, 54, 61, 60,
] as const;

/** Bujur ekliptik awal Gate 41 (titik mulai wheel), dalam derajat. */
export const WHEEL_START_LONGITUDE = 302;

/** Lebar tiap Gate dalam derajat (360° / 64 gate). */
export const DEGREES_PER_GATE = 360 / 64; // 5.625

/** Lebar tiap Line dalam derajat (lebar gate / 6 line). */
export const DEGREES_PER_LINE = DEGREES_PER_GATE / 6; // 0.9375
