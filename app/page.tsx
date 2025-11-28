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
      `id, card_id, finish, language, quantity, price_usd, price_source, price_updated_at, active, variant_sku, created_at, updated_at, cards(id, name, set_code, collector_number, image_url, sku, rarity, colors, color_identity)`
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

  return (
    <div className="font-regular flex min-h-screen w-full flex-col items-center justify-center bg-black font-sans lg:flex-row lg:justify-start">
      {/* Logo solo en mobile */}
      <Image
        src="/assets/img/logo.png"
        width={200}
        height={120}
        alt="Logo"
        className="my-4 block h-24 w-auto opacity-95 brightness-[0.85] contrast-[1.05] filter-[drop-shadow(-1px_-1px_1px_rgba(255,255,255,0.25))_drop-shadow(2px_2px_3px_rgba(0,0,0,0.8))] lg:hidden"
      />

      <div className="relative min-h-screen w-screen max-w-[calc(100vh*1680/1024)] bg-[url('/assets/img/bg_mobile.webp')] bg-contain bg-top bg-no-repeat lg:h-screen lg:bg-[url('/assets/img/bg_desktop.webp')] lg:bg-center">
        <CatalogClient offers={offers} fxRate={fxRate} />
      </div>
    </div>
  );
}
