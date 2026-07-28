// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/typeAndAuthority.ts
// =====================================================

import { CenterName, MOTOR_CENTERS } from './data/centers';
import { areCentersConnected, buildCenterGraph } from './definition';
import { ChannelDefinition } from './data/channels';

export type HumanDesignType =
  | 'Manifestor'
  | 'Generator'
  | 'ManifestingGenerator'
  | 'Projector'
  | 'Reflector';

export type Authority =
  | 'Emotional'
  | 'Sacral'
  | 'Splenic'
  | 'Ego'
  | 'SelfProjected'
  | 'Mental'
  | 'Lunar';

/**
 * Menentukan Type berdasarkan center yang terdefinisi dan konektivitasnya.
 *
 * Aturan baku:
 * - Reflector: tidak ada satupun center terdefinisi.
 * - Sacral terdefinisi:
 *     - Jika Throat terhubung (langsung/tidak langsung) ke motor manapun
 *       (termasuk Sacral sendiri) → Manifesting Generator.
 *     - Jika tidak → Generator.
 * - Sacral TIDAK terdefinisi:
 *     - Jika Throat terhubung ke motor selain Sacral (Heart/SolarPlexus/Root)
 *       → Manifestor.
 *     - Jika tidak, tapi ada center lain yang terdefinisi → Projector.
 */
export function determineType(
  definedCenters: ReadonlySet<CenterName>,
  definedChannels: readonly ChannelDefinition[]
): HumanDesignType {
  if (definedCenters.size === 0) {
    return 'Reflector';
  }

  const graph = buildCenterGraph(definedChannels);
  const throatDefined = definedCenters.has('Throat');
  const sacralDefined = definedCenters.has('Sacral');

  const throatConnectedToMotor = (excludeSacral: boolean): boolean => {
    if (!throatDefined) return false;
    for (const motor of MOTOR_CENTERS) {
      if (excludeSacral && motor === 'Sacral') continue;
      if (!definedCenters.has(motor)) continue;
      if (areCentersConnected(graph, 'Throat', motor)) return true;
    }
    return false;
  };

  if (sacralDefined) {
    return throatConnectedToMotor(false) ? 'ManifestingGenerator' : 'Generator';
  }

  if (throatConnectedToMotor(true)) {
    return 'Manifestor';
  }

  return 'Projector';
}

/**
 * Menentukan Authority berdasarkan hierarki baku (dicek berurutan,
 * yang pertama cocok yang dipakai):
 * Emotional > Sacral > Splenic > Ego > Self-Projected > Mental > Lunar.
 */
export function determineAuthority(
  definedCenters: ReadonlySet<CenterName>,
  definedChannels: readonly ChannelDefinition[]
): Authority {
  if (definedCenters.has('SolarPlexus')) return 'Emotional';
  if (definedCenters.has('Sacral')) return 'Sacral';
  if (definedCenters.has('Spleen')) return 'Splenic';

  if (definedCenters.has('Heart')) return 'Ego';

  if (definedCenters.has('G') && definedCenters.has('Throat')) {
    const graph = buildCenterGraph(definedChannels);
    if (areCentersConnected(graph, 'G', 'Throat')) {
      return 'SelfProjected';
    }
  }

  if (definedCenters.size === 0) return 'Lunar';

  return 'Mental';
  }
