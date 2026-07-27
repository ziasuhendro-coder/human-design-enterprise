// =====================================================
// AKSI: GANTI ISI FILE YANG SUDAH ADA
// PATH  : supabase/functions/assign-license/index.ts
// =====================================================

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Pastikan pemanggil adalah master
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: callerProfile, error: profileErr } = await supabaseAdmin
      .from('hd_users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileErr || callerProfile?.role !== 'master') {
      return new Response(JSON.stringify({ error: 'Forbidden: master role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ambil input
    const { target_user_id, license_type, notes } = await req.json();

    const validTypes = ['trial', '1_month', '6_month', '1_year', 'permanent'];
    if (!target_user_id || !validTypes.includes(license_type)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cek target user ada
    const { data: targetUser, error: targetErr } = await supabaseAdmin
      .from('hd_users')
      .select('id, email')
      .eq('id', target_user_id)
      .single();

    if (targetErr || !targetUser) {
      return new Response(JSON.stringify({ error: 'Target user not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate kode via fungsi SQL
    const { data: codeData, error: codeErr } = await supabaseAdmin
      .rpc('hd_generate_license_code');

    if (codeErr || !codeData) {
      throw new Error('Failed to generate license code');
    }

    // Hitung expiry via fungsi SQL
    const { data: expiryData, error: expiryErr } = await supabaseAdmin
      .rpc('hd_calculate_license_expiry', { p_license_type: license_type });

    if (expiryErr || !expiryData) {
      throw new Error('Failed to calculate expiry');
    }

    // Insert lisensi
    const { data: license, error: insertErr } = await supabaseAdmin
      .from('hd_licenses')
      .insert({
        code: codeData,
        license_type,
        status: 'active',
        assigned_user_id: target_user_id,
        assigned_by: user.id,
        expires_at: expiryData,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Catat ke audit log — sesuai struktur tabel hd_audit_log yang sebenarnya
    await supabaseAdmin.from('hd_audit_log').insert({
      actor_id: user.id,
      actor_email: callerProfile.email,
      action: 'license_assigned',
      target_id: license.id,
      target_table: 'hd_licenses',
      description: `Lisensi ${license.code} (${license_type}) diberikan ke ${targetUser.email}`,
      metadata: {
        license_code: license.code,
        target_user_email: targetUser.email,
        license_type,
      },
    });

    return new Response(JSON.stringify({ success: true, license }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
