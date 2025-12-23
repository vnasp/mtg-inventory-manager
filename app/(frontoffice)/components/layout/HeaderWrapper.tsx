import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import Header from './Header';

export default async function HeaderWrapper() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const settingsRes = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'mtg')
    .limit(1)
    .maybeSingle();

  const setting = (settingsRes as any)?.data;

  let fxRate: number | undefined;
  let minCardPriceClp = 499;

  try {
    if (setting && setting.value != null) {
      const settingValue =
        typeof setting.value === 'object'
          ? setting.value
          : JSON.parse(String(setting.value));

      if (settingValue.fx_usdclp?.rate) {
        fxRate = Number(settingValue.fx_usdclp.rate);
      }

      if (settingValue.min_card_price_clp?.amount !== undefined) {
        minCardPriceClp = Number(settingValue.min_card_price_clp.amount);
      }
    }
  } catch (e) {
    console.error('Error loading MTG settings:', e);
  }

  return <Header fxRate={fxRate} minCardPriceClp={minCardPriceClp} />;
}
