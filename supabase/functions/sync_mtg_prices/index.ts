import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PricePoints = Record<string, number>;

type AllPricesToday = {
  data: Record<
    string,
    {
      paper?: {
        cardkingdom?: {
          currency?: string;
          retail?: {
            normal?: PricePoints;
            foil?: PricePoints;
            etched?: PricePoints;
          };
        };
      };
    }
  >;
};

type CardFinish = 'nonfoil' | 'foil' | 'etched';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

function getLatest(pricePoints?: PricePoints): number | undefined {
  if (!pricePoints) return undefined;
  const dates = Object.keys(pricePoints);
  if (!dates.length) return undefined;
  dates.sort();
  const latestDate = dates[dates.length - 1];
  return pricePoints[latestDate];
}

Deno.serve(async () => {
  try {
    // 1) Descargar AllPricesToday
    const res = await fetch('https://mtgjson.com/api/v5/AllPricesToday.json');
    if (!res.ok) {
      console.error('Error descargando AllPricesToday', res.status);
      return new Response('error fetching MTGJSON', { status: 500 });
    }

    const json = (await res.json()) as AllPricesToday;

    // 2) uuid -> { normal, foil, etched }
    const ckPriceByUuid = new Map<
      string,
      { normal?: number; foil?: number; etched?: number }
    >();

    for (const [uuid, priceData] of Object.entries(json.data)) {
      const ck = priceData.paper?.cardkingdom;
      const retail = ck?.retail;
      if (!retail) continue;

      const normal = getLatest(retail.normal);
      const foil = getLatest(retail.foil);
      const etched = getLatest(retail.etched);

      if (normal == null && foil == null && etched == null) continue;
      ckPriceByUuid.set(uuid, { normal, foil, etched });
    }

    // 3) cards.id -> { normal, foil }
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, mtgjson_uuid')
      .not('mtgjson_uuid', 'is', null);

    if (cardsError) {
      console.error('Error leyendo cards', cardsError);
      return new Response('db error cards', { status: 500 });
    }

    const pricesByCardId = new Map<
      number,
      { normal?: number; foil?: number; etched?: number }
    >();

    for (const card of cards ?? []) {
      const prices = ckPriceByUuid.get(card.mtgjson_uuid);
      if (prices) {
        pricesByCardId.set(card.id, prices);
      }
    }

    // 4) card_offers (asumo columna foil: boolean)
    const { data: offers, error: offersError } = await supabase
      .from('card_offers')
      .select('id, card_id, markup_percent, foil, active')
      .eq('active', true);

    if (offersError) {
      console.error('Error leyendo card_offers', offersError);
      return new Response('db error offers', { status: 500 });
    }

    const nowIso = new Date().toISOString();
    const updates: {
      id: number;
      price_usd: number;
      price_source: string;
      price_updated_at: string;
    }[] = [];

    for (const offer of offers ?? []) {
      const prices = pricesByCardId.get(offer.card_id);
      if (!prices) continue;

      const finish = offer.foil as CardFinish;
      let basePrice: number | undefined;

      // Seleccionar precio según el finish
      if (finish === 'etched') {
        basePrice = prices.etched ?? prices.foil ?? prices.normal;
      } else if (finish === 'foil') {
        basePrice = prices.foil ?? prices.normal;
      } else {
        // 'nonfoil'
        basePrice = prices.normal ?? prices.foil;
      }

      if (basePrice == null) continue;

      const markup = Number(offer.markup_percent ?? 0);
      const finalPrice = basePrice * (1 + markup / 100);

      updates.push({
        id: offer.id,
        price_usd: Number(finalPrice.toFixed(2)),
        price_source: 'cardkingdom',
        price_updated_at: nowIso,
      });
    }

    if (updates.length) {
      const { error: upsertError } = await supabase
        .from('card_offers')
        .upsert(updates, { onConflict: 'id' });

      if (upsertError) {
        console.error('Error upsert card_offers', upsertError);
        return new Response('db error upsert', { status: 500 });
      }
    }

    return new Response(
      JSON.stringify({ status: 'ok', updated_offers: updates.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('sync_mtg_prices ERROR', err);
    return new Response('internal error', { status: 500 });
  }
});
