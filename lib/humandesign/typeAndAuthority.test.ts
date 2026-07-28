// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/typeAndAuthority.test.ts
// =====================================================

import { describe, it, expect } from 'vitest';
import { getDefinedChannels, getDefinedCenters } from './definition';
import { determineType, determineAuthority } from './typeAndAuthority';
import { determineProfile } from './profile';
import { HumanDesignCalculationError } from './types';

describe('Type determination', () => {
  it('Reflector: tidak ada gate aktif sama sekali', () => {
    const channels = getDefinedChannels(new Set());
    const centers = getDefinedCenters(channels);
    expect(determineType(centers, channels)).toBe('Reflector');
  });

  it('Generator: Sacral terdefinisi via channel 34-57, tanpa koneksi ke Throat', () => {
    const active = new Set([34, 57]); // Sacral-Spleen, tidak menyentuh Throat
    const channels = getDefinedChannels(active);
    const centers = getDefinedCenters(channels);
    expect(determineType(centers, channels)).toBe('Generator');
  });

  it('Manifesting Generator: Sacral terdefinisi DAN terhubung ke Throat (via 20-34)', () => {
    const active = new Set([20, 34]); // Throat-Sacral langsung
    const channels = getDefinedChannels(active);
    const centers = getDefinedCenters(channels);
    expect(determineType(centers, channels)).toBe('ManifestingGenerator');
  });

  it('Manifestor: Throat terhubung ke motor non-Sacral (Heart via 21-45), Sacral tidak aktif', () => {
    const active = new Set([21, 45]); // Heart-Throat
    const channels = getDefinedChannels(active);
    const centers = getDefinedCenters(channels);
    expect(determineType(centers, channels)).toBe('Manifestor');
  });

  it('Projector: ada center terdefinisi tapi Throat tidak terhubung ke motor manapun', () => {
    const active = new Set([1, 8]); // G-Throat, tanpa motor
    const channels = getDefinedChannels(active);
    const centers = getDefinedCenters(channels);
    expect(determineType(centers, channels)).toBe('Projector');
  });
});

describe('Authority determination', () => {
  it('Emotional diprioritaskan di atas semua otoritas lain jika SolarPlexus aktif', () => {
    const active = new Set([6, 59, 34, 57]); // SolarPlexus-Sacral + Sacral-Spleen
    const channels = getDefinedChannels(active);
    const centers = getDefinedCenters(channels);
    expect(determineAuthority(centers, channels)).toBe('Emotional');
  });

  it('Sacral Authority jika Sacral aktif tanpa SolarPlexus', () => {
    const active = new Set([34, 57]);
    const channels = getDefinedChannels(active);
    const centers = getDefinedCenters(channels);
    expect(determineAuthority(centers, channels)).toBe('Sacral');
  });

  it('Lunar Authority untuk Reflector murni (tidak ada center aktif)', () => {
    const channels = getDefinedChannels(new Set());
    const centers = getDefinedCenters(channels);
    expect(determineAuthority(centers, channels)).toBe('Lunar');
  });
});

describe('Profile determination', () => {
  it('menghasilkan format Profile yang benar untuk kombinasi valid', () => {
    expect(determineProfile(1, 3)).toBe('1/3');
    expect(determineProfile(6, 2)).toBe('6/2');
  });

  it('melempar error untuk kombinasi Line yang tidak pernah terjadi secara siklus (mis. 1/1)', () => {
    expect(() => determineProfile(1, 1)).toThrow(HumanDesignCalculationError);
  });

  it('melempar error untuk line di luar rentang 1-6', () => {
    expect(() => determineProfile(0, 3)).toThrow(HumanDesignCalculationError);
    expect(() => determineProfile(1, 7)).toThrow(HumanDesignCalculationError);
  });
});
