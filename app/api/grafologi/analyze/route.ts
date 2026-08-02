import { NextRequest, NextResponse } from 'next/server';

// =========================================================
// API Route: analisis tanda tangan via Gemini Vision
// Panggil dari client: POST /api/grafologi/analyze
// Body: { imageBase64: string, mediaType: string }
// Perlu env var: GEMINI_API_KEY
// =========================================================

const PROMPT_ANALISIS = `Kamu adalah ahli grafologi (analisis tanda tangan/tulisan tangan) untuk aplikasi hiburan dan refleksi diri.

Amati gambar tanda tangan ini dan berikan analisis dalam Bahasa Indonesia mencakup:
1. Tekanan garis (tebal/tipis, kuat/ringan)
2. Kemiringan (tegak, condong kanan, condong kiri)
3. Ukuran (besar, sedang, kecil) dan konsistensi
4. Kesan umum karakter berdasarkan gaya visual tanda tangan tersebut (percaya diri, hati-hati, ekspresif, dll)

PENTING: Jawab HANYA dalam format JSON valid, tanpa markdown, tanpa penjelasan tambahan, persis seperti ini:
{
  "tekanan": "deskripsi singkat",
  "kemiringan": "deskripsi singkat",
  "ukuran": "deskripsi singkat",
  "kesan_karakter": "deskripsi 2-3 kalimat"
}`;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = 'gemini-3.6-flash';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mediaType, data: imageBase64 } },
                { text: PROMPT_ANALISIS },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ error: 'Gagal menganalisis gambar.' }, { status: 500 });
    }

    const data = await response.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    // Gemini kadang nambah teks pembuka/penutup meski diminta JSON murni.
    // Ambil substring dari '{' pertama sampai '}' terakhir biar lebih toleran.
    const mulai = rawText.indexOf('{');
    const akhir = rawText.lastIndexOf('}');
    const cleaned =
      mulai !== -1 && akhir !== -1 ? rawText.slice(mulai, akhir + 1) : rawText.trim();

    let hasil;
    try {
      hasil = JSON.parse(cleaned);
    } catch {
      console.error('Gagal parse JSON dari Gemini. Raw response:', rawText);
      return NextResponse.json(
        { error: 'Gagal memproses hasil analisis. Coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ hasil });
  } catch (err) {
    console.error('Grafologi analyze error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
