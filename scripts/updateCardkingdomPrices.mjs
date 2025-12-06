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

function getLatestRetail(retailObj) {
  if (!retailObj) return null;
  // retailObj = { "YYYY-MM-DD": price, ... } → tomamos la fecha más reciente
  let latestDate = null;
  let latestValue = null;

  for (const [date, value] of Object.entries(retailObj)) {
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
    // MTGJson suele usar cardkingdom y cardkingdom_foil como vendors separados
    const ckNonfoil = paper.cardkingdom || null;
    const ckFoil = paper.cardkingdom_foil || null;

    const nonfoilPrice = getLatestRetail(ckNonfoil?.retail);
    const foilPrice = getLatestRetail(ckFoil?.retail);

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
  console.log('Listo');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
