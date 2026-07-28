// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/definition.ts
// =====================================================

import { CHANNELS, ChannelDefinition } from './data/channels';
import { CenterName, ALL_CENTERS } from './data/centers';
import { HumanDesignCalculationError } from './types';

/**
 * Menentukan channel mana saja yang "aktif" (terdefinisi) dari sekumpulan
 * gate yang aktif. Sebuah channel aktif hanya jika KEDUA gate-nya aktif.
 *
 * @param activeGates - Kumpulan nomor gate (1-64) yang aktif, gabungan
 *                       dari aktivasi Personality (conscious) dan Design (unconscious).
 */
export function getDefinedChannels(activeGates: ReadonlySet<number>): ChannelDefinition[] {
  return CHANNELS.filter(
    (ch) => activeGates.has(ch.gates[0]) && activeGates.has(ch.gates[1])
  );
}

/** Menentukan center mana saja yang terdefinisi dari daftar channel aktif. */
export function getDefinedCenters(definedChannels: readonly ChannelDefinition[]): Set<CenterName> {
  const defined = new Set<CenterName>();
  for (const ch of definedChannels) {
    defined.add(ch.centers[0]);
    defined.add(ch.centers[1]);
  }
  return defined;
}

/**
 * Graf adjacency antar-center, dibangun HANYA dari channel yang benar-benar
 * aktif. Dipakai untuk mengecek konektivitas (misal: apakah Throat
 * terhubung ke sebuah motor center) untuk penentuan Type dan Authority.
 */
export function buildCenterGraph(
  definedChannels: readonly ChannelDefinition[]
): Map<CenterName, Set<CenterName>> {
  const graph = new Map<CenterName, Set<CenterName>>();
  for (const center of ALL_CENTERS) {
    graph.set(center, new Set());
  }
  for (const ch of definedChannels) {
    const [a, b] = ch.centers;
    graph.get(a)!.add(b);
    graph.get(b)!.add(a);
  }
  return graph;
}

/**
 * Mengecek apakah dua center saling terhubung melalui rangkaian channel
 * aktif (bisa langsung atau lewat center lain yang juga terdefinisi).
 * Menggunakan BFS pada graf konektivitas.
 */
export function areCentersConnected(
  graph: Map<CenterName, Set<CenterName>>,
  from: CenterName,
  to: CenterName
): boolean {
  if (from === to) return true;
  const visited = new Set<CenterName>([from]);
  const queue: CenterName[] = [from];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = graph.get(current);
    if (!neighbors) {
      throw new HumanDesignCalculationError(`Center tidak dikenal dalam graf: ${current}`);
    }
    for (const neighbor of neighbors) {
      if (neighbor === to) return true;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
}
