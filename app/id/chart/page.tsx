// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : app/id/chart/page.tsx
// =====================================================

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import BodygraphSvg from "@/components/bodygraph/BodygraphSvg";
import { CenterName } from "@/lib/humandesign/data/centers";

interface TimezoneOption {
  id: string;
  city_name: string;
  region: string | null;
  utc_offset_hours: number;
}

interface PlanetaryActivation {
  body: string;
  gate: number;
  line: number;
  longitude: number;
}

interface DefinedChannelSummary {
  gates: [number, number];
  name: string;
}

interface HumanDesignChartResult {
  personality: PlanetaryActivation[];
  design: PlanetaryActivation[];
  definedCenters: CenterName[];
  definedChannels: DefinedChannelSummary[];
  type: string;
  authority: string;
  profile: string;
}

const TYPE_LABELS: Record<string, string> = {
  Manifestor: "Manifestor",
  Generator: "Generator",
  ManifestingGenerator: "Manifesting Generator",
  Projector: "Projector",
  Reflector: "Reflector",
};

const AUTHORITY_LABELS: Record<string, string> = {
  Emotional: "Emotional (Solar Plexus)",
  Sacral: "Sacral",
  Splenic: "Splenic",
  Ego: "Ego (Heart)",
  SelfProjected: "Self-Projected (G)",
  Mental: "Mental (Projector)",
  Lunar: "Lunar (Reflector)",
};

const pageStyle = { minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0" };
const containerStyle = { maxWidth: 640, margin: "0 auto", padding: 24, fontFamily: "sans-serif" };
const inputStyle = {
  display: "block",
  width: "100%",
  padding: 10,
  marginTop: 6,
  background: "#ffffff",
  color: "#000000",
  border: "2px solid #666666",
  borderRadius: 6,
  fontSize: 16,
  boxSizing: "border-box" as const,
};
const formStyle = { display: "flex", flexDirection: "column" as const, gap: 16 };
const buttonStyle = {
  padding: 14,
  background: "#f5a623",
  color: "#000000",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold" as const,
  fontSize: 16,
};
const buttonDisabledStyle = { ...buttonStyle, background: "#555555", color: "#aaaaaa" };
const errorBoxStyle = { marginTop: 16, padding: 12, background: "#4a1010", color: "#ff8888", borderRadius: 6 };
const resultCardStyle = { marginTop: 24, padding: 20, background: "#151515", borderRadius: 10 };
const summaryRowStyle = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #333333" };

export default function HdChartPage() {
  const [timezones, setTimezones] = useState<TimezoneOption[]>([]);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timezoneId, setTimezoneId] = useState("");
  const [chart, setChart] = useState<HumanDesignChartResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("hd_timezones")
      .select("id, city_name, region, utc_offset_hours")
      .order("city_name")
      .returns<TimezoneOption[]>()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError("Gagal memuat daftar kota: " + fetchError.message);
          return;
        }
        setTimezones(data ?? []);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setChart(null);

    try {
      const res = await fetch("/api/humandesign/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime, timezoneId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request gagal dengan status " + res.status);
      } else {
        setChart(data.chart as HumanDesignChartResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kesalahan tidak diketahui");
    } finally {
      setLoading(false);
    }
  }

  const activeGates = chart
    ? Array.from(new Set([...chart.personality.map((a) => a.gate), ...chart.design.map((a) => a.gate)]))
    : [];

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1>Hitung Chart Human Design</h1>
        <p style={{ color: "#aaaaaa", fontSize: 14 }}>
          Data lahir tidak disimpan di server, hanya dipakai untuk menghitung chart saat ini.
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label>
            Nama
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama untuk ditampilkan di hasil"
              style={inputStyle}
              required
            />
          </label>

          <label>
            Tanggal Lahir
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={inputStyle}
              required
            />
          </label>

          <label>
            Jam Lahir
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              style={inputStyle}
              required
            />
          </label>

          <label>
            Kota Lahir
            <select
              value={timezoneId}
              onChange={(e) => setTimezoneId(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">-- Pilih kota --</option>
              {timezones.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.city_name} {tz.region ? "(" + tz.region + ")" : ""} UTC
                  {tz.utc_offset_hours >= 0 ? "+" : ""}
                  {tz.utc_offset_hours}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={loading || !timezoneId || !name || !birthDate || !birthTime}
            style={
              loading || !timezoneId || !name || !birthDate || !birthTime
                ? buttonDisabledStyle
                : buttonStyle
            }
          >
            {loading ? "Menghitung..." : "Hitung Chart"}
          </button>
        </form>

        {error && <div style={errorBoxStyle}>Error: {error}</div>}

        {chart && (
          <div style={resultCardStyle}>
            <h2 style={{ marginTop: 0 }}>Chart {name}</h2>

            <div style={summaryRowStyle}>
              <span style={{ color: "#aaaaaa" }}>Type</span>
              <strong>{TYPE_LABELS[chart.type] ?? chart.type}</strong>
            </div>
            <div style={summaryRowStyle}>
              <span style={{ color: "#aaaaaa" }}>Authority</span>
              <strong>{AUTHORITY_LABELS[chart.authority] ?? chart.authority}</strong>
            </div>
            <div style={{ ...summaryRowStyle, borderBottom: "none" }}>
              <span style={{ color: "#aaaaaa" }}>Profile</span>
              <strong>{chart.profile}</strong>
            </div>

            <div style={{ marginTop: 20 }}>
              <BodygraphSvg
                definedCenters={chart.definedCenters}
                definedChannelGatePairs={chart.definedChannels.map((c) => c.gates)}
                activeGates={activeGates}
              />
            </div>

            {chart.definedChannels.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 14, color: "#aaaaaa", marginBottom: 8 }}>
                  Channel Aktif ({chart.definedChannels.length})
                </h3>
                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 14 }}>
                  {chart.definedChannels.map((c) => (
                    <li key={c.gates.join("-")}>
                      {c.gates[0]}-{c.gates[1]}: {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
      }
