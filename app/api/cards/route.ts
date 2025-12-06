import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      scryfall_id = null,
      scryfall_oracle_id = null,
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
      foil,
      language = null,
      condition = 'near_mint',
      quantity,
      price_usd = null,
      price_source = 'scryfall',
    } = body;

    // Prefer explicit language from payload; fallback to json_raw.lang if present; final fallback 'EN'
    const resolvedLanguage =
      (language as string | null) ??
      (json_raw && (json_raw as any)?.lang) ??
      'EN';

    if (!name || !set_code || !collector_number || !foil || !quantity) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    // Cliente admin con service role key (solo servidor)
    const supabase = createAdminClient();

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

    // Intentar obtener mtgjson_uuid
    let mtgjson_uuid: string | null = null;
    try {
      if (scryfall_id || scryfall_oracle_id) {
        const supabaseForUuid = createAdminClient();
        let query = supabaseForUuid.from('cardidentifiers').select('uuid');

        // Usar ambos IDs para una búsqueda más precisa
        if (scryfall_id) {
          query = query.eq('scryfallid', scryfall_id);
        }
        if (scryfall_oracle_id) {
          query = query.eq('scryfalloracleid', scryfall_oracle_id);
        }

        const { data: uuidData, error: uuidError } = await query.limit(1).single();

        if (uuidError) {
          console.warn('Error fetching MTGJSON UUID:', uuidError);
        }

        if (uuidData?.uuid) {
          mtgjson_uuid = uuidData.uuid;
          console.log(
            `Found MTGJSON UUID for ${name} (Scryfall: ${scryfall_id || scryfall_oracle_id}):`,
            mtgjson_uuid
          );
        }
      }
    } catch (e) {
      console.warn('Could not fetch MTGJSON UUID:', e);
      // No fallar si no se puede obtener el UUID
    }

    if (cardId) {
      // update
      const upd = await supabase
        .from('cards')
        .update({
          scryfall_id,
          scryfall_oracle_id:
            scryfall_oracle_id ?? (json_raw as any)?.oracle_id ?? null,
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
          mtgjson_uuid,
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
      const insertRes = await supabase
        .from('cards')
        .insert([
          {
            scryfall_id,
            scryfall_oracle_id:
              scryfall_oracle_id ?? (json_raw as any)?.oracle_id ?? null,
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
            mtgjson_uuid,
            has_nonfoil: foil === 'nonfoil' ? true : null,
            has_foil: foil === 'foil' ? true : null,
            has_etched: foil === 'etched' ? true : null,
            created_at: now,
            updated_at: now,
          },
        ])
        .select('id')
        .single();

      if (insertRes.error) {
        return NextResponse.json(
          {
            error: insertRes.error.message,
            details: insertRes.error,
          },
          { status: 500 }
        );
      }
      cardId = insertRes.data?.id ?? null;
    }

    if (!cardId) {
      return NextResponse.json(
        { error: 'failed to create or find card' },
        { status: 500 }
      );
    }

    // 2) Upsert offer (variant)
    const conditionCode =
      condition === 'near_mint'
        ? 'NM'
        : condition === 'lightly_played'
          ? 'LP'
          : condition === 'moderately_played'
            ? 'MP'
            : condition === 'heavily_played'
              ? 'HP'
              : condition === 'damaged'
                ? 'DMG'
                : condition === 'mint'
                  ? 'M'
                  : 'NM';
    const variantSku = `${set_code.toLowerCase()}-${String(
      collector_number
    ).toLowerCase()}-${foil}-${resolvedLanguage}-${conditionCode}`;

    const { data: existingOffer } = await supabase
      .from('card_offers')
      .select('id, quantity')
      .match({ card_id: cardId, foil, language: resolvedLanguage, condition })
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
          foil,
          language: resolvedLanguage,
          condition,
          quantity: Number(quantity),
          price_usd,
          markup_percent: 0, // Default markup
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
    // Cliente admin con service role key (solo servidor)
    const supabase = createAdminClient();

    const url = new URL(req.url);
    const q = url.searchParams.get('q') ?? '';
    const admin = url.searchParams.get('admin') === 'true';

    // Construir query base
    let query = supabase
      .from('card_offers')
      .select(
        `id, card_id, foil, language, condition, quantity, price_usd, markup_percent, price_source, price_updated_at, active, variant_sku, created_at, updated_at, cards(id, scryfall_id, scryfall_oracle_id, name, set_code, set_name, collector_number, type_line, image_url, sku, rarity, colors, color_identity)`
      )
      .order('created_at', { ascending: false });

    // Si NO es admin (frontoffice), filtrar solo activas
    if (!admin) {
      query = query.eq('active', true);
    }

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
