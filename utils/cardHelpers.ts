/**
 * Mapea las condiciones de las cartas de inglés a español
 */
export function mapConditionToSpanish(
  condition: string | null | undefined
): string {
  if (!condition) return 'N/A';

  const conditionMap: Record<string, string> = {
    NM: 'Near Mint (Casi Perfecta)',
    LP: 'Ligeramente Jugada',
    MP: 'Moderadamente Jugada',
    HP: 'Muy Jugada',
    DMG: 'Dañada',
    'Near Mint': 'Casi Perfecta',
    'Lightly Played': 'Ligeramente Jugada',
    'Moderately Played': 'Moderadamente Jugada',
    'Heavily Played': 'Muy Jugada',
    Damaged: 'Dañada',
  };

  return conditionMap[condition] || condition;
}

/**
 * Mapea los tipos de foil a español
 */
export function mapFoilToSpanish(foil: string | null | undefined): string {
  if (!foil) return 'N/A';

  const foilMap: Record<string, string> = {
    nonfoil: 'Normal',
    foil: 'Foil',
    etched: 'Grabado',
  };

  return foilMap[foil.toLowerCase()] || foil;
}
