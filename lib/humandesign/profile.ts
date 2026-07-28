// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/profile.ts
// =====================================================

import { HumanDesignCalculationError } from './types';

/** 12 kombinasi Profile yang valid dalam Human Design. */
const VALID_PROFILES: readonly string[] = [
  '1/3', '1/4', '2/4', '2/5', '3/5', '3/6',
  '4/6', '4/1', '5/1', '5/2', '6/2', '6/3',
];

/**
 * Menentukan Profile dari kombinasi Line Sun Personality (conscious)
 * dan Line Sun Design (unconscious), format "personalityLine/designLine".
 *
 * @param personalitySunLine - Line (1-6) dari posisi Sun Personality.
 * @param designSunLine - Line (1-6) dari posisi Sun Design.
 */
export function determineProfile(
  personalitySunLine: number,
  designSunLine: number
): string {
  for (const line of [personalitySunLine, designSunLine]) {
    if (!Number.isInteger(line) || line < 1 || line > 6) {
      throw new HumanDesignCalculationError(
        `Line harus berupa integer 1-6, diterima: ${line}`
      );
    }
  }

  const profile = `${personalitySunLine}/${designSunLine}`;

  if (!VALID_PROFILES.includes(profile)) {
    throw new HumanDesignCalculationError(
      `Kombinasi Profile tidak valid: ${profile}. Kombinasi Line Sun Personality/Design harus mengikuti pola siklus baku Human Design.`
    );
  }

  return profile;
}
