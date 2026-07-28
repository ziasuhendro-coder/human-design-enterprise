// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/data/centers.ts
// =====================================================

export type CenterName =
  | 'Head' | 'Ajna' | 'Throat' | 'G' | 'Heart'
  | 'Spleen' | 'Sacral' | 'SolarPlexus' | 'Root';

export const ALL_CENTERS: readonly CenterName[] = [
  'Head', 'Ajna', 'Throat', 'G', 'Heart',
  'Spleen', 'Sacral', 'SolarPlexus', 'Root',
];

/** Center yang berfungsi sebagai "motor" (sumber energi/daya dorong). */
export const MOTOR_CENTERS: readonly CenterName[] = [
  'Heart', 'Sacral', 'SolarPlexus', 'Root',
];

/** Daftar gate anggota tiap center (total 64 gate, tidak boleh ada duplikasi/kekurangan). */
export const CENTER_GATES: Record<CenterName, readonly number[]> = {
  Head: [64, 61, 63],
  Ajna: [47, 24, 4, 17, 43, 11],
  Throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
  G: [1, 13, 25, 46, 2, 15, 10, 7],
  Heart: [21, 40, 26, 51],
  Spleen: [48, 57, 44, 50, 32, 28, 18],
  Sacral: [5, 14, 29, 59, 9, 3, 42, 27, 34],
  SolarPlexus: [6, 37, 22, 36, 30, 55, 49],
  Root: [58, 38, 54, 53, 60, 52, 19, 39, 41],
};

/** Peta terbalik: gate -> center pemiliknya. Dibangun sekali saat modul dimuat. */
export const GATE_TO_CENTER: Record<number, CenterName> = (() => {
  const map: Record<number, CenterName> = {};
  for (const center of ALL_CENTERS) {
    for (const gate of CENTER_GATES[center]) {
      map[gate] = center;
    }
  }
  return map;
})();
