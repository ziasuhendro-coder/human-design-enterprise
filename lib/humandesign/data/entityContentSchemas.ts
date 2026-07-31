// =====================================================
// AKSI: GANTI SELURUH ISI FILE
// PATH  : lib/humandesign/data/entityContentSchemas.ts
// =====================================================

export interface ContentField {
  key: string;
  label: string;
}

// ---- TYPE (5 entity) ----
export const TYPE_CONTENT_FIELDS: ContentField[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'psychology', label: 'Psychology' },
  { key: 'coreCharacteristics', label: 'Core Characteristics' },
  { key: 'strengths', label: 'Strengths' },
  { key: 'weaknesses', label: 'Weaknesses' },
  { key: 'hiddenTalent', label: 'Hidden Talent' },
  { key: 'blindSpot', label: 'Blind Spot' },
  { key: 'decisionStyle', label: 'Decision Style' },
  { key: 'bestEnvironment', label: 'Best Environment' },
  { key: 'communicationStyle', label: 'Communication Style' },
  { key: 'leadershipStyle', label: 'Leadership Style' },
  { key: 'careerRecommendation', label: 'Career Recommendation' },
  { key: 'businessRecommendation', label: 'Business Recommendation' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'parenting', label: 'Parenting' },
  { key: 'friendship', label: 'Friendship' },
  { key: 'learningStyle', label: 'Learning Style' },
  { key: 'financialStyle', label: 'Financial Style' },
  { key: 'spiritualStyle', label: 'Spiritual Style' },
  { key: 'dailyPractice', label: 'Daily Practice' },
  { key: 'habits', label: 'Habits' },
  { key: 'stressPattern', label: 'Stress Pattern' },
  { key: 'burnoutSigns', label: 'Burnout Signs' },
  { key: 'growthStrategy', label: 'Growth Strategy' },
  { key: 'reflectionQuestion', label: 'Reflection Question' },
  { key: 'actionPlan', label: 'Action Plan' },
  { key: 'aiPersonalizedAdvice', label: 'AI Personalized Advice' },
];
export const TYPE_CONTENT_FIELD_KEYS = TYPE_CONTENT_FIELDS.map((f) => f.key).join(', ');
export type TypeContentBody = Record<string, string>;

// ---- AUTHORITY (7 entity) ----
export const AUTHORITY_CONTENT_FIELDS: ContentField[] = [
  { key: 'decisionProcess', label: 'Bagaimana Mengambil Keputusan' },
  { key: 'whatToDo', label: 'Yang Harus Dilakukan' },
  { key: 'whatToAvoid', label: 'Yang Harus Dihindari' },
  { key: 'realExample', label: 'Contoh Nyata' },
  { key: 'career', label: 'Karier' },
  { key: 'business', label: 'Bisnis' },
  { key: 'relationship', label: 'Hubungan' },
  { key: 'marriage', label: 'Pernikahan' },
  { key: 'education', label: 'Pendidikan' },
  { key: 'investment', label: 'Investasi' },
  { key: 'health', label: 'Kesehatan' },
  { key: 'aiTips', label: 'AI Tips' },
];
export const AUTHORITY_CONTENT_FIELD_KEYS = AUTHORITY_CONTENT_FIELDS.map((f) => f.key).join(', ');
export type AuthorityContentBody = Record<string, string>;

// ---- PROFILE (12 entity) ----
export const PROFILE_CONTENT_FIELDS: ContentField[] = [
  { key: 'lineMeaning', label: 'Makna Setiap Line' },
  { key: 'character', label: 'Karakter' },
  { key: 'potential', label: 'Potensi' },
  { key: 'talent', label: 'Talent' },
  { key: 'shadow', label: 'Shadow' },
  { key: 'challenge', label: 'Challenge' },
  { key: 'gift', label: 'Gift' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'career', label: 'Career' },
  { key: 'business', label: 'Business' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'learning', label: 'Learning' },
  { key: 'money', label: 'Money' },
  { key: 'lifePurpose', label: 'Life Purpose' },
  { key: 'aiRecommendation', label: 'AI Recommendation' },
];
export const PROFILE_CONTENT_FIELD_KEYS = PROFILE_CONTENT_FIELDS.map((f) => f.key).join(', ');
export type ProfileContentBody = Record<string, string>;

