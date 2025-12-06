-- Migración: Agregar tipo card_condition, columna condition y renombrar finish a foil
-- Fecha: 28 de noviembre de 2025

-- 1. Crear el tipo enum card_condition
CREATE TYPE public.card_condition AS ENUM (
  'mint',
  'near_mint',
  'lightly_played',
  'moderately_played',
  'heavily_played',
  'damaged'
);

-- 2. Agregar la columna condition a card_offers
ALTER TABLE public.card_offers
  ADD COLUMN condition public.card_condition
  NOT NULL DEFAULT 'near_mint';

-- 3. Renombrar la columna finish a foil
ALTER TABLE public.card_offers
  RENAME COLUMN finish TO foil;

-- Comentarios para documentación
COMMENT ON TYPE public.card_condition IS 'Condición física de la carta: mint (M), near mint (NM), lightly played (LP), moderately played (MP), heavily played (HP), damaged (DMG)';
COMMENT ON COLUMN public.card_offers.condition IS 'Condición física de la carta ofertada, por defecto near_mint';
COMMENT ON COLUMN public.card_offers.foil IS 'Tipo de acabado de la carta (text): nonfoil, foil o etched';
