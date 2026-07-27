// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/types.ts
// =====================================================

/**
 * Kumpulan posisi bujur ekliptik geosentris (dalam derajat, 0-360)
 * untuk seluruh benda langit yang relevan dalam sistem Human Design.
 *
 * "earth" bukan hasil observasi astronomis langsung, melainkan titik
 * oposisi (180°) dari Matahari — konvensi baku dalam Human Design karena
 * sistem koordinatnya geosentris (Bumi sebagai pusat referensi).
 */
export interface BodyLongitudes {
  sun: number;
  earth: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  uranus: number;
  neptune: number;
  pluto: number;
  northNode: number;
  southNode: number;
}

/**
 * Error khusus untuk kegagalan dalam proses perhitungan astronomi/Human Design.
 * Membedakan dari error generik agar caller (API route, form action) bisa
 * menampilkan pesan yang sesuai ke pengguna tanpa membocorkan detail teknis.
 */
export class HumanDesignCalculationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'HumanDesignCalculationError';
  }
}

/** Batas tanggal yang didukung astronomy-engine dengan akurasi baik (1900-2100). */
export const SUPPORTED_DATE_RANGE = {
  min: new Date('1900-01-01T00:00:00Z'),
  max: new Date('2100-01-01T00:00:00Z'),
} as const;
