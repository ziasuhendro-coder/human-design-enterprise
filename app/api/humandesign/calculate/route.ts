// =====================================================
// AKSI: GANTI SELURUH ISI FILE
// PATH  : app/api/humandesign/calculate/route.ts
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateHumanDesignChart } from '@/lib/humandesign/chart';
import { HumanDesignCalculationError } from '@/lib/humandesign/types';

interface CalculateRequestBody {
  birthDate: string;   // format 'YYYY-MM-DD'
  birthTime: string;   // format 'HH:mm'
  timezoneId: string;  // uuid dari tabel hd_timezones
}

interface HdTimezoneRow {
  utc_offset_hours: number;
  city_name: string;
  timezone_name: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CalculateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body request bukan JSON valid' }, { status: 400 });
  }

  const { birthDate, birthTime, timezoneId } = body;

  if (!birthDate || !birthTime || !timezoneId) {
    return NextResponse.json(
      { error: 'birthDate, birthTime, dan timezoneId wajib diisi' },
      { status: 400 }
    );
  }

  const { data: tz, error: tzError } = await supabase
    .from('hd_timezones')
    .select('utc_offset_hours, city_name, timezone_name')
    .eq('id', timezoneId)
    .single<HdTimezoneRow>();

  if (tzError || !tz) {
    return NextResponse.json({ error: 'Timezone tidak ditemukan' }, { status: 404 });
  }

  // Bangun waktu lahir lokal sebagai UTC "naif", lalu kurangi offset untuk
  // mendapatkan UTC sebenarnya. Contoh: 10:00 lokal di UTC+7 -> 03:00 UTC.
  const localNaiveIso = `${birthDate}T${birthTime}:00.000Z`;
  const localNaiveDate = new Date(localNaiveIso);

  if (Number.isNaN(localNaiveDate.getTime())) {
    return NextResponse.json({ error: 'Format birthDate/birthTime tidak valid' }, { status: 400 });
  }

  const birthDateUtc = new Date(
    localNaiveDate.getTime() - tz.utc_offset_hours * 60 * 60 * 1000
  );

  try {
    const chart = calculateHumanDesignChart(birthDateUtc);
    return NextResponse.json({
      chart,
      meta: {
        inputLocalTime: `${birthDate} ${birthTime}`,
        timezone: tz.timezone_name,
        city: tz.city_name,
        birthDateUtc: birthDateUtc.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof HumanDesignCalculationError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error('Kesalahan tak terduga saat menghitung chart:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan internal' }, { status: 500 });
  }
                              }
