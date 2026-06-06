function applyMarkup(basePrice: number, markupPercent: number = 0): number {
  return basePrice * (1 + markupPercent / 100);
}

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
