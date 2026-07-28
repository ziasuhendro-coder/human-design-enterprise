// =====================================================
// AKSI: GANTI SELURUH ISI FILE
// PATH  : app/id/hd-test/page.tsx
// =====================================================
// Halaman ini SEMENTARA, khusus untuk menguji manual endpoint kalkulasi
// chart sebelum form onboarding resmi dibangun di Fase 5.

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface TimezoneOption {
  id: string;
  city_name: string;
  region: string | null;
  utc_offset_hours: number;
}

const containerStyle = {
  maxWidth: 640,
  margin: "0 auto",
  padding: 24,
  fontFamily: "monospace",
};

const labelStyle = {
  display: "block",
  width: "100%",
  padding: 8,
};

const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
};

const buttonStyle = {
  padding: 12,
};

const errorBoxStyle = {
  marginTop: 16,
  padding: 12,
  background: "#4a1010",
  color: "#ff8888",
};

const resultBoxStyle = {
  marginTop: 16,
  padding: 12,
  background: "#111111",
  color: "#00ff00",
  overflowX: "auto" as const,
  fontSize: 12,
};

const noteStyle = {
  color: "#888888",
  fontSize: 14,
};

export default function HdTestPage() {
  const [timezones, setTimezones] = useState<TimezoneOption[]>([]);
  const [birthDate, setBirthDate] = useState("1948-04-09");
  const [birthTime, setBirthTime] = useState("00:05");
  const [timezoneId, setTimezoneId] = useState("");
  const [result, setResult] = useState<string | null>(null);
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
          setError("Gagal memuat daftar timezone: " + fetchError.message);
          return;
        }
        const list = data ?? [];
        setTimezones(list);
        const montreal = list.find((tz) => tz.city_name === "Montreal");
        if (montreal) setTimezoneId(montreal.id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

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
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kesalahan tidak diketahui");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <h1>Test Kalkulasi Human Design (Sementara)</h1>
      <p style={noteStyle}>
        Default terisi data Ra Uru Hu, pendiri Human Design. Hasil yang diharapkan:
        Type Manifestor, Authority Splenic.
      </p>

      <form onSubmit={handleSubmit} style={formStyle}>
        <label>
          Tanggal Lahir
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={labelStyle}
          />
        </label>

        <label>
          Jam Lahir
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            style={labelStyle}
          />
        </label>

        <label>
          Kota / Timezone
          <select
            value={timezoneId}
            onChange={(e) => setTimezoneId(e.target.value)}
            style={labelStyle}
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

        <button type="submit" disabled={loading || !timezoneId} style={buttonStyle}>
          {loading ? "Menghitung..." : "Hitung Chart"}
        </button>
      </form>

      {error &&
