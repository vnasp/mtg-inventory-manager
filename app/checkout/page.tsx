import { cookies } from 'next/headers';
import { createClient as createServerSupabase } from '@/utils/supabase/server';
import CheckoutClient from './CheckoutClient';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore);

  const settingsRes = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'mtg')
    .limit(1)
    .maybeSingle();

  const setting = (settingsRes as any)?.data;

  let fxRate: number;
  let minCardPriceClp = 499;

  try {
    if (setting && setting.value != null) {
      const settingValue =
        typeof setting.value === 'object'
          ? setting.value
          : JSON.parse(String(setting.value));

      if (settingValue.fx_usdclp?.rate) {
        fxRate = Number(settingValue.fx_usdclp.rate);
      } else {
        throw new Error('FX rate not configured');
      }

      if (settingValue.min_card_price_clp?.amount !== undefined) {
        minCardPriceClp = Number(settingValue.min_card_price_clp.amount);
      }
    } else {
      throw new Error('MTG settings not configured');
    }
  } catch (e) {
    console.error('Error loading MTG settings:', e);
    throw new Error('Settings not configured');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopBar />
      <Header fxRate={fxRate} minCardPriceClp={minCardPriceClp} />

      <CheckoutClient fxRate={fxRate} minCardPriceClp={minCardPriceClp} />

      <Footer />
    </div>
  );
}
