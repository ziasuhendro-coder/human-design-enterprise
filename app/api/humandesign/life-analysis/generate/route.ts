// =====================================================
// AKSI: GANTI SELURUH ISI FILE
// PATH  : app/api/humandesign/life-analysis/generate/route.ts
// =====================================================
// PENTING: Route ini butuh env var GEMINI_API_KEY di Vercel (sudah ada).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LIFE_ANALYSIS_CATEGORIES, buildComboKey } from '@/lib/humandesign/data/lifeAnalysisSchema';

const GEMINI_MODEL = 'gemini-flash-latest';

interface GenerateRequestBody {
  typeName: string;
  authorityName: string;
  profileCode: string;
  forceRegenerate?: boolean;
}

function buildStructureHint(): string {
  return LIFE_ANALYSIS_CATEGORIES.map(
    (cat) => `"${cat.key}": { ${cat.fields.map((f) => `"${f.key}": "..."`).join(', ')} }`
  ).join(',\n  ');
}

function buildPrompt(typeName: string, authorityName: string, profileCode: string): string {
  return `Kamu adalah Senior Human Design Analyst, Senior Life Coach, dan Senior Psychology Analyst berpengalaman 20+ tahun.

Buat analisis kehidupan mendalam untuk seseorang dengan kombinasi Human Design berikut:
- Type: ${typeName}
- Authority: ${authorityName}
- Profile: ${profileCode}

Tulis dalam Bahasa Indonesia, gaya profesional, mudah dipahami, psikologis-praktis (bukan mistis berlebihan). Gunakan bahasa kecenderungan ("cenderung", "berpotensi", "salah satu peluang adalah"), JANGAN mengklaim kepastian masa depan — ini bukan ramalan, melainkan alat refleksi diri.

Tulis 2-4 kalimat per field, mencakup SEMUA kategori dan field berikut:
${LIFE_ANALYSIS_CATEGORIES.map((cat) => `${cat.label}: ${cat.fields.map((f) => f.label).join(', ')}`).join('\n')}

Balas HANYA dengan JSON valid, TANPA teks lain, TANPA markdown code fence, dengan struktur PERSIS seperti ini:
{
  ${buildStructureHint()}
}`;
}

function stripCodeFences(text: string): string {
  return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

async function callGemini(apiKey: string, prompt: string): Promise<unknown> {
  const res = await fetch(
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

  if (!res.ok) {
    const errText = await res.text();
    console.error('Gemini API error:', errText);
    throw new Error(`Gemini API mengembalikan error: ${res.status}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error('Respons Gemini tidak berisi teks:', JSON.stringify(data));
    throw new Error('Respons Gemini API tidak berisi teks');
  }

  return JSON.parse(stripCodeFences(text));
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: GenerateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body request bukan JSON valid' }, { status: 400 });
  }

  const { typeName, authorityName, profileCode, forceRegenerate } = body;

  if (!typeName || !authorityName || !profileCode) {
    return NextResponse.json(
      { error: 'typeName, authorityName, dan profileCode wajib diisi' },
      { status: 400 }
    );
  }

  const comboKey = buildComboKey(typeName, authorityName, profileCode);

  // hd_life_analysis belum terdaftar di Supabase generated types,
  // jadi kita cast ke `any` supaya TypeScript tidak memaksa tabel bertipe `never`.
  if (!forceRegenerate) {
    const { data: cached } = await (supabase.from('hd_life_analysis') as any)
      .select('content_id')
      .eq('combo_key', comboKey)
      .maybeSingle();

    if (cached?.content_id) {
      return NextResponse.json({
        success: true,
        cached: true,
        content_id: cached.content_id,
      });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY belum diatur di environment variables Vercel' },
      { status: 500 }
    );
  }

  let contentId: unknown;

  try {
    contentId = await callGemini(apiKey, buildPrompt(typeName, authorityName, profileCode));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghubungi Gemini API';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const insertRow = {
    combo_key: comboKey,
    type_name: typeName,
    authority_name: authorityName,
    profile_code: profileCode,
    content_id: contentId,
    generated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await (supabase.from('hd_life_analysis') as any).upsert(insertRow);

  if (upsertError) {
    console.error('Gagal menyimpan ke Supabase:', upsertError);
    return NextResponse.json({ error: 'Gagal menyimpan hasil ke database' }, { status: 500 });
  }

  return NextResponse.json({ success: true, cached: false, content_id: contentId });
}
