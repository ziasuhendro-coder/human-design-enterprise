// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/ephemeris.test.ts
// =====================================================

import { describe, it, expect } from 'vitest';
import { getBodyLongitudes, findDesignDate } from './ephemeris';
import { HumanDesignCalculationError } from './types';

describe('getBodyLongitudes', () => {
  it('menghasilkan bujur Matahari yang mendekati nilai referensi pada epoch J2000.0', () => {
    // J2000.0 = 1 Januari 2000, 12:00 TT. Bujur Matahari referensi ~280.46°
    // (Meeus, "Astronomical Algorithms", nilai standar yang banyak dirujuk).
    const j2000 = new Date('2000-01-01T11:58:56Z');
    const result = getBodyLongitudes(j2000);
    expect(result.sun).toBeGreaterThan(279);
    expect(result.sun).toBeLessThan(282);
  });

  it('menghasilkan posisi Earth tepat 180° berlawanan dari Matahari', () => {
    const date = new Date('2024-06-15T10:30:00Z');
    const result = getBodyLongitudes(date);
    const expectedEarth = (result.sun + 180) % 360;
    expect(result.earth).toBeCloseTo(expectedEarth, 5);
  });

  it('menghasilkan South Node tepat 180° berlawanan dari North Node', () => {
    const date = new Date('2024-06-15T10:30:00Z');
    const result = getBodyLongitudes(date);
    const expectedSouth = (result.northNode + 180) % 360;
    expect(result.southNode).toBeCloseTo(expectedSouth, 5);
  });

  it('semua bujur berada dalam rentang [0, 360)', () => {
    const date = new Date('2024-06-15T10:30:00Z');
    const result = getBodyLongitudes(date);
    for (const value of Object.values(result)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(360);
    }
  });

  it('melempar HumanDesignCalculationError untuk tanggal invalid', () => {
    expect(() => getBodyLongitudes(new Date('invalid'))).toThrow(
      HumanDesignCalculationError
    );
  });

  it('melempar HumanDesignCalculationError untuk tanggal di luar rentang didukung', () => {
    expect(() => getBodyLongitudes(new Date('1850-01-01T00:00:00Z'))).toThrow(
      HumanDesignCalculationError
    );
  });
});

describe('findDesignDate', () => {
  it('menghasilkan tanggal Design sekitar 88 hari sebelum tanggal lahir', () => {
    const birthDate = new Date('2024-06-15T10:30:00Z');
    const designDate = findDesignDate(birthDate);

    const diffDays =
      (birthDate.getTime() - designDate.getTime()) / (1000 * 60 * 60 * 24);

    // Toleransi realistis: 88 hari busur matahari setara ~87-89 hari kalender,
    // tergantung posisi Bumi di orbit (perihelion/aphelion).
    expect(diffDays).toBeGreaterThan(86);
    expect(diffDays).toBeLessThan(91);
  });

  it('posisi Matahari pada tanggal Design tepat 88° sebelum posisi saat lahir', () => {
    const birthDate = new Date('2024-06-15T10:30:00Z');
    const designDate = findDesignDate(birthDate);

    const birthLongitudes = getBodyLongitudes(birthDate);
    const designLongitudes = getBodyLongitudes(designDate);

    let diff = birthLongitudes.sun - designLongitudes.sun;
    if (diff < 0) diff += 360;

    expect(diff).toBeCloseTo(88, 2);
  });

  it('melempar HumanDesignCalculationError untuk tanggal lahir invalid', () => {
    expect(() => findDesignDate(new Date('invalid'))).toThrow(
      HumanDesignCalculationError
    );
  });

  it('konsisten untuk kelahiran di awal tahun (menyeberangi pergantian tahun)', () => {
    const birthDate = new Date('2024-01-15T00:00:00Z');
    const designDate = findDesignDate(birthDate);
    expect(designDate.getUTCFullYear()).toBe(2023);
  });
});
