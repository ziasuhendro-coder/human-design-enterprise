// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/data/channels.ts
// =====================================================

import { CenterName } from './centers';

export interface ChannelDefinition {
  gates: readonly [number, number];
  centers: readonly [CenterName, CenterName];
  name: string;
}

/**
 * 36 Channel baku Human Design. Tiap channel menghubungkan pasangan gate
 * yang tetap (fixed), tidak pernah berubah terlepas dari planet/waktu.
 *
 * Diverifikasi silang terhadap CENTER_GATES di centers.ts — setiap gate
 * dalam channel harus konsisten dengan center yang tercantum di sana.
 */
export const CHANNELS: readonly ChannelDefinition[] = [
  { gates: [1, 8], centers: ['G', 'Throat'], name: 'Inspiration' },
  { gates: [2, 14], centers: ['G', 'Sacral'], name: 'The Beat' },
  { gates: [3, 60], centers: ['Sacral', 'Root'], name: 'Mutation' },
  { gates: [4, 63], centers: ['Ajna', 'Head'], name: 'Logical' },
  { gates: [5, 15], centers: ['Sacral', 'G'], name: 'Rhythm' },
  { gates: [6, 59], centers: ['SolarPlexus', 'Sacral'], name: 'Mating' },
  { gates: [7, 31], centers: ['G', 'Throat'], name: 'The Alpha' },
  { gates: [9, 52], centers: ['Sacral', 'Root'], name: 'Concentration' },
  { gates: [10, 20], centers: ['G', 'Throat'], name: 'Awakening' },
  { gates: [10, 34], centers: ['G', 'Sacral'], name: 'Exploration' },
  { gates: [10, 57], centers: ['G', 'Spleen'], name: 'Perfected Form' },
  { gates: [11, 56], centers: ['Ajna', 'Throat'], name: 'Curiosity' },
  { gates: [12, 22], centers: ['Throat', 'SolarPlexus'], name: 'Openness' },
  { gates: [13, 33], centers: ['G', 'Throat'], name: 'The Prodigal' },
  { gates: [16, 48], centers: ['Throat', 'Spleen'], name: 'The Wavelength' },
  { gates: [17, 62], centers: ['Ajna', 'Throat'], name: 'Acceptance' },
  { gates: [18, 58], centers: ['Spleen', 'Root'], name: 'Judgment' },
  { gates: [19, 49], centers: ['Root', 'SolarPlexus'], name: 'Synthesis' },
  { gates: [20, 34], centers: ['Throat', 'Sacral'], name: 'Charisma' },
  { gates: [20, 57], centers: ['Throat', 'Spleen'], name: 'The Brainwave' },
  { gates: [21, 45], centers: ['Heart', 'Throat'], name: 'Money Line' },
  { gates: [23, 43], centers: ['Throat', 'Ajna'], name: 'Structuring' },
  { gates: [24, 61], centers: ['Ajna', 'Head'], name: 'Awareness' },
  { gates: [25, 51], centers: ['G', 'Heart'], name: 'Initiation' },
  { gates: [26, 44], centers: ['Heart', 'Spleen'], name: 'Surrender' },
  { gates: [27, 50], centers: ['Sacral', 'Spleen'], name: 'Preservation' },
  { gates: [28, 38], centers: ['Spleen', 'Root'], name: 'Struggle' },
  { gates: [29, 46], centers: ['Sacral', 'G'], name: 'Discovery' },
  { gates: [30, 41], centers: ['SolarPlexus', 'Root'], name: 'Recognition' },
  { gates: [32, 54], centers: ['Spleen', 'Root'], name: 'Transformation' },
  { gates: [34, 57], centers: ['Sacral', 'Spleen'], name: 'Power' },
  { gates: [35, 36], centers: ['Throat', 'SolarPlexus'], name: 'Transitoriness' },
  { gates: [37, 40], centers: ['SolarPlexus', 'Heart'], name: 'Community' },
  { gates: [39, 55], centers: ['Root', 'SolarPlexus'], name: 'Emoting' },
  { gates: [42, 53], centers: ['Sacral', 'Root'], name: 'Maturation' },
  { gates: [47, 64], centers: ['Ajna', 'Head'], name: 'Abstraction' },
] as const;
