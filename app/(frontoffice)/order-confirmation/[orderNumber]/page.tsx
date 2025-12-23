import { cookies } from 'next/headers';
import { createClient as createServerSupabase } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import OrderConfirmationClient from './OrderConfirmationClient';

type Props = {
  params: {
    orderNumber: string;
  };
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = params;

  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore);

  // Obtener la orden
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (*)
    `
    )
    .eq('order_number', orderNumber)
    .single();

  if (error || !order) {
    redirect('/');
  }

  // Obtener settings para el fxRate
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

  return <OrderConfirmationClient order={order} />;
}
