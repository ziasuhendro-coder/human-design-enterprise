// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/gates.ts
// =====================================================

import {
  GATE_WHEEL_ORDER,
  WHEEL_START_LONGITUDE,
  DEGREES_PER_GATE,
  DEGREES_PER_LINE,
} from './data/gateWheelOrder';
import { HumanDesignCalculationError } from './types';

/** Hasil konversi satu posisi bujur ekliptik menjadi koordinat Gate.Line. */
export interface GateLinePosition {
  /** Nomor Gate, 1-64. */
  gate: number;
  /** Nomor Line dalam Gate tersebut, 1-6. */
  line: number;
  /** Bujur ekliptik asal (derajat, 0-360) sebelum dikonversi. */
  sourceLongitude: number;
}

function normalizeAngle(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/**
 * Mengonversi satu nilai bujur ekliptik geosentris (derajat) menjadi
 * posisi Gate dan Line pada Rave Mandala.
 *
 * @param longitude - Bujur ekliptik dalam derajat (akan dinormalisasi ke 0-360).
 * @returns Gate (1-64) dan Line (1-6) yang bersesuaian.
 * @throws {HumanDesignCalculationError} jika longitude bukan angka valid.
 */
export function longitudeToGateLine(longitude: number): GateLinePosition {
  if (typeof longitude !== 'number' || Number.isNaN(longitude)) {
    throw new HumanDesignCalculationError(
      `Bujur ekliptik tidak valid: ${longitude}`
    );
  }

  const normalized = normalizeAngle(longitude);

  // Jarak sudut dari titik mulai wheel (Gate 41 @ 302°), searah pergerakan wheel.
  const offsetFromStart = normalizeAngle(normalized - WHEEL_START_LONGITUDE);

  // Index gate ke berapa dalam urutan wheel (0-63).
  const gateIndex = Math.floor(offsetFromStart / DEGREES_PER_GATE);

  // Posisi derajat relatif di dalam gate tersebut (0 - 5.625°).
  const positionWithinGate = offsetFromStart - gateIndex * DEGREES_PER_GATE;

  // Line ke berapa dalam gate tersebut (0-5), lalu +1 agar hasilnya 1-6.
  let lineIndex = Math.floor(positionWithinGate / DEGREES_PER_LINE);

  // Pengaman pembulatan floating-point di batas tepat antar line/gate.
  if (lineIndex > 5) lineIndex = 5;
  if (gateIndex > 63) {
    throw new HumanDesignCalculationError(
      `Index gate di luar rentang valid (0-63): dihitung ${gateIndex} dari longitude ${longitude}°`
    );
  }

  const gate = GATE_WHEEL_ORDER[gateIndex];

  return {
    gate,
    line: lineIndex + 1,
    sourceLongitude: normalized,
  };
}
