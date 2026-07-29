// =====================================================
// AKSI: GANTI SELURUH ISI FILE
// PATH  : app/api/admin/entity-content/generate/route.ts
// =====================================================
// PENTING: Route ini butuh env var GEMINI_API_KEY di Vercel
// (Settings -> Environment Variables -> tambahkan untuk Production).
// Dapatkan API key gratis di https://aistudio.google.com/apikey

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  TYPE_NAMES,
  AUTHORITY_NAMES,
  PROFILE_CODES,
  CENTER_NAMES,
  CHANNEL_CODES,
  PLANET_NAMES,
} from '@/lib/humandesign/data/entityNames';
import {
  ENTITY_TYPE_REGISTRY,
  EntityType,
  CENTER_STATE_FIELD_KEYS,
} from '@/lib/humandesign/data/entityContentSchemas';

const GEMINI_MODEL = 'gemini-2.5-flash';

interface GenerateRequestBody {
  entityType: EntityType;
  entityKey: string;
}

function getValidKeysForEntityType(entityType: EntityType): string[] {
  switch (entityType) {
    case 'type':
      return TYPE_NAMES;
    case 'authority':
      return AUTHORITY_NAMES;
    case 'profile':
      return PROFILE_CODES;
    case 'center':
      return CENTER_NAMES;
    case 'channel':
      return CHANNEL_CODES;
    case 'planet':
      return PLANET_NAMES;
    default:
      return [];
  }
}

function buildPrompt(entityType: EntityType, entityLabel: string, entityKey: string, fieldKeys: string): string {
  const baseIntro = `Kamu adalah penulis konten profesional untuk aplikasi self-knowledge Human Design Enterprise.

Tulis interpretasi ORISINAL (bukan salinan dari situs Human Design manapun, termasuk Jovian Archive) untuk ${entityLabel} "${entityKey}" dalam sistem Human Design.

Tulis dalam gaya profesional, mudah dipahami untuk pemula maupun lanjutan, dengan nuansa psikologis-praktis (bukan mistis berlebihan). Beri penanda jelas jika suatu bagian merupakan interpretasi AI/saran praktis, bukan fakta yang dapat diverifikasi.`;

  if (entityType === 'center') {
    return `${baseIntro}

Center ini punya dua kondisi berbeda yang harus dijelaskan TERPISAH: "defined" (menyala/terisi secara konsisten) dan "open" (terbuka/menerima kondisi dari luar).

Field yang harus diisi untuk MASING-MASING kondisi (teks 2-4 kalimat per field): ${fieldKeys}

Balas HANYA dengan JSON valid, TANPA teks lain, TANPA markdown code fence, dengan struktur PERSIS seperti ini:
{
  "content_id": {
    "defined": { <semua field di atas, Bahasa Indonesia> },
    "open": { <semua field di atas, Bahasa Indonesia> }
  },
  "content_en": {
    "defined": { <semua field yang sama, Bahasa Inggris> },
    "open": { <semua field yang sama, Bahasa Inggris> }
  }
}`;
  }

  return `${baseIntro}

Field yang harus diisi (teks 2-4 kalimat per field, kecuali field afirmasi/prompt singkat 1 kalimat): ${fieldKeys}

Balas HANYA dengan JSON valid, TANPA teks lain, TANPA markdown code fence, dengan struktur PERSIS seperti ini:
{
  "content_id": { <semua field di atas, isi dalam Bahasa Indonesia> },
  "content_en": { <semua field yang sama, isi dalam Bahasa Inggris> }
}`;
}

function stripCodeFences(text: string): string {
  return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('hd_users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (!profile || profile.role !== 'master') {
    return NextResponse.json({ error: 'Hanya master yang boleh generate konten' }, { status: 403 });
  }

  let body: GenerateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body request bukan JSON valid' }, { status: 400 });
  }

  const { entityType, entityKey } = body;
  const config = ENTITY_TYPE_REGISTRY.find((c) => c.entityType === entityType);

  if (!config) {
    return NextResponse.json({ error: 'entityType tidak valid' }, { status: 400 });
  }

  const validKeys = getValidKeysForEntityType(entityType);
  if (!entityKey || !validKeys.includes(entityKey)) {
    return NextResponse.json({ error: `entityKey tidak valid untuk entityType "${entityType}"` }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY belum diatur di environment variables Vercel' },
      { status: 500 }
    );
  }

  const fieldKeys = entityType === 'center' ? CENTER_STATE_FIELD_KEYS : config.fieldKeys;
  const prompt = buildPrompt(entityType, config.label, entityKey, fieldKeys);

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 8192 },
        }),
      }
    );
  } catch (err) {
    console.error('Gagal menghubungi Gemini API:', err);
    return NextResponse.json({ error: 'Gagal menghubungi Gemini API' }, { status: 502 });
  }

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    console.error('Gemini API error:', errText);
    return NextResponse.json(
      { error: `Gemini API mengembalikan error: ${geminiResponse.status}` },
      { status: 502 }
    );
  }

  const geminiData = await geminiResponse.json();
  const text: string | undefined = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error('Respons Gemini tidak berisi teks:', JSON.stringify(geminiData));
    return NextResponse.json({ error: 'Respons Gemini API tidak berisi teks' }, { status: 502 });
  }

  let parsed: { content_id: unknown; content_en: unknown };
  try {
    parsed = JSON.parse(stripCodeFences(text));
  } catch (err) {
    console.error('Gagal parse JSON dari Gemini:', text);
    return NextResponse.json(
      { error: 'Gagal parse hasil AI sebagai JSON. Coba generate ulang.' },
      { status: 502 }
    );
  }

  if (!parsed.content_id || !parsed.content_en) {
    return NextResponse.json(
      { error: 'Hasil AI tidak lengkap (content_id/content_en hilang). Coba generate ulang.' },
      { status: 502 }
    );
  }

  const insertRow: Record<string, unknown> = {
    [config.keyColumn]: entityKey,
    content_id: parsed.content_id,
    content_en: parsed.content_en,
    generated_at: new Date().toISOString(),
    reviewed: false,
    reviewed_at: null,
    reviewed_by: null,
  };

  // Tabel-tabel ini belum terdaftar di Supabase generated types,
  // jadi kita cast ke `any` supaya TypeScript tidak memaksa
  // tabel bertipe `never`.
  const { error: upsertError } = await (supabase.from(config.tableName) as any).upsert(insertRow);

  if (upsertError) {
    console.error('Gagal menyimpan ke Supabase:', upsertError);
    return NextResponse.json({ error: 'Gagal menyimpan hasil ke database' }, { status: 500 });
  }

  return NextResponse.json({ success: true, content_id: parsed.content_id, content_en: parsed.content_en });
}
