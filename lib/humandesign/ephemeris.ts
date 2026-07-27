// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : lib/humandesign/ephemeris.ts
// =====================================================

import * as Astronomy from 'astronomy-engine';

export interface BodyLongitudes {
  sun: number;
  earth: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  uranus: number;
  neptune: number;
  pluto: number;
  northNode: number;
  southNode: number;
}

const PLANET_BODIES: { key: keyof BodyLongitudes; body: Astronomy.Body }[] = [
  { key: 'mercury', body: Astronomy.Body.Mercury },
  { key: 'venus', body: Astronomy.Body.Venus },
  { key: 'mars', body: Astronomy.Body.Mars },
  { key: 'jupiter', body: Astronomy.Body.Jupiter },
  { key: 'saturn', body: Astronomy.Body.Saturn },
  { key: 'uranus', body: Astronomy.Body.Uranus },
  { key: 'neptune', body: Astronomy.Body.Neptune },
  { key: 'pluto', body: Astronomy.Body.Pluto },
];

function normalizeAngle(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/**
 * Hitung mean lunar node (titik potong orbit bulan dengan ekliptika).
 * Formula standar astronomi (Meeus, Astronomical Algorithms).
 */
function meanLunarNodeLongitude(date: Date): number {
  const jd = Astronomy.MakeTime(date).tt;
  const T = (jd - 2451545.0) / 36525.0;
  const omega =
    125.0445222 -
    1934.1362608 * T +
    0.0020708 * T * T +
    (T * T * T) / 450000;
  return normalizeAngle(omega);
}

/**
 * Hitung posisi ekliptik geosentris (bujur/longitude) Matahari & seluruh planet
 * pada suatu waktu UTC tertentu.
 */
export function getBodyLongitudes(date: Date): BodyLongitudes {
  // Matahari (geosentris apparent)
  const sunEcl = Astronomy.SunPosition(date);
  const sunLon = normalizeAngle(sunEcl.elon);

  // Earth di Human Design = titik berlawanan (oposisi) dari Matahari
  const earthLon = normalizeAngle(sunLon + 180);

  // Bulan
  const moonVector = Astronomy.GeoVector(Astronomy.Body.Moon, date, true);
  const moonEcl = Astronomy.Ecliptic(moonVector);
  const moonLon = normalizeAngle(moonEcl.elon);

  const longitudes: Partial<BodyLongitudes> = {
    sun: sunLon,
    earth: earthLon,
    moon: moonLon,
  };

  for (const { key, body } of PLANET_BODIES) {
    const vector = Astronomy.GeoVector(body, date, true);
    const ecl = Astronomy.Ecliptic(vector);
    longitudes[key] = normalizeAngle(ecl.elon);
  }

  const northNode = meanLunarNodeLongitude(date);
  const southNode = normalizeAngle(northNode + 180);

  return {
    ...longitudes,
    northNode,
    southNode,
  } as BodyLongitudes;
}

/**
 * Cari tanggal "Design" — yaitu saat Matahari berada 88 derajat busur
 * SEBELUM posisi Matahari pada waktu lahir (Personality).
 * Dicari secara iteratif karena kecepatan Matahari sedikit bervariasi.
 */
export function findDesignDate(birthDate: Date): Date {
  const personalitySunLon = normalizeAngle(Astronomy.SunPosition(birthDate).elon);
  const targetLon = normalizeAngle(personalitySunLon - 88);

  // Tebakan awal: 88 hari sebelum lahir (rata-rata pergerakan matahari ~1 derajat/hari)
  let candidate = new Date(birthDate.getTime() - 88 * 24 * 60 * 60 * 1000);

  // Iterasi Newton sederhana untuk presisi tinggi
  for (let i = 0; i < 8; i++) {
    const currentLon = normalizeAngle(Astronomy.SunPosition(candidate).elon);
    let diff = targetLon - currentLon;

    // Normalisasi selisih ke rentang -180..180 agar iterasi konvergen
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.0001) break;

    // Matahari bergerak ~0.9856 derajat/hari
    const daysAdjust = diff / 0.9856;
    candidate = new Date(candidate.getTime() + daysAdjust * 24 * 60 * 60 * 1000);
  }

  return candidate;
    }
