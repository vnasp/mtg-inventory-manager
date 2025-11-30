/**
 * Utilidades para cálculo de precios con markup
 */

/**
 * Calcula el precio USD con markup aplicado
 * @param basePrice - Precio base en USD
 * @param markupPercent - Porcentaje de markup (ej: 10 = 10%)
 * @returns Precio con markup aplicado
 */
export function applyMarkup(
  basePrice: number,
  markupPercent: number = 0
): number {
  return basePrice * (1 + markupPercent / 100);
}

/**
 * Calcula el precio final en CLP con markup y tipo de cambio
 * @param basePrice - Precio base en USD
 * @param markupPercent - Porcentaje de markup (ej: 10 = 10%)
 * @param fxRate - Tipo de cambio USD a CLP
 * @param minPrice - Precio mínimo en CLP (opcional)
 * @returns Precio final en CLP
 */
export function calculatePriceClp(
  basePrice: number,
  markupPercent: number = 0,
  fxRate: number,
  minPrice?: number
): number {
  const priceWithMarkup = applyMarkup(basePrice, markupPercent);
  const priceClp = Math.round(priceWithMarkup * fxRate);

  if (minPrice !== undefined) {
    return Math.max(priceClp, minPrice);
  }

  return priceClp;
}

/**
 * Formatea un precio en CLP
 * @param price - Precio en CLP
 * @returns String formateado (ej: "$1.500")
 */
export function formatPriceClp(price: number): string {
  return `$${price.toLocaleString('es-CL')}`;
}

/**
 * Formatea un precio en USD
 * @param price - Precio en USD
 * @returns String formateado (ej: "$1.50 USD")
 */
export function formatPriceUsd(price: number): string {
  return `$${price.toFixed(2)} USD`;
}
