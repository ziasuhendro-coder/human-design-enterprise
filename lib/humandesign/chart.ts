// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/chart.ts
// =====================================================

import { getBodyLongitudes, findDesignDate } from './ephemeris';
import { longitudeToGateLine } from './gates';
import { getDefinedChannels, getDefinedCenters } from './definition';
import { determineType, determineAuthority, HumanDesignType, Authority } from './typeAndAuthority';
import { determineProfile } from './profile';
import { BodyLongitudes, HumanDesignCalculationError } from './types';
import { CenterName } from './data/centers';

export interface PlanetaryActivation {
  body: keyof BodyLongitudes;
  gate: number;
  line: number;
  longitude: number;
}

export interface DefinedChannelSummary {
  gates: [number, number];
  name: string;
}

export interface HumanDesignChart {
  birthDateUtc: string;
  designDateUtc: string;
  personality: PlanetaryActivation[];
  design: PlanetaryActivation[];
  definedCenters: CenterName[];
  definedChannels: DefinedChannelSummary[];
  type: HumanDesignType;
  authority: Authority;
  profile: string;
}

function calculateActivations(date: Date): PlanetaryActivation[] {
  const longitudes = getBodyLongitudes(date);
  return (Object.keys(longitudes) as (keyof BodyLongitudes)[]).map((body) => {
    const { gate, line, sourceLongitude } = longitudeToGateLine(longitudes[body]);
    return { body, gate, line, longitude: sourceLongitude };
  });
}

/**
 * Menghitung chart Human Design lengkap dari satu titik waktu lahir (UTC).
 *
 * @param birthDateUtc - Waktu lahir dalam UTC (Date object). Konversi dari
 *                        waktu lokal + timezone harus sudah dilakukan
 *                        SEBELUM memanggil fungsi ini (lihat API route).
 */
export function calculateHumanDesignChart(birthDateUtc: Date): HumanDesignChart {
  if (!(birthDateUtc instanceof Date) || Number.isNaN(birthDateUtc.getTime())) {
    throw new HumanDesignCalculationError(`birthDateUtc tidak valid: ${birthDateUtc}`);
  }

  const personality = calculateActivations(birthDateUtc);
  const designDate = findDesignDate(birthDateUtc);
  const design = calculateActivations(designDate);

  const activeGates = new Set<number>([
    ...personality.map((a) => a.gate),
    ...design.map((a) => a.gate),
  ]);

  const definedChannels = getDefinedChannels(activeGates);
  const definedCentersSet = getDefinedCenters(definedChannels);

  const type = determineType(definedCentersSet, definedChannels);
  const authority = determineAuthority(definedCentersSet, definedChannels);

  const personalitySun = personality.find((a) => a.body === 'sun');
  const designSun = design.find((a) => a.body === 'sun');
  if (!personalitySun || !designSun) {
    throw new HumanDesignCalculationError(
      'Gagal menemukan aktivasi Sun pada Personality atau Design.'
    );
  }
  const profile = determineProfile(personalitySun.line, designSun.line);

  return {
    birthDateUtc: birthDateUtc.toISOString(),
    designDateUtc: designDate.toISOString(),
    personality,
    design,
    definedCenters: Array.from(definedCentersSet),
    definedChannels: definedChannels.map((c) => ({
      gates: c.gates as [number, number],
      name: c.name,
    })),
    type,
    authority,
    profile,
  };
}
