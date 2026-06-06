import { createClient } from '@supabase/supabase-js';
import { gunzipSync } from 'zlib';

// URL oficial de MTGJson AllPricesToday
const MTGJSON_URL = 'https://mtgjson.com/api/v5/AllPricesToday.json.gz';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function getLatestFromDateMap(dateMap) {
  if (!dateMap) return null;
  let latestDate = null;
  let latestValue = null;

  for (const [date, value] of Object.entries(dateMap)) {
    if (!latestDate || date > latestDate) {
      latestDate = date;
      latestValue = value;
    }
  }

  return latestValue;
}

async function downloadAllPricesToday() {
  console.log('Descargando AllPricesToday.json.gz...');
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

async function upsertInBatches(rows, batchSize = 1000) {
  console.log(`Upsert de ${rows.length} filas en lotes de ${batchSize}...`);
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from('mtg_cardkingdom_prices')
      .upsert(batch, { onConflict: 'mtgjson_uuid' });

    if (error) {
      console.error('Error en upsert batch:', error);
      throw error;
    }
    console.log(`  Lote ${i} – ${i + batch.length} OK`);
  }
}

async function main() {
  const json = await downloadAllPricesToday();

  const data = json.data || {};
  const now = new Date().toISOString();

  const rows = [];

  console.log('Procesando JSON...');
  for (const [uuid, entry] of Object.entries(data)) {
    const paper = entry.paper || {};
    const ck = paper.cardkingdom || null; // vendor cardkingdom

    // MTGJson: retail es PricePoints (normal/foil/etched)
    const retail = ck?.retail || null;

    const nonfoilPrice = retail ? getLatestFromDateMap(retail.normal) : null;
    const foilPrice = retail ? getLatestFromDateMap(retail.foil) : null;

    if (nonfoilPrice == null && foilPrice == null) continue;

    rows.push({
      mtgjson_uuid: uuid,
      price_retail_nonfoil_usd: nonfoilPrice,
      price_retail_foil_usd: foilPrice,
      updated_at: now,
    });
  }

  console.log(`Filas a upsertear: ${rows.length}`);
  await upsertInBatches(rows);
  console.log('Precios de Card Kingdom actualizados en mtg_cardkingdom_prices');

  // 2. Actualizar price_usd en card_offers basándose en mtg_cardkingdom_prices
  console.log('\nActualizando precios en card_offers...');
  await updateCardOfferPrices();
  console.log('Listo');
}

async function updateCardOfferPrices() {
  // Obtener todas las card_offers activas con su mtgjson_uuid
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
    console.log('No hay ofertas activas con mtgjson_uuid para actualizar');
    return;
  }

  console.log(`Encontradas ${offers.length} ofertas activas para actualizar`);

  let updatedCount = 0;
  let skippedCount = 0;

  // Procesar en lotes
  for (let i = 0; i < offers.length; i += 100) {
    const batch = offers.slice(i, i + 100);

    for (const offer of batch) {
      const mtgjsonUuid = offer.mtg_cards.mtgjson_uuid;
      const isNonfoil = offer.foil === 'nonfoil';
      const isFoil = offer.foil === 'foil';

      // Obtener precio de Card Kingdom
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

      // Actualizar card_offer
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

    console.log(
      `  Procesadas ${Math.min(i + 100, offers.length)} / ${offers.length} ofertas...`
    );
  }

  console.log(
    `\nActualizadas: ${updatedCount} ofertas, Omitidas: ${skippedCount}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
