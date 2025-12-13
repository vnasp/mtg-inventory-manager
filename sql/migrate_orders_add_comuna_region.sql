-- Agregar campos comuna y region a la tabla orders
-- Eliminar shipping_postal_code ya que no se usa en Chile

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_comuna TEXT,
ADD COLUMN IF NOT EXISTS shipping_region TEXT;

-- Opcional: Eliminar shipping_postal_code si quieres limpiarlo
-- ALTER TABLE orders DROP COLUMN IF EXISTS shipping_postal_code;

-- Comentario: 
-- La tabla orders ahora tendrá:
-- - shipping_address: Dirección completa (calle, número, depto)
-- - shipping_comuna: Comuna chilena (ej: "Providencia", "Las Condes")
-- - shipping_city: Ciudad (ej: "Santiago", "Valparaíso")
-- - shipping_region: Región de Chile (ej: "Región Metropolitana de Santiago")
-- - shipping_country: País (default "Chile")
