import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scryfallId, scryfallOracleId } = body;

    if (!scryfallId && !scryfallOracleId) {
      return NextResponse.json(
        { error: 'scryfallId o scryfallOracleId es requerido' },
        { status: 400 }
      );
    }

    // Buscar en la tabla mtg_cardidentifiers de MTGJSON
    const supabase = createAdminClient();

    let query = supabase.from('mtg_cardidentifiers').select('uuid');

    // Usar ambos IDs para una búsqueda más precisa
    if (scryfallId) {
      query = query.eq('scryfallid', scryfallId);
    }
    if (scryfallOracleId) {
      query = query.eq('scryfalloracleid', scryfallOracleId);
    }

    const { data, error } = await query.limit(1).single();

    if (error || !data) {
      return NextResponse.json(
        {
          error: `No se encontró MTGJSON UUID para Scryfall ID: ${scryfallId || scryfallOracleId}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      uuid: data.uuid,
      scryfallId,
      scryfallOracleId,
    });
  } catch (error) {
    console.error('find-uuid error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
