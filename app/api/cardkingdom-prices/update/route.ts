import { gunzipSync } from 'zlib';
import { createAdminClient } from '@/utils/supabase/admin';

type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

const MTGJSON_URL = 'https://mtgjson.com/api/v5/AllPricesToday.json.gz';

function getLatestFromDateMap(dateMap: Record<string, number> | null) {
  if (!dateMap) return null;
  let latestDate: string | null = null;
  let latestValue: number | null = null;

  for (const [date, value] of Object.entries(dateMap)) {
    if (!latestDate || date > latestDate) {
      latestDate = date;
      latestValue = value;
    }
  }

  return latestValue;
}

async function downloadAllPricesToday() {
  const res = await fetch(MTGJSON_URL);
  if (!res.ok) {
    throw new Error(
      `Error al descargar MTGJson: ${res.status} ${res.statusText}`
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const decompressed = gunzipSync(buffer);
  const json = JSON.parse(decompressed.toString('utf8'));

  return json;
}

async function upsertInBatches(supabase: SupabaseAdminClient, rows: Record<string, unknown>[], batchSize = 1000) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from('mtg_cardkingdom_prices')
      .upsert(batch, { onConflict: 'mtgjson_uuid' });

    if (error) {
      console.error('Error en upsert batch:', error);
      throw error;
    }
  }
}

async function updateCardOfferPrices(supabase: SupabaseAdminClient) {
  const { data: offers, error: offersError } = await supabase
    .from('mtg_card_offers')
    .select(
      `
      id,
      foil,
      mtg_cards!inner (
        mtgjson_uuid
      )
    `
    )
    .eq('active', true)
    .not('mtg_cards.mtgjson_uuid', 'is', null);

  if (offersError) {
    console.error('Error obteniendo card_offers:', offersError);
    throw offersError;
  }

  if (!offers || offers.length === 0) {
    return { updated: 0, skipped: 0 };
  }

  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < offers.length; i += 100) {
    const batch = offers.slice(i, i + 100);

    for (const offer of batch) {
      const mtgjsonUuid = (offer.mtg_cards as unknown as { mtgjson_uuid: string | null }).mtgjson_uuid;
      const isNonfoil = offer.foil === 'nonfoil';
      const isFoil = offer.foil === 'foil';

      const { data: ckPrice, error: priceError } = await supabase
        .from('mtg_cardkingdom_prices')
        .select('price_retail_nonfoil_usd, price_retail_foil_usd')
        .eq('mtgjson_uuid', mtgjsonUuid)
        .single();

      if (priceError || !ckPrice) {
        skippedCount++;
        continue;
      }

      const newPrice = isNonfoil
        ? ckPrice.price_retail_nonfoil_usd
        : isFoil
          ? ckPrice.price_retail_foil_usd
          : null;

      if (newPrice == null) {
        skippedCount++;
        continue;
      }

      const { error: updateError } = await supabase
        .from('mtg_card_offers')
        .update({
          price_usd: newPrice,
          price_source: 'cardkingdom',
          price_updated_at: new Date().toISOString(),
        })
        .eq('id', offer.id);

      if (updateError) {
        console.error(`Error actualizando offer ${offer.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }

  return { updated: updatedCount, skipped: skippedCount };
}

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (message: string) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ message })}\n\n`)
        );
      };

      try {
        const supabase = createAdminClient();

        // 1. Descargar precios
        sendUpdate('Descargando AllPricesToday.json.gz desde MTGJson...');
        const json = await downloadAllPricesToday();
        sendUpdate('Archivo descargado correctamente');

        // 2. Procesar datos
        sendUpdate('Procesando datos de precios...');
        const data = json.data || {};
        const now = new Date().toISOString();
        const rows = [];

        for (const [uuid, entry] of Object.entries(data)) {
          type CKRetail = { normal?: Record<string, number>; foil?: Record<string, number> };
          type CKPrices = { retail?: CKRetail };
          const paper = ((entry as Record<string, unknown>).paper || {}) as Record<string, CKPrices>;
          const ck: CKPrices | null = paper.cardkingdom || null;
          const retail: CKRetail | null = ck?.retail || null;

          const nonfoilPrice = retail
            ? getLatestFromDateMap(retail.normal ?? null)
            : null;
          const foilPrice = retail ? getLatestFromDateMap(retail.foil ?? null) : null;

          if (nonfoilPrice == null && foilPrice == null) continue;

          rows.push({
            mtgjson_uuid: uuid,
            price_retail_nonfoil_usd: nonfoilPrice,
            price_retail_foil_usd: foilPrice,
            updated_at: now,
          });
        }

        sendUpdate(`${rows.length} precios procesados`);

        // 3. Actualizar base de datos
        sendUpdate('Actualizando tabla de precios en base de datos...');
        await upsertInBatches(supabase, rows);
        sendUpdate('Tabla de precios actualizada');

        // 4. Actualizar precios en card_offers
        sendUpdate('Actualizando precios de cartas en ofertas...');
        const offerStats = await updateCardOfferPrices(supabase);
        sendUpdate(
          `${offerStats.updated} ofertas actualizadas, ${offerStats.skipped} omitidas`
        );

        // Enviar resultado final
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              complete: true,
              stats: {
                pricesImported: rows.length,
                offersUpdated: offerStats.updated,
                offersSkipped: offerStats.skipped,
              },
            })}\n\n`
          )
        );

        controller.close();
      } catch (error: unknown) {
        console.error('Error al actualizar precios:', error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Error al actualizar precios' })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
