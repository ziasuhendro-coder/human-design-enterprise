// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/data/gateContentSchema.ts
// =====================================================

export interface GateContentBody {
  keyword: string;
  theme: string;
  overview: string;
  higherExpression: string;
  lowerExpression: string;
  gift: string;
  challenge: string;
  shadow: string;
  relationship: string;
  career: string;
  business: string;
  leadership: string;
  health: string;
  parenting: string;
  learning: string;
  money: string;
  spiritual: string;
  dailyPractice: string;
  journalPrompt: string;
  affirmation: string;
}

/** Daftar field beserta label tampilan, dipakai untuk render UI secara konsisten. */
export const GATE_CONTENT_FIELDS: Array<{ key: keyof GateContentBody; label: string }> = [
  { key: 'keyword', label: 'Keyword' },
  { key: 'theme', label: 'Theme' },
  { key: 'overview', label: 'Overview' },
  { key: 'higherExpression', label: 'Higher Expression' },
  { key: 'lowerExpression', label: 'Lower Expression' },
  { key: 'gift', label: 'Gift' },
  { key: 'challenge', label: 'Challenge' },
  { key: 'shadow', label: 'Shadow' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'career', label: 'Career' },
  { key: 'business', label: 'Business' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'health', label: 'Health' },
  { key: 'parenting', label: 'Parenting' },
  { key: 'learning', label: 'Learning' },
  { key: 'money', label: 'Money' },
  { key: 'spiritual', label: 'Spiritual' },
  { key: 'dailyPractice', label: 'Daily Practice' },
  { key: 'journalPrompt', label: 'Journal Prompt' },
  { key: 'affirmation', label: 'Affirmation' },
];

export const GATE_CONTENT_FIELD_KEYS: string = GATE_CONTENT_FIELDS.map((f) => f.key).join(', ');
