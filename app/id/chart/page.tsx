// =====================================================
// AKSI: GANTI SELURUH ISI FILE
// PATH  : app/id/chart/page.tsx
// =====================================================

"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import BodygraphSvg from "@/components/bodygraph/BodygraphSvg";
import HeroSummaryCard from "@/components/results/HeroSummaryCard";
import ExportButtons from "@/components/results/ExportButtons";
import { CenterName } from "@/lib/humandesign/data/centers";
import {
  getTypeContentKey,
  getAuthorityContentKey,
  getTypeSignature,
} from "@/lib/humandesign/data/chartValueMappings";

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

export default function HdChartPage() {
  const [timezones, setTimezones] = useState<TimezoneOption[]>([]);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timezoneId, setTimezoneId] = useState("");
  const [chart, setChart] = useState<HumanDesignChartResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Konten hasil generate dari master panel, dipetakan sesuai chart yang dihitung
  const [typeContent, setTypeContent] = useState<Record<string, string> | null>(null);
  const [authorityContent, setAuthorityContent] = useState<Record<string, string> | null>(null);
  const [profileContent, setProfileContent] = useState<Record<string, string> | null>(null);

  // Refs untuk export JPG (Hero Summary + Bodygraph + Channel) dan PDF (gambar Bodygraph saja)
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const bodygraphOnlyRef = useRef<HTMLDivElement>(null);

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

  async function loadRelatedContent(result: HumanDesignChartResult) {
    const supabase = createClient();
    const typeKey = getTypeContentKey(result.type);
    const authorityKey = getAuthorityContentKey(result.authority);

    // Tabel-tabel ini belum terdaftar di Supabase generated types,
    // jadi kita cast ke `any` supaya TypeScript tidak memaksa
    // tabel bertipe `never`.
    const [typeRes, authorityRes, profileRes] = await Promise.all([
      (supabase.from('hd_type_content') as any)
        .select('content_id')
        .eq('type_name', typeKey)
        .maybeSingle(),
      (supabase.from('hd_authority_content') as any)
        .select('content_id')
        .eq('authority_name', authorityKey)
        .maybeSingle(),
      (supabase.from('hd_profile_content') as any)
        .select('content_id')
        .eq('profile_code', result.profile)
        .maybeSingle(),
    ]);

    setTypeContent((typeRes.data?.content_id as Record<string, string>) ?? null);
    setAuthorityContent((authorityRes.data?.content_id as Record<string, string>) ?? null);
    setProfileContent((profileRes.data?.content_id as Record<string, string>) ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setChart(null);
    setTypeContent(null);
    setAuthorityContent(null);
    setProfileContent(null);

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
        const result = data.chart as HumanDesignChartResult;
        setChart(result);
        loadRelatedContent(result);
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

  const typeSig = chart ? getTypeSignature(chart.type) : null;
  const typeLabel = chart ? (TYPE_LABELS[chart.type] ?? chart.type) : "";
  const authorityLabel = chart ? (AUTHORITY_LABELS[chart.authority] ?? chart.authority) : "";

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

        {chart && typeSig && (
          <div ref={exportContainerRef} style={{ marginTop: 24 }}>
            <HeroSummaryCard
              name={name}
              typeLabel={typeLabel}
              authorityLabel={authorityLabel}
              profile={chart.profile}
              signature={typeSig.signature}
              notSelf={typeSig.notSelf}
              typeContent={typeContent}
              authorityContent={authorityContent}
              profileContent={profileContent}
            />

            <div style={resultCardStyle}>
              <h2 style={{ marginTop: 0 }}>Bodygraph</h2>

              <div ref={bodygraphOnlyRef} style={{ marginTop: 20, background: "#151515" }}>
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
          </div>
        )}

        {chart && typeSig && (
          <ExportButtons
            jpgTargetRef={exportContainerRef}
            bodygraphRef={bodygraphOnlyRef}
            name={name}
            typeLabel={typeLabel}
            authorityLabel={authorityLabel}
            profile={chart.profile}
            signature={typeSig.signature}
            notSelf={typeSig.notSelf}
            typeContent={typeContent}
            authorityContent={authorityContent}
            profileContent={profileContent}
          />
        )}
      </div>
    </div>
  );
}
