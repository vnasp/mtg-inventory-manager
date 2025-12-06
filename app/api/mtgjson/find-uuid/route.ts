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

    // Buscar en la tabla cardidentifiers de MTGJSON
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('cardidentifiers')
      .select('uuid')
      .eq('scryfallid', scryfallId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          error: `No se encontró MTGJSON UUID para Scryfall ID: ${scryfallId}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      uuid: data.uuid,
      scryfallId,
    });
  } catch (error) {
    console.error('find-uuid error:', error);
    return NextResponse.json(
      { error: (error as any)?.message ?? 'Error interno' },
      { status: 500 }
    );
  }
}
