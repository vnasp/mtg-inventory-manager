import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

type ManaBoxRow = {
  Name: string;
  'Set code': string;
  'Set name': string;
  'Collector number': string;
  Foil: string;
  Rarity: string;
  Quantity: string;
  'ManaBox ID': string;
  'Scryfall ID': string;
  'Purchase price': string;
  Misprint: string;
  Altered: string;
  Condition: string;
  Language: string;
  'Purchase price currency': string;
};

export async function POST(req: Request) {
  try {
    const { rows } = (await req.json()) as { rows: ManaBoxRow[] };

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: 'Invalid payload: rows array required' },
        { status: 400 }
      );
    }

    console.log(`[Import] Iniciando importación de ${rows.length} filas`);
    const results: { ok: boolean; error?: string; row?: string }[] = [];
    let processed = 0;

    for (const row of rows) {
      processed++;
      if (processed % 10 === 0) {
        console.log(`[Import] Procesando fila ${processed}/${rows.length}`);
      }
      try {
        const cardId = await ensureCard(row);

        const quantity = Number(row.Quantity || 0);
        const priceUsd =
          row['Purchase price currency'] === 'USD'
            ? Number(row['Purchase price'] || 0)
            : null;

        // Mapear foil
        const foilValue =
          row.Foil?.toLowerCase() === 'foil' ? 'foil' : 'nonfoil';

        // Mapear language
        const languageMap: Record<string, string> = {
          english: 'en',
          spanish: 'es',
          inglés: 'en',
          español: 'es',
        };
        const language =
          languageMap[row.Language?.toLowerCase()] ||
          row.Language?.toLowerCase() ||
          'en';

        const condition = mapCondition(row.Condition);

        const supabase = createAdminClient();

        // Generar variant_sku
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

        const variantSku = `${row['Set code'].toLowerCase()}-${row['Collector number'].toLowerCase()}-${foilValue}-${language.toUpperCase()}-${conditionCode}`;

        const now = new Date().toISOString();

        // Buscar oferta existente
        const { data: existingOffer } = await supabase
          .from('mtg_card_offers')
          .select('id, quantity')
          .match({
            card_id: cardId,
            foil: foilValue,
            language: language,
            condition: condition,
          })
          .limit(1)
          .maybeSingle();

        if (existingOffer) {
          // Actualizar oferta existente (incrementar cantidad)
          const newQuantity = (existingOffer.quantity || 0) + quantity;

          const { error } = await supabase
            .from('mtg_card_offers')
            .update({
              quantity: newQuantity,
              price_usd: priceUsd,
              price_source: 'manabox_csv',
              price_updated_at: now,
              variant_sku: variantSku,
              active: newQuantity > 0,
              updated_at: now,
            })
            .eq('id', existingOffer.id);

          if (error) throw error;
        } else {
          // Insertar nueva oferta
          console.log(`[Import] Insertando nueva oferta para ${row.Name}:`, {
            card_id: cardId,
            foil: foilValue,
            language: language,
            condition: condition,
            quantity,
          });

          const { error } = await supabase.from('mtg_card_offers').insert({
            card_id: cardId,
            foil: foilValue,
            language: language,
            condition: condition,
            quantity,
            price_usd: priceUsd,
            price_source: 'manabox_csv',
            price_updated_at: now,
            variant_sku: variantSku,
            active: quantity > 0,
            created_at: now,
            updated_at: now,
          });

          if (error) {
            console.error(`[Import] Error al insertar oferta:`, error);
            throw error;
          }
        }

        results.push({ ok: true, row: row.Name });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        console.error(
          `[Import] Error en fila ${processed} (${row.Name}):`,
          msg
        );
        results.push({
          ok: false,
          error: msg,
          row: row.Name,
        });
      }
    }

    console.log(
      `[Import] Completado: ${results.filter((r) => r.ok).length} éxitos, ${results.filter((r) => !r.ok).length} errores`
    );

    const successCount = results.filter((r) => r.ok).length;
    const errorCount = results.filter((r) => !r.ok).length;

    return NextResponse.json({
      ok: true,
      results,
      summary: {
        total: rows.length,
        success: successCount,
        errors: errorCount,
      },
    });
  } catch (error: unknown) {
    console.error('Import ManaBox error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

function mapCondition(
  raw: string
):
  | 'mint'
  | 'near_mint'
  | 'lightly_played'
  | 'moderately_played'
  | 'heavily_played'
  | 'damaged' {
  const v = raw?.toLowerCase().replace(/\s+/g, '_');
  switch (v) {
    case 'mint':
      return 'mint';
    case 'near_mint':
    case 'near-mint':
      return 'near_mint';
    case 'lightly_played':
    case 'lightly-played':
      return 'lightly_played';
    case 'moderately_played':
    case 'moderately-played':
      return 'moderately_played';
    case 'heavily_played':
    case 'heavily-played':
      return 'heavily_played';
    case 'damaged':
      return 'damaged';
    default:
      return 'near_mint';
  }
}

async function ensureCard(row: ManaBoxRow): Promise<number> {
  const supabase = createAdminClient();
  const scryfallId = row['Scryfall ID']?.trim();

  if (!scryfallId) {
    throw new Error('Scryfall ID is required');
  }

  // 1) Buscar en cards por scryfall_id
  const { data: existing, error } = await supabase
    .from('mtg_cards')
    .select('id')
    .eq('scryfall_id', scryfallId)
    .maybeSingle();

  if (error) {
    console.error(`[ensureCard] Error buscando carta ${row.Name}:`, error);
    throw error;
  }
  if (existing) return existing.id;

  // 2) Si no existe, traer de Scryfall con timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

  try {
    const scryfallUrl = `https://api.scryfall.com/cards/${scryfallId}`;
    const res = await fetch(scryfallUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MTGInventoryManager/1.0 (contact: valentinamr@gmail.com)' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(
        `No se pudo obtener la carta de Scryfall: ${res.status} ${res.statusText}`
      );
    }

    const c = await res.json();

    const now = new Date().toISOString();

    // 2.5) Intentar obtener mtgjson_uuid
    let mtgjson_uuid: string | null = null;
    try {
      let query = supabase.from('mtg_cardidentifiers').select('uuid');

      // Usar ambos IDs para una búsqueda más precisa
      if (c.id) {
        query = query.eq('scryfallid', c.id);
      }
      if (c.oracle_id) {
        query = query.eq('scryfalloracleid', c.oracle_id);
      }

      const { data: uuidData, error: uuidError } = await query
        .limit(1)
        .single();

      if (uuidError) {
        console.warn('Error fetching MTGJSON UUID:', uuidError);
      }

      if (uuidData?.uuid) {
        mtgjson_uuid = uuidData.uuid;
      }
    } catch (e) {
      console.warn('Could not fetch MTGJSON UUID for import:', e);
    }

    // 3) Insertar nueva carta
    const { data: inserted, error: insertError } = await supabase
      .from('mtg_cards')
      .insert({
        scryfall_id: c.id,
        scryfall_oracle_id: c.oracle_id || null,
        name: c.name,
        set_code: c.set,
        set_name: c.set_name,
        collector_number: c.collector_number,
        type_line: c.type_line || null,
        image_url: c.image_uris?.normal || null,
        json_raw: c,
        mtgjson_uuid,
        has_nonfoil: c.nonfoil || false,
        has_foil: c.foil || false,
        has_etched: c.finishes?.includes('etched') || false,
        rarity: c.rarity || null,
        colors: c.colors || null,
        color_identity: c.color_identity || null,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!inserted) throw new Error('Failed to insert card');

    return inserted.id;
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Timeout al obtener carta de Scryfall');
    }
    throw e;
  }
}
