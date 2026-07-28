// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/data/dataIntegrity.test.ts
// =====================================================

import { describe, it, expect } from 'vitest';
import { ALL_CENTERS, CENTER_GATES, GATE_TO_CENTER, MOTOR_CENTERS } from './centers';
import { CHANNELS } from './channels';
import { GATE_WHEEL_ORDER } from './gateWheelOrder';

describe('Integritas data Center', () => {
  it('total gate di seluruh center tepat 64, tanpa duplikasi', () => {
    const allGates = ALL_CENTERS.flatMap((c) => CENTER_GATES[c]);
    expect(allGates.length).toBe(64);
    expect(new Set(allGates).size).toBe(64);
  });

  it('setiap gate 1-64 termasuk dalam tepat satu center', () => {
    for (let gate = 1; gate <= 64; gate++) {
      expect(GATE_TO_CENTER[gate]).toBeDefined();
    }
  });

  it('4 motor center sesuai definisi baku Human Design', () => {
    expect(MOTOR_CENTERS.sort()).toEqual(
      ['Heart', 'Root', 'Sacral', 'SolarPlexus'].sort()
    );
  });
});

describe('Integritas data Channel', () => {
  it('tepat 36 channel', () => {
    expect(CHANNELS.length).toBe(36);
  });

  it('72 slot gate dalam channel (36x2), semua unik (tiap gate hanya di 1 channel)', () => {
    const allChannelGates = CHANNELS.flatMap((c) => c.gates);
    expect(allChannelGates.length).toBe(72);
    expect(new Set(allChannelGates).size).toBe(72);
  });

  it('setiap gate dalam channel konsisten dengan center yang tercantum di GATE_TO_CENTER', () => {
    for (const channel of CHANNELS) {
      const [gateA, gateB] = channel.gates;
      const [centerA, centerB] = channel.centers;
      expect(GATE_TO_CENTER[gateA]).toBe(centerA);
      expect(GATE_TO_CENTER[gateB]).toBe(centerB);
    }
  });

  it('seluruh 64 gate genap muncul di suatu channel (setiap gate punya pasangan)', () => {
    const allChannelGates = new Set(CHANNELS.flatMap((c) => c.gates));
    for (let gate = 1; gate <= 64; gate++) {
      expect(allChannelGates.has(gate)).toBe(true);
    }
  });
});

describe('Integritas data Gate Wheel', () => {
  it('GATE_WHEEL_ORDER berisi tepat 64 gate unik, 1-64', () => {
    expect(GATE_WHEEL_ORDER.length).toBe(64);
    const sorted = [...GATE_WHEEL_ORDER].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
  });
});
