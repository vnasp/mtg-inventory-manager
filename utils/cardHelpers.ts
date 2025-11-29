/**
 * Mapea las condiciones de las cartas de inglés a español
 */
export function mapConditionToSpanish(
  condition: string | null | undefined
): string {
  if (!condition) return 'N/A';

  const conditionMap: Record<string, string> = {
    // Valores con guión bajo (de la DB)
    mint: 'Mint (M)',
    near_mint: 'Near Mint (NM)',
    lightly_played: 'Lightly Played (LP)',
    moderately_played: 'Moderately Played (MP)',
    heavily_played: 'Heavily Played (HP)',
    damaged: 'Damaged (D)',
    // Valores con espacios y abreviaciones
    NM: 'Near Mint (NM)',
    LP: 'Lightly Played (LP)',
    MP: 'Moderately Played (MP)',
    HP: 'Heavily Played (HP)',
    DMG: 'Damaged (D)',
    'Near Mint': 'Near Mint (NM)',
    'Lightly Played': 'Lightly Played (LP)',
    'Moderately Played': 'Moderately Played (MP)',
    'Heavily Played': 'Heavily Played (HP)',
    Damaged: 'Damaged (D)',
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
    etched: 'Etched',
  };

  return foilMap[foil.toLowerCase()] || foil;
}
