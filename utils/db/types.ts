// Tipos y enumeraciones para las tablas `cards` y `card_offers`

// enums lógicas
export type CardFoil = 'nonfoil' | 'foil' | 'etched';
export type CardCondition =
  | 'mint'
  | 'near_mint'
  | 'lightly_played'
  | 'moderately_played'
  | 'heavily_played'
  | 'damaged';
export type CardRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'mythic'
  | 'special'
  | 'bonus';
export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'; // White, Blue, Black, Red, Green, Colorless

// Tabla: cards
export interface Card {
  id: number;
  scryfall_id?: string | null; // UUID en texto
  name: string;
  set_code: string; // ej: 'm21'
  set_name: string; // ej: 'Core Set 2021'
  collector_number: string; // puede ser alfanumérico, p.ej. '123a'
  type_line?: string | null;
  rarity?: CardRarity | null; // rareza de la carta
  colors?: string[] | null; // colores actuales de la carta (ej: ["W", "U"])
  color_identity?: string[] | null; // identidad de color (símbolos de maná en cualquier parte)
  image_url?: string | null;
  json_raw?: unknown; // JSON de Scryfall

  has_nonfoil?: boolean | null;
  has_foil?: boolean | null;
  has_etched?: boolean | null;

  created_at: string; // ISO
  updated_at: string; // ISO
  sku: string; // generado: set_code-collector_number (lowercase)
}

// Tabla: card_offers (variantes vendibles)
export interface CardOffer {
  id: number;
  card_id: number;

  foil: CardFoil; // text: nonfoil | foil | etched (tipo de acabado de la carta)
  language: string; // 'EN' por defecto
  condition: CardCondition; // mint | near_mint | lightly_played | moderately_played | heavily_played | damaged

  quantity: number; // >= 0
  price_usd?: number | null; // snapshot Scryfall en USD
  price_source: string; // 'scryfall' (por ahora)
  price_updated_at?: string | null; // ISO

  active: boolean; // visible para vender
  variant_sku: string; // m21-123-foil-EN-NM

  created_at: string; // ISO
  updated_at: string; // ISO
}
