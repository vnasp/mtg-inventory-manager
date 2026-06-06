import { cookies } from 'next/headers';
import { createClient as createServerSupabase } from '@/utils/supabase/server';
import CatalogClient from '@/components/CatalogClient';
import type { CardOffer } from '@/types/card';
import '@/app/globals.css';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore);

  const offersRes = await supabase
    .from('mtg_card_offers')
    .select(
      `id, card_id, foil, language, condition, quantity, price_usd, price_source, price_updated_at, active, variant_sku, created_at, updated_at, mtg_cards(id, name, set_name, set_code, collector_number, type_line, image_url, sku, rarity, colors, color_identity)`
    )
    .eq('active', true)
    .gt('quantity', 0)
    .order('created_at', { ascending: false });

  const settingsRes = await supabase
    .from('mtg_settings')
    .select('value')
    .eq('key', 'mtg')
    .limit(1)
    .maybeSingle();

  if (offersRes.error) {
    return (
      <main>
        <h1>Catálogo</h1>
        <p>Error al cargar catálogo: {offersRes.error.message}</p>
      </main>
    );
  }

  const offers = (offersRes.data ?? []) as unknown as CardOffer[];
  const settingRecord = settingsRes.data;

  // Resolve fx rate and min price from MTG settings
  let fxRate: number;
  let minCardPriceClp = 499; // default

  try {
    if (settingRecord && settingRecord.value != null) {
      const raw = settingRecord.value;
      const settingValue: Record<string, unknown> =
        typeof raw === 'object'
          ? (raw as Record<string, unknown>)
          : (JSON.parse(String(raw)) as Record<string, unknown>);

      const fxConfig = settingValue.fx_usdclp as { rate?: number } | undefined;
      if (fxConfig?.rate) {
        fxRate = Number(fxConfig.rate);
      } else {
        throw new Error('FX rate not configured in MTG settings');
      }

      const priceConfig = settingValue.min_card_price_clp as { amount?: number } | undefined;
      if (priceConfig?.amount !== undefined) {
        minCardPriceClp = Number(priceConfig.amount);
      }
    } else {
      throw new Error('MTG settings not configured');
    }
  } catch (e) {
    console.error('Error loading MTG settings:', e);
    throw new Error(
      'MTG settings not configured. Please configure MTG settings in the backoffice.'
    );
  }

  return (
    <CatalogClient
      offers={offers}
      fxRate={fxRate!}
      minCardPriceClp={minCardPriceClp}
    />
  );
}
