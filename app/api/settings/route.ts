import { NextResponse } from 'next/server';
import { createClient as createSupabase } from '@supabase/supabase-js';
import { createAdminClient } from '@/utils/supabase/admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: Request) {
  try {
    const supabase = createSupabase(supabaseUrl, supabaseKey);

    // Obtener tipo de cambio
    const { data: fxData, error: fxError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'fx_usdclp')
      .limit(1)
      .maybeSingle();

    if (fxError) {
      return NextResponse.json({ error: fxError.message }, { status: 500 });
    }

    const fxRecord = fxData as any;
    let rate: number | undefined;

    if (fxRecord && fxRecord.value != null) {
      try {
        if (typeof fxRecord.value === 'object') {
          rate = Number(fxRecord.value.rate);
        } else {
          const parsed = JSON.parse(String(fxRecord.value));
          rate = Number(parsed.rate);
        }

        if (isNaN(rate)) {
          rate = undefined;
        }
      } catch (e) {
        console.error('Error parsing FX rate:', e);
        rate = undefined;
      }
    }

    // Obtener precio mínimo de carta
    const { data: minPriceData, error: minPriceError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'min_card_price_clp')
      .limit(1)
      .maybeSingle();

    if (minPriceError) {
      console.error('Error fetching min card price:', minPriceError);
    }

    const minPriceRecord = minPriceData as any;
    let minCardPrice: number | undefined;

    if (minPriceRecord && minPriceRecord.value != null) {
      try {
        if (typeof minPriceRecord.value === 'object') {
          minCardPrice = Number(minPriceRecord.value.amount);
        } else {
          const parsed = JSON.parse(String(minPriceRecord.value));
          minCardPrice = Number(parsed.amount);
        }

        if (isNaN(minCardPrice)) {
          minCardPrice = undefined;
        }
      } catch (e) {
        console.error('Error parsing min card price:', e);
        minCardPrice = undefined;
      }
    }

    return NextResponse.json({
      rate,
      minCardPrice,
    });
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

    // Validar según el tipo de clave
    if (key === 'fx_usdclp') {
      if (typeof value === 'object' && value.rate) {
        const rate = Number(value.rate);
        if (isNaN(rate) || rate <= 0) {
          return NextResponse.json(
            { error: 'Invalid rate value' },
            { status: 400 }
          );
        }
      }
    } else if (key === 'min_card_price_clp') {
      if (typeof value === 'object' && value.amount !== undefined) {
        const amount = Number(value.amount);
        if (isNaN(amount) || amount < 0) {
          return NextResponse.json(
            { error: 'Invalid amount value' },
            { status: 400 }
          );
        }
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
