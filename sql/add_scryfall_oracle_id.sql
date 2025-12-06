-- Agregar columna scryfall_oracle_id a la tabla cards
-- El oracle_id identifica de manera única una carta independientemente del set
-- Útil para agrupar todas las impresiones de la misma carta

ALTER TABLE public.cards
ADD COLUMN IF NOT EXISTS scryfall_oracle_id TEXT;

-- Crear índice para mejorar búsquedas por oracle_id
CREATE INDEX IF NOT EXISTS idx_cards_scryfall_oracle_id 
ON public.cards(scryfall_oracle_id);

-- Comentario para documentar la columna
COMMENT ON COLUMN public.cards.scryfall_oracle_id IS 'Scryfall Oracle ID - identifica la misma carta a través de diferentes sets e impresiones';
