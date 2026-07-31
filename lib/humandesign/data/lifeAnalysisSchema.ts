// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/data/lifeAnalysisSchema.ts
// =====================================================

export interface ContentField {
  key: string;
  label: string;
}

export interface LifeAnalysisCategory {
  key: string;
  emoji: string;
  label: string;
  fields: ContentField[];
}

export const LIFE_ANALYSIS_CATEGORIES: LifeAnalysisCategory[] = [
  {
    key: 'asmara',
    emoji: '❤️',
    label: 'Asmara',
    fields: [
      { key: 'gayaMencintai', label: 'Gaya Mencintai' },
      { key: 'caraMenunjukkanKasihSayang', label: 'Cara Menunjukkan Kasih Sayang' },
      { key: 'tantanganHubungan', label: 'Tantangan Hubungan' },
      { key: 'kecenderunganPasanganCocok', label: 'Kecenderungan Pasangan yang Cocok' },
      { key: 'halYangPerluDikembangkan', label: 'Hal yang Perlu Dikembangkan' },
      { key: 'peluangHubunganKeDepan', label: 'Peluang Hubungan ke Depan' },
    ],
  },
  {
    key: 'pernikahan',
    emoji: '💍',
    label: 'Pernikahan',
    fields: [
      { key: 'kecenderunganRumahTangga', label: 'Kecenderungan Membangun Rumah Tangga' },
      { key: 'tantangan', label: 'Tantangan' },
      { key: 'kekuatan', label: 'Kekuatan' },
      { key: 'caraMenjagaHubungan', label: 'Cara Menjaga Hubungan' },
    ],
  },
  {
    key: 'keluarga',
    emoji: '👨‍👩‍👧',
    label: 'Keluarga',
    fields: [
      { key: 'hubunganOrangTua', label: 'Hubungan dengan Orang Tua' },
      { key: 'hubunganAnak', label: 'Hubungan dengan Anak' },
      { key: 'peranDalamKeluarga', label: 'Peran dalam Keluarga' },
    ],
  },
  {
    key: 'karier',
    emoji: '💼',
    label: 'Karier',
    fields: [
      { key: 'bidangCocok', label: 'Bidang yang Cocok' },
      { key: 'gayaBekerja', label: 'Gaya Bekerja' },
      { key: 'kepemimpinan', label: 'Kepemimpinan' },
      { key: 'potensiBerkembang', label: 'Potensi Berkembang' },
    ],
  },
  {
    key: 'bisnis',
    emoji: '🚀',
    label: 'Bisnis',
    fields: [
      { key: 'modelBisnisCocok', label: 'Model Bisnis yang Cocok' },
      { key: 'caraMembangunBisnis', label: 'Cara Membangun Bisnis' },
      { key: 'pengambilanRisiko', label: 'Pengambilan Risiko' },
    ],
  },
  {
    key: 'keuangan',
    emoji: '💰',
    label: 'Keuangan',
    fields: [
      { key: 'kebiasaanFinansial', label: 'Kebiasaan Finansial' },
      { key: 'caraMengelolaUang', label: 'Cara Mengelola Uang' },
      { key: 'risikoFinansial', label: 'Risiko Finansial' },
      { key: 'peluangPertumbuhan', label: 'Peluang Pertumbuhan' },
    ],
  },
  {
    key: 'pengembanganDiri',
    emoji: '🧠',
    label: 'Pengembangan Diri',
    fields: [
      { key: 'kebiasaanDibangun', label: 'Kebiasaan yang Perlu Dibangun' },
      { key: 'kebiasaanDihindari', label: 'Kebiasaan yang Perlu Dihindari' },
      { key: 'fokusPengembangan', label: 'Fokus Pengembangan' },
    ],
  },
  {
    key: 'energiKeseimbangan',
    emoji: '🧘',
    label: 'Energi & Keseimbangan',
    fields: [
      { key: 'manajemenEnergi', label: 'Manajemen Energi' },
      { key: 'polaIstirahat', label: 'Pola Istirahat' },
      { key: 'burnout', label: 'Burnout' },
      { key: 'recovery', label: 'Recovery' },
    ],
  },
  {
    key: 'misiKehidupan',
    emoji: '🎯',
    label: 'Misi Kehidupan',
    fields: [
      { key: 'tujuanHidup', label: 'Tujuan Hidup' },
      { key: 'kontribusi', label: 'Kontribusi' },
      { key: 'potensiTerbesar', label: 'Potensi Terbesar' },
      { key: 'nilaiUntukDunia', label: 'Nilai yang Dapat Diberikan kepada Dunia' },
    ],
  },
];

export function buildComboKey(typeName: string, authorityName: string, profileCode: string): string {
  const sanitize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `${sanitize(typeName)}__${sanitize(authorityName)}__${sanitize(profileCode)}`;
      }
