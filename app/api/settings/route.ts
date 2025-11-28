import { NextResponse } from 'next/server';
import { createClient as createSupabase } from '@supabase/supabase-js';
import { createAdminClient } from '@/utils/supabase/admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: Request) {
  try {
    const supabase = createSupabase(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'fx_usdclp')
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const record = data as any;
    if (!record || record.value == null) {
      return NextResponse.json(
        { error: 'FX rate not configured in settings' },
        { status: 404 }
      );
    }

    let rate: number;
    try {
      if (typeof record.value === 'object') {
        rate = Number(record.value.rate);
      } else {
        const parsed = JSON.parse(String(record.value));
        rate = Number(parsed.rate);
      }

      if (isNaN(rate)) {
        throw new Error('Invalid rate value');
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid FX rate format in settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ rate });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as any)?.message ?? String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    // Usar cliente admin para bypasear RLS
    const supabase = createAdminClient();
    const body = await req.json();

    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Missing key or value' },
        { status: 400 }
      );
    }

    // Validar que el rate sea un número válido
    if (typeof value === 'object' && value.rate) {
      const rate = Number(value.rate);
      if (isNaN(rate) || rate <= 0) {
        return NextResponse.json(
          { error: 'Invalid rate value' },
          { status: 400 }
        );
      }
    }

    // Intentar actualizar el registro existente
    const { data: updateData, error: updateError } = await supabase
      .from('settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select();

    // Si no existe, crear uno nuevo
    if (updateError || !updateData || updateData.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('settings')
        .insert({ key, value })
        .select();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data: insertData });
    }

    return NextResponse.json({ success: true, data: updateData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as any)?.message ?? String(error) },
      { status: 500 }
    );
  }
}
