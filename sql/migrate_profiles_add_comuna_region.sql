-- Agregar campos comuna y region a la tabla profiles
-- Eliminar postal_code ya que no se usa en Chile

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS comuna TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;

-- Opcional: Eliminar postal_code si quieres limpiarlo
-- ALTER TABLE profiles DROP COLUMN IF EXISTS postal_code;

-- Comentario: 
-- La tabla profiles ahora tendrá:
-- - address: Dirección completa (calle, número, depto)
-- - comuna: Comuna chilena (ej: "Providencia", "Las Condes")
-- - city: Ciudad (ej: "Santiago", "Valparaíso")
-- - region: Región de Chile (ej: "Región Metropolitana de Santiago")
-- - country: País (default "Chile")
