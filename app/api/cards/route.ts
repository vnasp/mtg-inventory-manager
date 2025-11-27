import { NextResponse } from 'next/server';
import { createClient as createSupabase } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// For server-side writes we require a service role key. Prefer SUPABASE_SERVICE_ROLE_KEY.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey =
  supabaseServiceKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      scryfall_id = null,
      name,
      set_code,
      set_name,
      collector_number,
      type_line = null,
      image_url = null,
      json_raw = null,
      rarity = null,
      colors = null,
      color_identity = null,
      finish,
      language = null,
      quantity,
      price_usd = null,
      price_source = 'scryfall',
    } = body;

    // Prefer explicit language from payload; fallback to json_raw.lang if present; final fallback 'EN'
    const resolvedLanguage =
      (language as string | null) ??
      (json_raw && (json_raw as any)?.lang) ??
      'EN';

    if (!name || !set_code || !collector_number || !finish || !quantity) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    if (!supabaseServiceKey) {
      return NextResponse.json(
        {
          error:
            'Server requires SUPABASE_SERVICE_ROLE_KEY for writes. Set SUPABASE_SERVICE_ROLE_KEY in your environment.',
        },
        { status: 500 }
      );
    }
    const supabase = createSupabase(supabaseUrl, supabaseKey);

    // 1) Upsert card: try find by scryfall_id, else by set_code+collector_number
    let cardId: number | null = null;

    if (scryfall_id) {
      const { data: existingById } = await supabase
        .from('cards')
        .select('id')
        .eq('scryfall_id', scryfall_id)
        .limit(1)
        .single();
      if (existingById && existingById.id) cardId = existingById.id;
    }

    if (!cardId) {
      const { data: existingByKey } = await supabase
        .from('cards')
        .select('id')
        .eq('set_code', set_code)
        .eq('collector_number', collector_number)
        .limit(1)
        .single();
      if (existingByKey && existingByKey.id) cardId = existingByKey.id;
    }

    const now = new Date().toISOString();

    const sku = `${set_code.toLowerCase()}-${String(
      collector_number
    ).toLowerCase()}`;

    if (cardId) {
      // update
      const upd = await supabase
        .from('cards')
        .update({
          scryfall_id,
          name,
          set_code,
          set_name,
          collector_number,
          type_line,
          rarity: (rarity as any) ?? (json_raw as any)?.rarity ?? null,
          colors: (colors as any) ?? (json_raw as any)?.colors ?? null,
          color_identity:
            (color_identity as any) ??
            (json_raw as any)?.color_identity ??
            null,
          image_url,
          json_raw,
          updated_at: now,
        })
        .eq('id', cardId);
      if ((upd as any).error) {
        return NextResponse.json(
          { error: (upd as any).error.message },
          { status: 500 }
        );
      }
    } else {
      const insertRes = await supabase.from('cards').insert([
        {
          scryfall_id,
          name,
          set_code,
          set_name,
          collector_number,
          type_line,
          rarity: (rarity as any) ?? (json_raw as any)?.rarity ?? null,
          colors: (colors as any) ?? (json_raw as any)?.colors ?? null,
          color_identity:
            (color_identity as any) ??
            (json_raw as any)?.color_identity ??
            null,
          image_url,
          json_raw,
          has_nonfoil: finish === 'nonfoil' ? true : null,
          has_foil: finish === 'foil' ? true : null,
          has_etched: finish === 'etched' ? true : null,
          created_at: now,
          updated_at: now,
        },
      ]);
      if ((insertRes as any).error) {
        return NextResponse.json(
          {
            error: (insertRes as any).error.message,
            details: (insertRes as any).error,
          },
          { status: 500 }
        );
      }
      const inserted = (insertRes as any).data as any;
      cardId = inserted && inserted[0] ? inserted[0].id : null;
    }

    if (!cardId) {
      return NextResponse.json(
        { error: 'failed to create or find card' },
        { status: 500 }
      );
    }

    // 2) Upsert offer (variant)
    const variantSku = `${set_code.toLowerCase()}-${String(
      collector_number
    ).toLowerCase()}-${finish}-${resolvedLanguage}`;

    const { data: existingOffer } = await supabase
      .from('card_offers')
      .select('id, quantity')
      .match({ card_id: cardId, finish, language: resolvedLanguage })
      .limit(1)
      .single();

    // Normalize and validate incoming quantity
    const incQuantity = Number(quantity);
    if (
      !Number.isFinite(incQuantity) ||
      !Number.isInteger(incQuantity) ||
      incQuantity === 0
    ) {
      return NextResponse.json({ error: 'invalid quantity' }, { status: 400 });
    }

    if (existingOffer && existingOffer.id) {
      // Try to increment quantity atomically via a DB function (recommended)
      // SQL to create the function in Supabase (run once in SQL editor):
      //
      // create or replace function public.increment_card_offer_quantity(offer_id int, inc int)
      // returns void as $$
      //   update card_offers set quantity = greatest(0, coalesce(quantity,0) + inc), updated_at = now() where id = offer_id;
      // $$ language sql security definer;
      //
      // If the function exists, call it. If not, fallback to the previous read+write approach.

      // Allow positive or negative increments; final quantity will be clamped to >= 0 by the DB function

      let rpcError = null;
      try {
        const rpcRes = await supabase.rpc('increment_card_offer_quantity', {
          offer_id: existingOffer.id,
          inc: incQuantity,
        });
        // supabase.rpc returns { data, error }
        if ((rpcRes as any).error) rpcError = (rpcRes as any).error;
      } catch (err) {
        rpcError = err;
      }

      if (!rpcError) {
        // Update snapshot fields (price, variant, flags)
        const updOffer = await supabase
          .from('card_offers')
          .update({
            price_usd,
            price_source,
            price_updated_at: now,
            variant_sku: variantSku,
            active: true,
            updated_at: now,
          })
          .eq('id', existingOffer.id);
        if ((updOffer as any).error) {
          return NextResponse.json(
            { error: (updOffer as any).error.message },
            { status: 500 }
          );
        }
      } else {
        // Fallback: read+update (existing behavior), but clamp to >= 0
        const newQuantity = Math.max(
          0,
          (existingOffer.quantity || 0) + incQuantity
        );
        const updOffer = await supabase
          .from('card_offers')
          .update({
            quantity: newQuantity,
            price_usd,
            price_source,
            price_updated_at: now,
            variant_sku: variantSku,
            active: true,
            updated_at: now,
          })
          .eq('id', existingOffer.id);
        if ((updOffer as any).error) {
          return NextResponse.json(
            { error: (updOffer as any).error.message },
            { status: 500 }
          );
        }
      }
    } else {
      const insOffer = await supabase.from('card_offers').insert([
        {
          card_id: cardId,
          finish,
          language: resolvedLanguage,
          quantity: Number(quantity),
          price_usd,
          price_source,
          price_updated_at: now,
          active: true,
          variant_sku: variantSku,
          created_at: now,
          updated_at: now,
        },
      ]);
      if ((insOffer as any).error) {
        return NextResponse.json(
          { error: (insOffer as any).error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as any)?.message ?? String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createSupabase(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const q = url.searchParams.get('q') ?? '';

    // Seleccionamos las ofertas activas y traemos los datos de la carta relacionada
    let query = supabase
      .from('card_offers')
      .select(
        `id, card_id, finish, language, quantity, price_usd, price_source, price_updated_at, active, variant_sku, created_at, updated_at, cards(id, scryfall_id, name, set_code, set_name, collector_number, type_line, image_url, sku)`
      )
      .eq('active', true)
      .order('created_at', { ascending: false });

    // Si hay query 'q', filtrar por nombre de carta case-insensitive
    if (q && q.trim().length > 0) {
      // usar ilike para case-insensitive contains
      query = query.ilike('cards.name', `%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as any)?.message ?? String(error) },
      { status: 500 }
    );
  }
}
