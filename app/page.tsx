import { cookies } from 'next/headers';
import { createClient as createServerSupabase } from '@/utils/supabase/server';
import CatalogClient from '@/components/CatalogClient';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore);

  const offersRes = await supabase
    .from('card_offers')
    .select(
      `id, card_id, foil, language, condition, quantity, price_usd, price_source, price_updated_at, active, variant_sku, created_at, updated_at, cards(id, name, set_name, set_code, collector_number, type_line, image_url, sku, rarity, colors, color_identity)`
    )
    .eq('active', true)
    .gt('quantity', 0)
    .order('created_at', { ascending: false });

  const settingsRes = await supabase
    .from('settings')
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

  const data = offersRes.data as any[] | null;
  const setting = (settingsRes as any)?.data;

  const offers = (data ?? []) as any[];

  // Resolve fx rate and min price from MTG settings
  let fxRate: number;
  let minCardPriceClp = 499; // default

  try {
    if (setting && setting.value != null) {
      const settingValue =
        typeof setting.value === 'object'
          ? setting.value
          : JSON.parse(String(setting.value));

      // Get fx_usdclp.rate
      if (settingValue.fx_usdclp?.rate) {
        fxRate = Number(settingValue.fx_usdclp.rate);
      } else {
        throw new Error('FX rate not configured in MTG settings');
      }

      // Get min_card_price_clp.amount
      if (settingValue.min_card_price_clp?.amount !== undefined) {
        minCardPriceClp = Number(settingValue.min_card_price_clp.amount);
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
    <div className="flex min-h-screen w-full flex-col">
      <TopBar />
      <Header fxRate={fxRate} minCardPriceClp={minCardPriceClp} />

      {/* Main content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <CatalogClient
          offers={offers}
          fxRate={fxRate}
          minCardPriceClp={minCardPriceClp}
        />
      </main>

      <Footer />
    </div>
  );
}
