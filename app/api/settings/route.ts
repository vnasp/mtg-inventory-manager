import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const game = searchParams.get('game'); // 'mtg'

    if (!game) {
      return NextResponse.json(
        { error: 'Missing game parameter' },
        { status: 400 }
      );
    }

    // Obtener configuración específica del juego
    const { data, error } = await supabase
      .from('mtg_settings')
      .select('value')
      .eq('key', game)
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let settings = {};

    if (data && data.value != null) {
      try {
        if (typeof data.value === 'object') {
          settings = data.value as Record<string, unknown>;
        } else {
          settings = JSON.parse(String(data.value)) as Record<string, unknown>;
        }
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }

    return NextResponse.json(settings);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
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

    // Validar según el tipo de clave
    if (key === 'mtg') {
      if (typeof value === 'object') {
        if (value.fx_usdclp?.rate !== undefined) {
          const rate = Number(value.fx_usdclp.rate);
          if (isNaN(rate) || rate <= 0) {
            return NextResponse.json(
              { error: 'Invalid fx_usdclp.rate value' },
              { status: 400 }
            );
          }
        }
        if (value.min_card_price_clp?.amount !== undefined) {
          const minPrice = Number(value.min_card_price_clp.amount);
          if (isNaN(minPrice) || minPrice < 0) {
            return NextResponse.json(
              { error: 'Invalid min_card_price_clp.amount value' },
              { status: 400 }
            );
          }
        }
      }
    }

    // Intentar actualizar el registro existente
    const { data: updateData, error: updateError } = await supabase
      .from('mtg_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select();

    // Si no existe, crear uno nuevo
    if (updateError || !updateData || updateData.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('mtg_settings')
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
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
