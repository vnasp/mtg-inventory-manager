-- Agregar columna markup_percent a card_offers
-- Este campo permite aplicar un markup porcentual al precio base USD de cada carta
-- Por ejemplo: markup_percent = 10 significa que el precio se incrementa en 10%

-- Primero eliminar la columna si existe con definición incorrecta
ALTER TABLE public.card_offers DROP COLUMN IF EXISTS markup_percent;

-- Crear la columna con la definición correcta
ALTER TABLE public.card_offers
ADD COLUMN markup_percent NUMERIC(5,2) DEFAULT 0 NOT NULL;

COMMENT ON COLUMN public.card_offers.markup_percent IS 'Porcentaje de markup aplicado al precio USD base (ej: 10 = 10% de incremento)';

-- El cálculo final del precio sería:
-- precio_final_usd = price_usd * (1 + markup_percent/100)
-- precio_final_clp = precio_final_usd * fxRate
