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
    const offerId = (params as any).id;
    const body = await req.json().catch(() => ({}));

    const { quantity, active } = body as {
      quantity?: number;
      active?: boolean;
    };

    if (quantity === undefined && active === undefined) {
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
      const updateData: any = { quantity: qNum, updated_at: now };
      if (qNum === 0) {
        updateData.active = false;
      }

      const upd = await supabase
        .from('card_offers')
        .update(updateData)
        .eq('id', offerId);

      if ((upd as any).error) {
        return NextResponse.json(
          { error: (upd as any).error.message },
          { status: 500 }
        );
      }
    }

    if (active !== undefined) {
      const upd = await supabase
        .from('card_offers')
        .update({ active: active ? true : false, updated_at: now })
        .eq('id', offerId);
      if ((upd as any).error) {
        return NextResponse.json(
          { error: (upd as any).error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/cards/[id] error', error);
    return NextResponse.json(
      { error: (error as any)?.message ?? String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'method not allowed' }, { status: 405 });
}
