// =====================================================
// AKSI: GANTI ISI FILE YANG SUDAH ADA (jika sudah dibuat sebelumnya)
// PATH  : lib/humandesign/ephemeris.ts
// =====================================================

import * as Astronomy from 'astronomy-engine';
import {
  BodyLongitudes,
  HumanDesignCalculationError,
  SUPPORTED_DATE_RANGE,
} from './types';

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

/** Rata-rata kecepatan sudut Matahari di ekliptika (derajat/hari), dipakai sebagai estimasi awal iterasi. */
const MEAN_SOLAR_DAILY_MOTION = 0.9856;

/** Toleransi konvergensi pencarian tanggal Design (derajat). */
const DESIGN_DATE_CONVERGENCE_TOLERANCE = 0.0001;

/** Batas maksimum iterasi Newton untuk mencegah infinite loop jika terjadi anomali numerik. */
const MAX_ITERATIONS = 20;

/**
 * Menormalisasi sudut derajat ke rentang [0, 360).
 */
function normalizeAngle(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/**
 * Memastikan tanggal input valid dan berada dalam rentang yang didukung
 * dengan akurasi baik oleh astronomy-engine.
 *
 * @throws {HumanDesignCalculationError} jika tanggal invalid atau di luar rentang.
 */
function assertValidDate(date: Date, label: string): void {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new HumanDesignCalculationError(
      `${label} tidak valid: bukan objek Date yang benar.`
    );
  }
  if (date < SUPPORTED_DATE_RANGE.min || date > SUPPORTED_DATE_RANGE.max) {
    throw new HumanDesignCalculationError(
      `${label} berada di luar rentang yang didukung (1900-2100).`
    );
  }
}

/**
 * Menghitung bujur mean lunar node (titik potong orbit Bulan dengan ekliptika)
 * menggunakan formula standar astronomi (Meeus, "Astronomical Algorithms", Ch. 22).
 *
 * Catatan: ini adalah "mean node", bukan "true node". Mayoritas implementasi
 * Human Design tradisional menggunakan mean node untuk konsistensi historis.
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
 * Menghitung bujur ekliptik geosentris Matahari pada suatu waktu UTC.
 *
 * @throws {HumanDesignCalculationError} jika perhitungan astronomi gagal.
 */
function getSunLongitude(date: Date): number {
  try {
    const sunEcl = Astronomy.SunPosition(date);
    return normalizeAngle(sunEcl.elon);
  } catch (err) {
    throw new HumanDesignCalculationError(
      'Gagal menghitung posisi Matahari.',
      err
    );
  }
}

/**
 * Menghitung posisi ekliptik geosentris (bujur) Matahari dan seluruh planet
 * yang relevan dalam sistem Human Design, pada suatu waktu UTC tertentu.
 *
 * @param date - Waktu observasi dalam UTC (bukan waktu lokal).
 * @returns Kumpulan bujur ekliptik (derajat, 0-360) untuk tiap benda langit.
 * @throws {HumanDesignCalculationError} jika tanggal invalid atau perhitungan gagal.
 */
export function getBodyLongitudes(date: Date): BodyLongitudes {
  assertValidDate(date, 'Tanggal observasi');

  try {
    const sunLon = getSunLongitude(date);
    const earthLon = normalizeAngle(sunLon + 180);

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
  } catch (err) {
    if (err instanceof HumanDesignCalculationError) throw err;
    throw new HumanDesignCalculationError(
      'Gagal menghitung posisi benda langit.',
      err
    );
  }
}

/**
 * Mencari tanggal "Design" — yaitu saat Matahari berada tepat 88 derajat
 * busur ekliptika SEBELUM posisi Matahari pada waktu lahir (Personality).
 *
 * Menggunakan iterasi Newton-Raphson sederhana karena kecepatan sudut
 * Matahari bervariasi sepanjang tahun (orbit Bumi elips, bukan lingkaran
 * sempurna), sehingga estimasi linear 88 hari saja tidak cukup presisi.
 *
 * @param birthDate - Waktu lahir dalam UTC.
 * @returns Tanggal Design dalam UTC.
 * @throws {HumanDesignCalculationError} jika tanggal invalid atau iterasi tidak konvergen.
 */
export function findDesignDate(birthDate: Date): Date {
  assertValidDate(birthDate, 'Tanggal lahir');

  const personalitySunLon = getSunLongitude(birthDate);
  const targetLon = normalizeAngle(personalitySunLon - 88);

  // Estimasi awal: 88 hari sebelum lahir (rata-rata pergerakan matahari ~0.9856°/hari)
  let candidate = new Date(birthDate.getTime() - 88 * 24 * 60 * 60 * 1000);
  let converged = false;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const currentLon = getSunLongitude(candidate);
    let diff = targetLon - currentLon;

    // Normalisasi selisih ke rentang -180..180 agar iterasi konvergen ke arah terpendek
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < DESIGN_DATE_CONVERGENCE_TOLERANCE) {
      converged = true;
      break;
    }

    const daysAdjust = diff / MEAN_SOLAR_DAILY_MOTION;
    candidate = new Date(candidate.getTime() + daysAdjust * 24 * 60 * 60 * 1000);
  }

  if (!converged) {
    throw new HumanDesignCalculationError(
      'Perhitungan tanggal Design tidak konvergen setelah iterasi maksimum. ' +
      'Kemungkinan data tanggal lahir berada di luar rentang yang didukung dengan presisi tinggi.'
    );
  }

  // Validasi akhir: pastikan hasil tetap dalam rentang yang didukung
  assertValidDate(candidate, 'Tanggal Design hasil perhitungan');

  return candidate;
}
