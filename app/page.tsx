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
      `id, card_id, foil, language, condition, quantity, price_usd, price_source, price_updated_at, active, variant_sku, created_at, updated_at, cards(id, name, set_name, set_code, collector_number, image_url, sku, rarity, colors, color_identity)`
    )
    .eq('active', true)
    .gt('quantity', 0)
    .order('created_at', { ascending: false });

  const settingsRes = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'fx_usdclp')
    .limit(1)
    .maybeSingle();

  const minPriceRes = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'min_card_price_clp')
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
  const minPriceSetting = (minPriceRes as any)?.data;

  const offers = (data ?? []) as any[];

  // Resolve fx rate from settings (value may be JSON or object)
  let fxRate: number;
  try {
    if (setting && setting.value != null) {
      if (typeof setting.value === 'object') {
        fxRate = Number(setting.value.rate);
      } else {
        const parsed = JSON.parse(String(setting.value));
        fxRate = Number(parsed.rate);
      }
    } else {
      throw new Error('FX rate not configured in settings');
    }
  } catch (e) {
    console.error('Error loading FX rate from settings:', e);
    throw new Error(
      'FX rate not configured. Please set fx_usdclp in settings.'
    );
  }

  // Resolve min card price from settings
  let minCardPriceClp = 100; // default
  try {
    if (minPriceSetting && minPriceSetting.value != null) {
      if (typeof minPriceSetting.value === 'object') {
        minCardPriceClp = Number(minPriceSetting.value.amount);
      } else {
        const parsed = JSON.parse(String(minPriceSetting.value));
        minCardPriceClp = Number(parsed.amount);
      }
    }
  } catch (e) {
    console.error('Error loading min card price from settings:', e);
    // Use default value
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopBar />
      <Header />

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
