export type CardInfo = {
  id?: string;
  name: string;
  set_name?: string;
  set_code?: string;
  collector_number?: string;
  type_line?: string;
  image_url?: string | null;
  sku?: string;
  rarity?: string;
  colors?: string[];
  color_identity?: string[];
};

export type CardOffer = {
  id: string;
  card_id?: string;
  foil: string;
  language?: string;
  condition?: string;
  quantity?: number;
  price_usd: number;
  markup_percent?: number;
  price_source?: string;
  price_updated_at?: string;
  active?: boolean;
  variant_sku?: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
  mtg_cards?: CardInfo;
  cards?: CardInfo;
  card?: CardInfo;
};
