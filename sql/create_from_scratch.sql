-- =============================================================================
-- MTG Inventory Manager — Migración completa desde cero
-- Ejecutar en Supabase SQL Editor (web) en un proyecto nuevo/vacío.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. mtg_profiles — vinculada a auth.users (Supabase Auth)
--    Prefijo mtg_ para coexistir con otras apps en la misma DB de Supabase.
--    El trigger mtg_handle_new_user la puebla al registrar cada usuario.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mtg_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  first_name TEXT,
  last_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: crea un perfil automáticamente al registrar un usuario en Auth
CREATE OR REPLACE FUNCTION public.mtg_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mtg_profiles (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER mtg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.mtg_handle_new_user();


-- -----------------------------------------------------------------------------
-- 2. Helper: is_admin
--    Depende de public.mtg_profiles (creada arriba).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.mtg_profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;


-- -----------------------------------------------------------------------------
-- 2. ENUM: condición de la carta
--    (foil se guarda como TEXT con CHECK constraint)
-- -----------------------------------------------------------------------------
CREATE TYPE public.card_condition AS ENUM (
  'mint',
  'near_mint',
  'lightly_played',
  'moderately_played',
  'heavily_played',
  'damaged'
);


-- -----------------------------------------------------------------------------
-- 3. mtg_cards — una fila por impresión única de carta (identificada por scryfall_id)
-- -----------------------------------------------------------------------------
CREATE TABLE public.mtg_cards (
  id                 BIGSERIAL PRIMARY KEY,
  scryfall_id        TEXT,
  scryfall_oracle_id TEXT,
  mtgjson_uuid       TEXT,
  name               TEXT NOT NULL,
  set_code           TEXT NOT NULL,
  set_name           TEXT NOT NULL,
  collector_number   TEXT NOT NULL,
  type_line          TEXT,
  rarity             TEXT,
  colors             TEXT[],
  color_identity     TEXT[],
  image_url          TEXT,
  json_raw           JSONB,
  has_nonfoil        BOOLEAN,
  has_foil           BOOLEAN,
  has_etched         BOOLEAN,
  sku                TEXT GENERATED ALWAYS AS (lower(set_code) || '-' || lower(collector_number)) STORED,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_mtg_cards_scryfall_id      ON public.mtg_cards(scryfall_id)        WHERE scryfall_id IS NOT NULL;
CREATE INDEX        idx_mtg_cards_oracle_id         ON public.mtg_cards(scryfall_oracle_id)  WHERE scryfall_oracle_id IS NOT NULL;
CREATE INDEX        idx_mtg_cards_mtgjson_uuid      ON public.mtg_cards(mtgjson_uuid)        WHERE mtgjson_uuid IS NOT NULL;
CREATE INDEX        idx_mtg_cards_set_collector     ON public.mtg_cards(set_code, collector_number);


-- -----------------------------------------------------------------------------
-- 4. mtg_card_offers — variantes vendibles (foil × idioma × condición)
-- -----------------------------------------------------------------------------
CREATE TABLE public.mtg_card_offers (
  id               BIGSERIAL PRIMARY KEY,
  card_id          BIGINT NOT NULL REFERENCES public.mtg_cards(id) ON DELETE CASCADE,
  foil             TEXT NOT NULL CHECK (foil IN ('nonfoil', 'foil', 'etched')),
  language         TEXT NOT NULL DEFAULT 'EN',
  condition        public.card_condition NOT NULL DEFAULT 'near_mint',
  quantity         INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  price_usd        NUMERIC(10,4),
  markup_percent   NUMERIC(5,2) NOT NULL DEFAULT 0,
  price_source     TEXT NOT NULL DEFAULT 'scryfall',
  price_updated_at TIMESTAMPTZ,
  active           BOOLEAN NOT NULL DEFAULT true,
  variant_sku      TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_mtg_card_offers_variant  ON public.mtg_card_offers(card_id, foil, language, condition);
CREATE INDEX        idx_mtg_card_offers_active   ON public.mtg_card_offers(active) WHERE active = true;
CREATE INDEX        idx_mtg_card_offers_card_id  ON public.mtg_card_offers(card_id);


-- -----------------------------------------------------------------------------
-- 5. mtg_settings — configuración multi-juego (keys: 'mtg')
-- -----------------------------------------------------------------------------
CREATE TABLE public.mtg_settings (
  id         SERIAL PRIMARY KEY,
  key        VARCHAR(100) UNIQUE NOT NULL,
  value      JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mtg_settings_key ON public.mtg_settings(key);


-- -----------------------------------------------------------------------------
-- 6. mtg_cardidentifiers — tabla de referencia cruzada de identificadores MTGJson
--    Mapea scryfallid/scryfalloracleid → uuid para sincronización de precios.
--    Se vacía y recarga completa en cada sync (millones de filas).
-- -----------------------------------------------------------------------------
CREATE TABLE public.mtg_cardidentifiers (
  uuid                     TEXT PRIMARY KEY,
  cardkingdometchedid      TEXT,
  cardkingdomfoilid        TEXT,
  cardkingdomid            TEXT,
  cardspherefoilid         TEXT,
  cardsphereid             TEXT,
  deckboxid                TEXT,
  mcmid                    TEXT,
  mcmmetaid                TEXT,
  mtgarenaid               TEXT,
  mtgjsonfoilversionid     TEXT,
  mtgjsonnonfoilversionid  TEXT,
  mtgjsonv4id              TEXT,
  mtgofoilid               TEXT,
  mtgoid                   TEXT,
  multiverseid             TEXT,
  scryfallcardbackid       TEXT,
  scryfallid               TEXT,
  scryfallillustrationid   TEXT,
  scryfalloracleid         TEXT,
  tcgplayeretchedproductid TEXT,
  tcgplayerproductid       TEXT,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mtg_cardid_scryfallid     ON public.mtg_cardidentifiers(scryfallid)     WHERE scryfallid IS NOT NULL;
CREATE INDEX idx_mtg_cardid_oracleid       ON public.mtg_cardidentifiers(scryfalloracleid) WHERE scryfalloracleid IS NOT NULL;
CREATE INDEX idx_mtg_cardid_updated_at     ON public.mtg_cardidentifiers(updated_at);


-- -----------------------------------------------------------------------------
-- 7. mtg_cardkingdom_prices — precios Card Kingdom cacheados desde MTGJson
-- -----------------------------------------------------------------------------
CREATE TABLE public.mtg_cardkingdom_prices (
  mtgjson_uuid             TEXT PRIMARY KEY,
  price_retail_nonfoil_usd NUMERIC(10,4),
  price_retail_foil_usd    NUMERIC(10,4),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mtg_ck_prices_updated ON public.mtg_cardkingdom_prices(updated_at);


-- =============================================================================
-- 8. Row Level Security
-- =============================================================================

ALTER TABLE public.mtg_cards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mtg_card_offers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mtg_settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mtg_cardidentifiers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mtg_cardkingdom_prices ENABLE ROW LEVEL SECURITY;

-- mtg_cards: service_role gestiona todo; anon y auth leen
CREATE POLICY "svc_all"   ON public.mtg_cards FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read" ON public.mtg_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_read" ON public.mtg_cards FOR SELECT TO anon USING (true);

-- mtg_card_offers: service_role gestiona todo; auth lee todo; anon solo activas
CREATE POLICY "svc_all"          ON public.mtg_card_offers FOR ALL    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read"        ON public.mtg_card_offers FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_read_active" ON public.mtg_card_offers FOR SELECT TO anon USING (active = true);

-- mtg_settings: todos leen; solo service_role escribe
CREATE POLICY "all_read"  ON public.mtg_settings FOR SELECT USING (true);
CREATE POLICY "svc_write" ON public.mtg_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mtg_cardidentifiers: service_role gestiona; anon y auth leen
CREATE POLICY "svc_all"   ON public.mtg_cardidentifiers FOR ALL    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read" ON public.mtg_cardidentifiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_read" ON public.mtg_cardidentifiers FOR SELECT TO anon USING (true);

-- mtg_cardkingdom_prices: service_role gestiona; auth lee
CREATE POLICY "svc_all"   ON public.mtg_cardkingdom_prices FOR ALL    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read" ON public.mtg_cardkingdom_prices FOR SELECT TO authenticated USING (true);

-- mtg_profiles: usuario lee/edita su propio perfil; admin lee todos; service_role gestiona todo
ALTER TABLE public.mtg_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_read"   ON public.mtg_profiles FOR SELECT USING (auth.uid() = id OR is_admin(auth.uid()));
CREATE POLICY "own_update" ON public.mtg_profiles FOR UPDATE USING (auth.uid() = id OR is_admin(auth.uid()));
CREATE POLICY "svc_all"    ON public.mtg_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);


-- =============================================================================
-- 9. Funciones RPC
-- =============================================================================

-- Incrementa/decrementa quantity de una oferta de forma atómica.
-- El resultado se clampea a >= 0.
CREATE OR REPLACE FUNCTION public.increment_card_offer_quantity(offer_id bigint, inc int)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.mtg_card_offers
  SET
    quantity   = GREATEST(0, COALESCE(quantity, 0) + inc),
    updated_at = NOW()
  WHERE id = offer_id;
$$;


-- =============================================================================
-- 10. Datos iniciales (seed)
-- =============================================================================

INSERT INTO public.mtg_settings (key, value) VALUES
  (
    'mtg',
    '{"fx_usdclp": {"rate": 1000}, "min_card_price_clp": {"amount": 499}}'::jsonb
  ),
ON CONFLICT (key) DO NOTHING;
