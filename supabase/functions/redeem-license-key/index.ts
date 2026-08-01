// =========================================================
// Edge Function: redeem-license-key
// Deploy ke: supabase/functions/redeem-license-key/index.ts
// Panggil dari client: supabase.functions.invoke('redeem-license-key', { body: { code } })
// =========================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALL_PANELS = [
  'lumina', 'primbon', 'tarot', 'fengshui', 'zodiak', 'grafologi', 'nomorologi',
];

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Tidak terautentikasi.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Client biasa untuk verifikasi identitas user yang memanggil
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Sesi tidak valid.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: 'Kode lisensi wajib diisi.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Client dengan service role untuk operasi yang butuh hak lebih tinggi
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: license, error: licenseError } = await supabaseAdmin
      .from('hd_licenses')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (licenseError || !license) {
      return new Response(JSON.stringify({ error: 'Kode lisensi tidak ditemukan.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (license.assigned_user_id && license.assigned_user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Kode lisensi sudah dipakai orang lain.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (license.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Kode lisensi tidak aktif.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (new Date(license.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Kode lisensi sudah kedaluwarsa.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Klaim lisensi untuk user ini (kalau belum pernah diklaim)
    if (!license.assigned_user_id) {
      const { error: updateError } = await supabaseAdmin
        .from('hd_licenses')
        .update({ assigned_user_id: user.id, activated_at: new Date().toISOString() })
        .eq('id', license.id);

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Gagal mengklaim lisensi.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Tentukan panel mana saja yang dibuka
    const panelsToGrant: string[] =
      license.panel_codes && license.panel_codes.length > 0
        ? license.panel_codes
        : ALL_PANELS;

    const rows = panelsToGrant.map((panel_code) => ({
      user_id: user.id,
      panel_code,
      license_key_id: license.id,
      is_active: true,
      expires_at: license.expires_at,
    }));

    const { error: accessError } = await supabaseAdmin
      .from('hd_panel_access')
      .upsert(rows, { onConflict: 'user_id,panel_code' });

    if (accessError) {
      return new Response(JSON.stringify({ error: 'Gagal memberikan akses panel.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, panels_granted: panelsToGrant }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('redeem-license-key error:', err);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan server.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

