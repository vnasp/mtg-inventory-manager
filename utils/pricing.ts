import { createClient as createSupabase } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Calcula el precio final en CLP aplicando la lógica:
 * - Aplica markup_percent al price_usd
 * - Si priceUsd × fxRate < minCardPriceClp, usar minCardPriceClp
 * - De lo contrario, usar priceUsd × fxRate
 *
 * @param priceUsd - Precio base en USD (puede ser null)
 * @param markupPercent - Porcentaje de markup a aplicar (default 0)
 * @param game - Juego para obtener la configuración específica ('mtg' o 'pokemon')
 * @returns Precio final en CLP o null si no hay precio USD
 */
export async function calculateFinalPriceClp(
  priceUsd: number | null,
  markupPercent: number = 0,
  game: 'mtg' | 'pokemon' = 'mtg'
): Promise<number | null> {
  if (priceUsd === null || priceUsd === undefined) {
    return null;
  }

  // Aplicar markup al precio USD
  const priceWithMarkup = priceUsd * (1 + markupPercent / 100);

  try {
    const supabase = createSupabase(supabaseUrl, supabaseKey);

    // Obtener configuración del juego específico
    const { data: gameData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', game)
      .limit(1)
      .maybeSingle();

    let fxRate = 950; // valor por defecto
    let minCardPriceClp = 100; // valor por defecto

    if (gameData && gameData.value) {
      const gameValue =
        typeof gameData.value === 'object'
          ? gameData.value
          : JSON.parse(String(gameData.value));

      if (gameValue.fx_usdclp?.rate) {
        fxRate = Number(gameValue.fx_usdclp.rate) || 950;
      }
      if (gameValue.min_card_price_clp?.amount) {
        minCardPriceClp = Number(gameValue.min_card_price_clp.amount) || 100;
      }
    }

    // Calcular precio en CLP (ya con markup aplicado)
    const priceClp = priceWithMarkup * fxRate;

    // Aplicar el mínimo si corresponde
    return Math.max(priceClp, minCardPriceClp);
  } catch (error) {
    console.error('Error calculating final price:', error);
    // En caso de error, devolver el precio calculado con valores por defecto
    return priceWithMarkup * 950;
  }
}

/**
 * Obtiene la configuración de precios (fx rate y precio mínimo)
 * @param game - Juego para obtener la configuración específica ('mtg' o 'pokemon')
 * @returns Objeto con fxRate y minCardPriceClp
 */
export async function getPricingConfig(
  game: 'mtg' | 'pokemon' = 'mtg'
): Promise<{
  fxRate: number;
  minCardPriceClp: number;
}> {
  try {
    const supabase = createSupabase(supabaseUrl, supabaseKey);

    // Obtener configuración del juego específico
    const { data: gameData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', game)
      .limit(1)
      .maybeSingle();

    let fxRate = 950;
    let minCardPriceClp = 100;

    if (gameData && gameData.value) {
      const gameValue =
        typeof gameData.value === 'object'
          ? gameData.value
          : JSON.parse(String(gameData.value));

      if (gameValue.fx_usdclp?.rate) {
        fxRate = Number(gameValue.fx_usdclp.rate) || 950;
      }
      if (gameValue.min_card_price_clp?.amount) {
        minCardPriceClp = Number(gameValue.min_card_price_clp.amount) || 100;
      }
    }

    return { fxRate, minCardPriceClp };
  } catch (error) {
    console.error('Error getting pricing config:', error);
    return { fxRate: 950, minCardPriceClp: 100 };
  }
}
