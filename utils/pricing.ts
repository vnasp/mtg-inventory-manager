import { createClient as createSupabase } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Calcula el precio final en CLP aplicando la lógica:
 * - Si priceUsd × fxRate < minCardPriceClp, usar minCardPriceClp
 * - De lo contrario, usar priceUsd × fxRate
 *
 * @param priceUsd - Precio en USD (puede ser null)
 * @returns Precio final en CLP o null si no hay precio USD
 */
export async function calculateFinalPriceClp(
  priceUsd: number | null
): Promise<number | null> {
  if (priceUsd === null || priceUsd === undefined) {
    return null;
  }

  try {
    const supabase = createSupabase(supabaseUrl, supabaseKey);

    // Obtener tipo de cambio
    const { data: fxData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'fx_usdclp')
      .limit(1)
      .maybeSingle();

    let fxRate = 950; // valor por defecto
    if (fxData && fxData.value) {
      const fxValue =
        typeof fxData.value === 'object'
          ? fxData.value.rate
          : JSON.parse(String(fxData.value)).rate;
      fxRate = Number(fxValue) || 950;
    }

    // Obtener precio mínimo en CLP
    const { data: minPriceData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'min_card_price_clp')
      .limit(1)
      .maybeSingle();

    let minCardPriceClp = 100; // valor por defecto
    if (minPriceData && minPriceData.value) {
      const minPriceValue =
        typeof minPriceData.value === 'object'
          ? minPriceData.value.amount
          : JSON.parse(String(minPriceData.value)).amount;
      minCardPriceClp = Number(minPriceValue) || 100;
    }

    // Calcular precio en CLP
    const priceClp = priceUsd * fxRate;

    // Aplicar el mínimo si corresponde
    return Math.max(priceClp, minCardPriceClp);
  } catch (error) {
    console.error('Error calculating final price:', error);
    // En caso de error, devolver el precio calculado con valores por defecto
    return priceUsd * 950;
  }
}

/**
 * Obtiene la configuración de precios (fx rate y precio mínimo)
 * @returns Objeto con fxRate y minCardPriceClp
 */
export async function getPricingConfig(): Promise<{
  fxRate: number;
  minCardPriceClp: number;
}> {
  try {
    const supabase = createSupabase(supabaseUrl, supabaseKey);

    // Obtener tipo de cambio
    const { data: fxData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'fx_usdclp')
      .limit(1)
      .maybeSingle();

    let fxRate = 950;
    if (fxData && fxData.value) {
      const fxValue =
        typeof fxData.value === 'object'
          ? fxData.value.rate
          : JSON.parse(String(fxData.value)).rate;
      fxRate = Number(fxValue) || 950;
    }

    // Obtener precio mínimo en CLP
    const { data: minPriceData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'min_card_price_clp')
      .limit(1)
      .maybeSingle();

    let minCardPriceClp = 100;
    if (minPriceData && minPriceData.value) {
      const minPriceValue =
        typeof minPriceData.value === 'object'
          ? minPriceData.value.amount
          : JSON.parse(String(minPriceData.value)).amount;
      minCardPriceClp = Number(minPriceValue) || 100;
    }

    return { fxRate, minCardPriceClp };
  } catch (error) {
    console.error('Error getting pricing config:', error);
    return { fxRate: 950, minCardPriceClp: 100 };
  }
}
