// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : components/bodygraph/BodygraphSvg.tsx
// =====================================================

"use client";

import { CENTER_LAYOUT, getCenterShapePoints } from "./centerLayout";
import { ALL_CENTERS, CENTER_GATES, CenterName } from "@/lib/humandesign/data/centers";
import { CHANNELS } from "@/lib/humandesign/data/channels";

export interface BodygraphSvgProps {
  definedCenters: CenterName[];
  definedChannelGatePairs: Array<[number, number]>;
  activeGates: number[];
}

const DEFINED_FILL = "#f5a623";
const UNDEFINED_FILL = "#1a1a1a";
const DEFINED_STROKE = "#f5a623";
const UNDEFINED_STROKE = "#555555";
const DEFINED_LINE = "#f5a623";
const UNDEFINED_LINE = "#333333";

function isChannelDefined(
  gates: readonly [number, number],
  definedPairs: Array<[number, number]>
): boolean {
  return definedPairs.some(
    ([a, b]) =>
      (a === gates[0] && b === gates[1]) || (a === gates[1] && b === gates[0])
  );
}

export default function BodygraphSvg({
  definedCenters,
  definedChannelGatePairs,
  activeGates,
}: BodygraphSvgProps) {
  const definedSet = new Set(definedCenters);
  const activeGateSet = new Set(activeGates);

  return (
    <svg viewBox="0 0 400 560" width="100%" style={{ maxWidth: 420, margin: "0 auto", display: "block" }}>
      {/* Garis Channel (digambar duluan supaya berada di belakang bentuk Center) */}
      {CHANNELS.map((channel) => {
        const [centerA, centerB] = channel.centers;
        const posA = CENTER_LAYOUT[centerA];
        const posB = CENTER_LAYOUT[centerB];
        const defined = isChannelDefined(channel.gates, definedChannelGatePairs);
        return (
          <line
            key={channel.gates.join("-")}
            x1={posA.cx}
            y1={posA.cy}
            x2={posB.cx}
            y2={posB.cy}
            stroke={defined ? DEFINED_LINE : UNDEFINED_LINE}
            strokeWidth={defined ? 4 : 1.5}
          />
        );
      })}

      {/* Bentuk 9 Center */}
      {ALL_CENTERS.map((center) => {
        const defined = definedSet.has(center);
        const layout = CENTER_LAYOUT[center];
        const gatesInCenter = CENTER_GATES[center];
        const activeGatesInCenter = gatesInCenter.filter((g) => activeGateSet.has(g));

        return (
          <g key={center}>
            <polygon
              points={getCenterShapePoints(center)}
              fill={defined ? DEFINED_FILL : UNDEFINED_FILL}
              stroke={defined ? DEFINED_STROKE : UNDEFINED_STROKE}
              strokeWidth={2}
            />
            <text
              x={layout.cx}
              y={layout.cy - layout.size / 2 - 6}
              textAnchor="middle"
              fontSize={10}
              fill="#cccccc"
              fontFamily="monospace"
            >
              {center}
            </text>
            <text
              x={layout.cx}
              y={layout.cy + 3}
              textAnchor="middle"
              fontSize={9}
              fill={defined ? "#1a1a1a" : "#888888"}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {activeGatesInCenter.length > 0 ? activeGatesInCenter.join(",") : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
