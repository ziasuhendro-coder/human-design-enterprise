// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : components/bodygraph/centerLayout.ts
// =====================================================

import { CenterName } from '@/lib/humandesign/data/centers';

export type CenterShape = 'triangle-up' | 'triangle-down' | 'square' | 'diamond';

export interface CenterLayout {
  cx: number;
  cy: number;
  shape: CenterShape;
  size: number;
}

/**
 * Posisi skematik 9 Center dalam koordinat SVG (viewBox 0 0 400 560).
 * Ini representasi sederhana/skematik, bukan proporsi resmi Jovian Archive,
 * tapi mengikuti tata letak umum Bodygraph yang dikenali secara luas.
 */
export const CENTER_LAYOUT: Record<CenterName, CenterLayout> = {
  Head: { cx: 200, cy: 40, shape: 'triangle-up', size: 36 },
  Ajna: { cx: 200, cy: 110, shape: 'triangle-down', size: 36 },
  Throat: { cx: 200, cy: 190, shape: 'square', size: 56 },
  G: { cx: 200, cy: 280, shape: 'diamond', size: 64 },
  Heart: { cx: 290, cy: 270, shape: 'triangle-up', size: 32 },
  Spleen: { cx: 110, cy: 360, shape: 'triangle-down', size: 50 },
  Sacral: { cx: 200, cy: 375, shape: 'square', size: 52 },
  SolarPlexus: { cx: 290, cy: 360, shape: 'triangle-down', size: 56 },
  Root: { cx: 200, cy: 470, shape: 'square', size: 56 },
};

function shapePoints(shape: CenterShape, cx: number, cy: number, size: number): string {
  const h = size / 2;
  switch (shape) {
    case 'triangle-up':
      return `${cx},${cy - h} ${cx - h},${cy + h} ${cx + h},${cy + h}`;
    case 'triangle-down':
      return `${cx - h},${cy - h} ${cx + h},${cy - h} ${cx},${cy + h}`;
    case 'diamond':
      return `${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`;
    case 'square':
    default:
      return `${cx - h},${cy - h} ${cx + h},${cy - h} ${cx + h},${cy + h} ${cx - h},${cy + h}`;
  }
}

export function getCenterShapePoints(center: CenterName): string {
  const layout = CENTER_LAYOUT[center];
  return shapePoints(layout.shape, layout.cx, layout.cy, layout.size);
}
