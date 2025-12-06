import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scryfallId } = body;

    if (!scryfallId) {
      return NextResponse.json(
        { error: 'scryfallId es requerido' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Obtener mtgjson_uuid desde cardidentifiers
    const { data: cardIdData, error: cardIdError } = await supabase
      .from('cardidentifiers')
      .select('uuid')
      .eq('scryfallid', scryfallId)
      .single();

    if (cardIdError || !cardIdData?.uuid) {
      return NextResponse.json(
        { error: 'No se encontró el UUID de MTGJSON para este Scryfall ID' },
        { status: 404 }
      );
    }

    const mtgjsonUuid = cardIdData.uuid;

    // 2. Obtener precios de Card Kingdom
    const { data: priceData, error: priceError } = await supabase
      .from('mtg_cardkingdom_prices')
      .select('price_retail_nonfoil_usd, price_retail_foil_usd, updated_at')
      .eq('mtgjson_uuid', mtgjsonUuid)
      .single();

    if (priceError || !priceData) {
      return NextResponse.json(
        { error: 'No se encontraron precios de Card Kingdom para esta carta' },
        { status: 404 }
      );
    }

    // 3. Obtener última sincronización de precios
    const { data: lastSyncData } = await supabase
      .from('mtg_cardkingdom_prices')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      prices: {
        price_retail_nonfoil_usd: priceData.price_retail_nonfoil_usd,
        price_retail_foil_usd: priceData.price_retail_foil_usd,
        updated_at: priceData.updated_at,
      },
      lastSync: lastSyncData?.updated_at || null,
    });
  } catch (error) {
    console.error('Error en /api/cardkingdom-prices:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