// ---- CENTER (9 entity) ----
// Setiap Center punya dua state: defined & open, masing-masing dengan field yang sama.
export const CENTER_STATE_FIELDS: ContentField[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'psychology', label: 'Psychology' },
  { key: 'energy', label: 'Energy' },
  { key: 'strength', label: 'Strength' },
  { key: 'weakness', label: 'Weakness' },
  { key: 'gift', label: 'Gift' },
  { key: 'shadow', label: 'Shadow' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'career', label: 'Career' },
  { key: 'business', label: 'Business' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'health', label: 'Health' },
  { key: 'decisionMaking', label: 'Decision Making' },
  { key: 'aiRecommendation', label: 'AI Recommendation' },
  { key: 'practicalExercise', label: 'Practical Exercise' },
  { key: 'reflectionQuestion', label: 'Reflection Question' },
];
export const CENTER_STATE_FIELD_KEYS = CENTER_STATE_FIELDS.map((f) => f.key).join(', ');
export type CenterStateBody = Record<string, string>;
export interface CenterContentBody {
  defined: CenterStateBody;
  open: CenterStateBody;
}

// ---- CHANNEL (36 entity) ----
export const CHANNEL_CONTENT_FIELDS: ContentField[] = [
  { key: 'name', label: 'Name' },
  { key: 'circuit', label: 'Circuit' },
  { key: 'meaning', label: 'Meaning' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'strength', label: 'Strength' },
  { key: 'challenge', label: 'Challenge' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'career', label: 'Career' },
  { key: 'business', label: 'Business' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'communication', label: 'Communication' },
  { key: 'money', label: 'Money' },
  { key: 'health', label: 'Health' },
  { key: 'shadow', label: 'Shadow' },
  { key: 'gift', label: 'Gift' },
  { key: 'affirmation', label: 'Affirmation' },
  { key: 'dailyPractice', label: 'Daily Practice' },
];
export const CHANNEL_CONTENT_FIELD_KEYS = CHANNEL_CONTENT_FIELDS.map((f) => f.key).join(', ');
export type ChannelContentBody = Record<string, string>;

// ---- PLANETARY ACTIVATION (13 entity) ----
export const PLANET_CONTENT_FIELDS: ContentField[] = [
  { key: 'meaning', label: 'Meaning' },
  { key: 'psychology', label: 'Psychology' },
  { key: 'strength', label: 'Strength' },
  { key: 'challenge', label: 'Challenge' },
  { key: 'lifeLesson', label: 'Life Lesson' },
  { key: 'influence', label: 'Influence' },
  { key: 'aiInsight', label: 'AI Insight' },
];
export const PLANET_CONTENT_FIELD_KEYS = PLANET_CONTENT_FIELDS.map((f) => f.key).join(', ');
export type PlanetContentBody = Record<string, string>;

// =====================================================
// REGISTRY — daftar semua entity type untuk dipakai
// oleh generic generator route & admin panel
// =====================================================
export type EntityType = 'type' | 'authority' | 'profile' | 'center' | 'channel' | 'planet';

export interface EntityTypeConfig {
  entityType: EntityType;
  label: string;
  tableName: string;
  keyColumn: string;
  fieldKeys: string;
}

export const ENTITY_TYPE_REGISTRY: EntityTypeConfig[] = [
  { entityType: 'type', label: 'Type', tableName: 'hd_type_content', keyColumn: 'type_name', fieldKeys: TYPE_CONTENT_FIELD_KEYS },
  { entityType: 'authority', label: 'Authority', tableName: 'hd_authority_content', keyColumn: 'authority_name', fieldKeys: AUTHORITY_CONTENT_FIELD_KEYS },
  { entityType: 'profile', label: 'Profile', tableName: 'hd_profile_content', keyColumn: 'profile_code', fieldKeys: PROFILE_CONTENT_FIELD_KEYS },
  { entityType: 'center', label: 'Center', tableName: 'hd_center_content', keyColumn: 'center_name', fieldKeys: CENTER_STATE_FIELD_KEYS },
  { entityType: 'channel', label: 'Channel', tableName: 'hd_channel_content', keyColumn: 'channel_code', fieldKeys: CHANNEL_CONTENT_FIELD_KEYS },
  { entityType: 'planet', label: 'Planet', tableName: 'hd_planet_content', keyColumn: 'planet_name', fieldKeys: PLANET_CONTENT_FIELD_KEYS },
];
