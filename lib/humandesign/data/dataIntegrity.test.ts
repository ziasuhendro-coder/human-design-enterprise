// =====================================================
// AKSI: GANTI SELURUH ISI FILE
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
    expect(MOTOR_CENTERS.slice().sort()).toEqual(
      ['Heart', 'Root', 'Sacral', 'SolarPlexus'].sort()
    );
  });
});

describe('Integritas data Channel', () => {
  it('tepat 36 channel', () => {
    expect(CHANNELS.length).toBe(36);
  });

  it('tidak ada channel yang terdefinisi dua kali (pasangan gate unik)', () => {
    const pairKeys = CHANNELS.map((c) => [...c.gates].sort((a, b) => a - b).join('-'));
    expect(new Set(pairKeys).size).toBe(36);
  });

  it('setiap gate dalam channel konsisten dengan center yang tercantum di GATE_TO_CENTER', () => {
    for (const channel of CHANNELS) {
      const [gateA, gateB] = channel.gates;
      const [centerA, centerB] = channel.centers;
      expect(GATE_TO_CENTER[gateA]).toBe(centerA);
      expect(GATE_TO_CENTER[gateB]).toBe(centerB);
    }
  });

  it('seluruh 64 gate (1-64) muncul di setidaknya satu channel', () => {
    const allChannelGates = new Set(CHANNELS.flatMap((c) => c.gates));
    expect(allChannelGates.size).toBe(64);
    for (let gate = 1; gate <= 64; gate++) {
      expect(allChannelGates.has(gate)).toBe(true);
    }
  });

  it('gate hub (10, 20, 34, 57) masing-masing muncul di tepat 3 channel, gate lain di tepat 1 channel', () => {
    const hubGates = new Set([10, 20, 34, 57]);
    const countByGate = new Map<number, number>();
    for (const channel of CHANNELS) {
      for (const g of channel.gates) {
        countByGate.set(g, (countByGate.get(g) ?? 0) + 1);
      }
    }
    for (let gate = 1; gate <= 64; gate++) {
      const expected = hubGates.has(gate) ? 3 : 1;
      expect(countByGate.get(gate)).toBe(expected);
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
