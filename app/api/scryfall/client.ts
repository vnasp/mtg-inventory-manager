export interface CardData {
  id?: string;
  oracle_id?: string;
  name: string;
  set_name: string;
  collector_number: string;
  type_line: string;
  rarity?: string; // common, uncommon, rare, mythic, etc.
  colors?: string[]; // ["W", "U", "B", "R", "G"]
  color_identity?: string[]; // identidad de color
  image_uris?: { normal: string };
  lang?: string;
  prices: { usd?: string; usd_foil?: string };
  // some cards (double-faced) have `card_faces` where images live
  card_faces?: Array<{
    image_uris?: { normal?: string };
  }>;
}

export async function fetchCardBySetAndNumber(
  setCode: string,
  cardNumber: string,
  lang?: string
): Promise<CardData | null> {
  try {
    const base = `https://api.scryfall.com/cards/${encodeURIComponent(
      setCode.toLowerCase()
    )}/${encodeURIComponent(cardNumber)}`;

    const url = lang
      ? `${base}/${encodeURIComponent(lang.toLowerCase())}`
      : base;

    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'MTGInventoryManager/1.0 (contact: valentinamr@gmail.com)' },
    });

    if (!res.ok) {
      console.error('Scryfall responded with status', res.status);
      return null;
    }

    const data = (await res.json()) as CardData;

    // Normalize image_uris: if top-level missing but card_faces exists,
    // take the first face's image if available.
    if (!data.image_uris && data.card_faces && data.card_faces.length > 0) {
      const f = data.card_faces[0];
      if (f?.image_uris?.normal) {
        data.image_uris = { normal: f.image_uris.normal as string };
      }
    }

    return data;
  } catch (error) {
    console.error('Error al consultar Scryfall:', error);
    return null;
  }
}
