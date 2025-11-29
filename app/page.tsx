import { cookies } from 'next/headers';
import { createClient as createServerSupabase } from '@/utils/supabase/server';
import CatalogClient from '@/components/CatalogClient';
import '@/app/globals.css';
import Image from 'next/image';

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
    <div className="min-h-screen w-full">
      {/* Header moderno */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/assets/img/logo.png"
                width={150}
                height={60}
                alt="VuduGaming Logo"
                className="h-12 w-auto lg:h-14"
                priority
              />
            </div>

            {/* Nav - Desktop */}
            <nav className="hidden items-center gap-6 md:flex">
              <a
                href="#"
                className="font-medium text-gray-700 transition-colors hover:text-purple-600"
              >
                Catálogo
              </a>
              <a
                href="#"
                className="font-medium text-gray-700 transition-colors hover:text-purple-600"
              >
                Novedades
              </a>
              <a
                href="#"
                className="font-medium text-gray-700 transition-colors hover:text-purple-600"
              >
                Contacto
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <CatalogClient
          offers={offers}
          fxRate={fxRate}
          minCardPriceClp={minCardPriceClp}
        />
      </main>
    </div>
  );
}
