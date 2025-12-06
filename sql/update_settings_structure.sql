-- Script para actualizar la estructura de settings
-- Este script migra de la estructura antigua a la nueva

-- Eliminar registros antiguos si existen
DELETE FROM settings WHERE key IN ('fx_usdclp', 'min_card_price_clp');

-- Insertar configuración para Magic: The Gathering
INSERT INTO settings (key, value)
VALUES (
  'mtg',
  '{
    "fx_usdclp": { "rate": 1000 },
    "min_card_price_clp": { "amount": 499 }
  }'::jsonb
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insertar configuración para Pokémon
INSERT INTO settings (key, value)
VALUES (
  'pokemon',
  '{
    "fx_usdclp": { "rate": 1000 },
    "min_card_price_clp": { "amount": 499 }
  }'::jsonb
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insertar configuración global (información de contacto)
INSERT INTO settings (key, value)
VALUES (
  'global',
  '{
    "contact_info": {
      "email": "",
      "phone": "",
      "instagram": "",
      "facebook": "",
      "x": "",
      "address": ""
    }
  }'::jsonb
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Comentarios para documentación
COMMENT ON TABLE settings IS 'Tabla de configuración del sistema - Estructura actualizada para soportar múltiples juegos';
