-- Agregar columna updated_at a la tabla mtg_cardidentifiers
-- Para rastrear la fecha de la última actualización de datos desde MTGJson

ALTER TABLE public.mtg_cardidentifiers
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Crear índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_mtg_cardidentifiers_updated_at 
ON public.mtg_cardidentifiers(updated_at);

-- Comentario para documentar la columna
COMMENT ON COLUMN public.mtg_cardidentifiers.updated_at IS 
'Timestamp de la última actualización desde MTGJson AllPrintingsCSVFiles';
