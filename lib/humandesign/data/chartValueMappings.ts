// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/data/chartValueMappings.ts
// =====================================================
// Menjembatani nilai mentah dari hasil kalkulasi chart (misal "ManifestingGenerator")
// dengan key yang dipakai di tabel konten (misal "Manifesting Generator").

export const TYPE_RAW_TO_CONTENT_KEY: Record<string, string> = {
  Manifestor: 'Manifestor',
  Generator: 'Generator',
  ManifestingGenerator: 'Manifesting Generator',
  Projector: 'Projector',
  Reflector: 'Reflector',
};

export const AUTHORITY_RAW_TO_CONTENT_KEY: Record<string, string> = {
  Emotional: 'Emotional',
  Sacral: 'Sacral',
  Splenic: 'Splenic',
  Ego: 'Ego/Heart',
  SelfProjected: 'Self-Projected',
  Mental: 'Mental/Environmental',
  Lunar: 'Lunar',
};

// Signature & Not-Self Theme bersifat statis per Type (bukan hasil kalkulasi).
export const TYPE_SIGNATURE: Record<string, { signature: string; notSelf: string }> = {
  Manifestor: { signature: 'Peace (Kedamaian)', notSelf: 'Anger (Kemarahan)' },
  Generator: { signature: 'Satisfaction (Kepuasan)', notSelf: 'Frustration (Frustrasi)' },
  ManifestingGenerator: { signature: 'Satisfaction (Kepuasan)', notSelf: 'Frustration (Frustrasi)' },
  Projector: { signature: 'Success (Kesuksesan)', notSelf: 'Bitterness (Kepahitan)' },
  Reflector: { signature: 'Surprise (Kejutan)', notSelf: 'Disappointment (Kekecewaan)' },
};

export function getTypeContentKey(rawType: string): string {
  return TYPE_RAW_TO_CONTENT_KEY[rawType] ?? rawType;
}

export function getAuthorityContentKey(rawAuthority: string): string {
  return AUTHORITY_RAW_TO_CONTENT_KEY[rawAuthority] ?? rawAuthority;
}

export function getTypeSignature(rawType: string) {
  return TYPE_SIGNATURE[rawType] ?? { signature: '-', notSelf: '-' };
}
