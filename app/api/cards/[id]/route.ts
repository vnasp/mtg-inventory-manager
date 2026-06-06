import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const params = await (context.params as
      | Promise<{ id: string }>
      | { id: string });
    const offerId = params.id;
    const body = await req.json().catch(() => ({}));

    const { quantity, active, markup_percent } = body as {
      quantity?: number;
      active?: boolean;
      markup_percent?: number;
    };

    if (
      quantity === undefined &&
      active === undefined &&
      markup_percent === undefined
    ) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    // Cliente admin con service role key (solo servidor)
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    if (quantity !== undefined) {
      const qNum = Number(quantity);
      if (!Number.isFinite(qNum) || !Number.isInteger(qNum) || qNum < 0) {
        return NextResponse.json(
          { error: 'invalid quantity' },
          { status: 400 }
        );
      }

      // Si la cantidad es 0, desactivar automáticamente
      const updateData: { quantity: number; updated_at: string; active?: boolean } = { quantity: qNum, updated_at: now };
      if (qNum === 0) {
        updateData.active = false;
      }

      const { error: updError } = await supabase
        .from('mtg_card_offers')
        .update(updateData)
        .eq('id', offerId);

      if (updError) {
        return NextResponse.json({ error: updError.message }, { status: 500 });
      }
    }

    if (active !== undefined) {
      const { error: updError } = await supabase
        .from('mtg_card_offers')
        .update({ active: active ? true : false, updated_at: now })
        .eq('id', offerId);
      if (updError) {
        return NextResponse.json({ error: updError.message }, { status: 500 });
      }
    }

    if (markup_percent !== undefined) {
      const markupNum = Number(markup_percent);
      if (!Number.isFinite(markupNum) || markupNum < 0 || markupNum > 100) {
        return NextResponse.json(
          { error: 'El aumento debe ser un número entre 0 y 100' },
          { status: 400 }
        );
      }

      // Redondear a 2 decimales para evitar overflow
      const roundedMarkup = Math.round(markupNum * 100) / 100;

      const { error: updError } = await supabase
        .from('mtg_card_offers')
        .update({ markup_percent: roundedMarkup, updated_at: now })
        .eq('id', offerId);
      if (updError) {
        return NextResponse.json({ error: updError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('PATCH /api/cards/[id] error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'method not allowed' }, { status: 405 });
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const params = await (context.params as
      | Promise<{ id: string }>
      | { id: string });
    const offerId = params.id;

    // Cliente admin con service role key (solo servidor)
    const supabase = createAdminClient();

    // Primero obtener el card_id antes de eliminar
    const { data: offer } = await supabase
      .from('mtg_card_offers')
      .select('card_id')
      .eq('id', offerId)
      .single();

    // Eliminar la oferta de carta
    const { error } = await supabase
      .from('mtg_card_offers')
      .delete()
      .eq('id', offerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si tenemos el card_id, verificar si quedan más ofertas para esa carta
    if (offer?.card_id) {
      const { data: remainingOffers } = await supabase
        .from('mtg_card_offers')
        .select('id')
        .eq('card_id', offer.card_id)
        .limit(1);

      // Si no quedan ofertas, eliminar la carta también
      if (!remainingOffers || remainingOffers.length === 0) {
        await supabase.from('mtg_cards').delete().eq('id', offer.card_id);
        console.log(`Deleted orphaned card ${offer.card_id}`);
      }
    }

    return NextResponse.json({ ok: true, message: 'Carta eliminada' });
  } catch (error: unknown) {
    console.error('DELETE /api/cards/[id] error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
