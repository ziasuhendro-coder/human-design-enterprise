// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/gates.test.ts
// =====================================================

import { describe, it, expect } from 'vitest';
import { longitudeToGateLine } from './gates';
import { HumanDesignCalculationError } from './types';

describe('longitudeToGateLine', () => {
  it('mengidentifikasi Gate 41 tepat di titik awal wheel (302°)', () => {
    const result = longitudeToGateLine(302);
    expect(result.gate).toBe(41);
    expect(result.line).toBe(1);
  });

  it('mengidentifikasi Gate 19 pada 307.625° (7°37\'30" Aquarius) sesuai referensi independen', () => {
    const result = longitudeToGateLine(307.625);
    expect(result.gate).toBe(19);
    expect(result.line).toBe(1);
  });

  it('mengidentifikasi Gate 64 pada 161.375° (11°22\'30" Virgo) sesuai referensi independen', () => {
    const result = longitudeToGateLine(161.375);
    expect(result.gate).toBe(64);
    expect(result.line).toBe(1);
  });

  it('menangani wraparound melewati 360°/0° dengan benar', () => {
    // 302° - 5.625° = 296.375°, harusnya masuk gate sebelum 41 di urutan wheel (Gate 60)
    const result = longitudeToGateLine(296.375);
    expect(result.gate).toBe(60);
  });

  it('menghitung line dengan benar di tengah sebuah gate', () => {
    // Gate 41 dimulai di 302°, line 3 dimulai di 302 + 2*0.9375 = 303.875°
    const result = longitudeToGateLine(303.9);
    expect(result.gate).toBe(41);
    expect(result.line).toBe(3);
  });

  it('menghitung line 6 (terakhir) dengan benar sebelum masuk gate berikutnya', () => {
    // Gate 41 berakhir di 307.625° (awal gate 19), line 6 dimulai di 302 + 5*0.9375 = 306.6875°
    const result = longitudeToGateLine(307.0);
    expect(result.gate).toBe(41);
    expect(result.line).toBe(6);
  });

  it('menormalisasi longitude di luar rentang 0-360 dengan benar', () => {
    const result = longitudeToGateLine(302 + 360);
    expect(result.gate).toBe(41);
  });

  it('melempar HumanDesignCalculationError untuk input bukan angka', () => {
    expect(() => longitudeToGateLine(NaN)).toThrow(HumanDesignCalculationError);
  });

  it('seluruh 64 gate dapat diakses secara berurutan mengelilingi wheel', () => {
    const seenGates = new Set<number>();
    for (let i = 0; i < 64; i++) {
      const longitude = 302 + i * 5.625 + 0.1; // sedikit offset agar aman dari batas tepat
      const result = longitudeToGateLine(longitude);
      seenGates.add(result.gate);
    }
    expect(seenGates.size).toBe(64);
  });
});
