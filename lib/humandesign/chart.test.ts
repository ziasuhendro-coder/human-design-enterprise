// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/chart.test.ts
// =====================================================

import { describe, it, expect } from 'vitest';
import { calculateHumanDesignChart } from './chart';
import { HumanDesignCalculationError } from './types';

const VALID_TYPES = ['Manifestor', 'Generator', 'ManifestingGenerator', 'Projector', 'Reflector'];
const VALID_AUTHORITIES = ['Emotional', 'Sacral', 'Splenic', 'Ego', 'SelfProjected', 'Mental', 'Lunar'];

describe('calculateHumanDesignChart', () => {
  it('menghasilkan struktur chart lengkap dan konsisten untuk tanggal valid', () => {
    const chart = calculateHumanDesignChart(new Date('1990-06-15T10:30:00Z'));

    expect(chart.personality).toHaveLength(13);
    expect(chart.design).toHaveLength(13);
    expect(VALID_TYPES).toContain(chart.type);
    expect(VALID_AUTHORITIES).toContain(chart.authority);
    expect(chart.profile).toMatch(/^[1-6]\/[1-6]$/);
    expect(chart.definedCenters.length).toBeGreaterThanOrEqual(0);
    expect(chart.definedCenters.length).toBeLessThanOrEqual(9);
  });

  it('tanggal Design selalu ~88 hari sebelum tanggal Personality', () => {
    const birth = new Date('2000-01-01T00:00:00Z');
    const chart = calculateHumanDesignChart(birth);
    const diffDays =
      (birth.getTime() - new Date(chart.designDateUtc).getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(85);
    expect(diffDays).toBeLessThan(91);
  });

  it('melempar error untuk input bukan Date valid', () => {
    expect(() => calculateHumanDesignChart(new Date('invalid'))).toThrow(
      HumanDesignCalculationError
    );
  });

  it('Reflector murni tidak mungkin terjadi untuk manusia nyata, tapi tipe tetap konsisten dengan definedCenters', () => {
    const chart = calculateHumanDesignChart(new Date('1985-03-20T14:00:00Z'));
    if (chart.type === 'Reflector') {
      expect(chart.definedCenters.length).toBe(0);
    } else {
      expect(chart.definedCenters.length).toBeGreaterThan(0);
    }
  });
});
