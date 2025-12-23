// Tipos y enumeraciones para las tablas `cards` y `card_offers`

// enums lógicas
type CardFoil = 'nonfoil' | 'foil' | 'etched';
type CardCondition =
  | 'mint'
  | 'near_mint'
  | 'lightly_played'
  | 'moderately_played'
  | 'heavily_played'
  | 'damaged';
type CardRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'mythic'
  | 'special'
  | 'bonus';

// Tabla: cards
interface Card {
  id: number;
  scryfall_id?: string | null; // UUID en texto (identifica la impresión específica)
  scryfall_oracle_id?: string | null; // Oracle ID de Scryfall (identifica la carta a través de sets)
  mtgjson_uuid?: string | null; // UUID de MTGJSON para match con AllPricesToday
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
interface CardOffer {
  id: number;
  card_id: number;

  foil: CardFoil; // text: nonfoil | foil | etched (tipo de acabado de la carta)
  language: string; // 'EN' por defecto
  condition: CardCondition; // mint | near_mint | lightly_played | moderately_played | heavily_played | damaged

  quantity: number; // >= 0
  price_usd?: number | null; // snapshot Scryfall en USD
  markup_percent?: number; // porcentaje de markup sobre price_usd (default 0)
  price_source: string; // 'scryfall' (por ahora)
  price_updated_at?: string | null; // ISO

  active: boolean; // visible para vender
  variant_sku: string; // m21-123-foil-EN-NM

  created_at: string; // ISO
  updated_at: string; // ISO
}

// Tabla: profiles (Usuarios del sistema)
type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string; // UUID vinculado a auth.users
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  comuna: string | null;
  city: string | null;
  region: string | null;
  country: string; // default: 'Chile'
  role: UserRole; // 'customer' | 'admin'
  created_at: string; // ISO
  updated_at: string; // ISO
}

// Tabla: cart (carrito de compras)
interface CartItem {
  id: string;
  user_id: string;
  card_offer_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithOffer extends CartItem {
  card_offers: CardOffer & {
    cards: Card;
  };
}

// Tabla: orders (órdenes de compra)
type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
 type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

interface Order {
  id: number;
  order_number: string;
  user_id: string | null;

  customer_email: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;

  shipping_address: string;
  shipping_comuna: string | null;
  shipping_city: string;
  shipping_region: string | null;
  shipping_country: string;

  shipping_method: string | null;
  shipping_cost: number;

  payment_method: string | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;

  subtotal: number;
  tax: number;
  total: number;
  currency: string;

  status: OrderStatus;

  customer_notes: string | null;
  admin_notes: string | null;

  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

interface OrderItem {
  id: number;
  order_id: number;
  card_offer_id: number;

  card_name: string;
  card_set_name: string | null;
  card_image_url: string | null;

  unit_price: number;
  quantity: number;
  subtotal: number;

  condition: string | null;
  foil: string | null;
  language: string | null;

  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
