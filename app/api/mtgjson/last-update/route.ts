import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();

    // Obtener la última fecha de actualización de precios
    const { data: pricesData } = await supabase
      .from('mtg_cardkingdom_prices')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    // Obtener la última fecha de actualización de identifiers
    const { data: identifiersData } = await supabase
      .from('mtg_cardidentifiers')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      prices: pricesData?.updated_at || null,
      identifiers: identifiersData?.updated_at || null,
    });
  } catch (error: any) {
    console.error('Error fetching last update dates:', error);
    return NextResponse.json(
      { error: 'Error al obtener fechas de actualización' },
      { status: 500 }
    );
  }
}
