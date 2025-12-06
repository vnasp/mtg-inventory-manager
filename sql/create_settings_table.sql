-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por key
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Habilitar RLS (Row Level Security)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: permitir lectura a usuarios autenticados
CREATE POLICY "settings_select_policy" ON settings
  FOR SELECT
  USING (true);

-- Política para INSERT: solo administradores
CREATE POLICY "settings_insert_policy" ON settings
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Política para UPDATE: solo administradores
CREATE POLICY "settings_update_policy" ON settings
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Política para DELETE: solo administradores
CREATE POLICY "settings_delete_policy" ON settings
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Insertar el valor inicial del tipo de cambio USD/CLP
INSERT INTO settings (key, value)
VALUES ('fx_usdclp', '{"rate": 950}')
ON CONFLICT (key) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE settings IS 'Tabla de configuración del sistema';
COMMENT ON COLUMN settings.key IS 'Clave única de configuración';
COMMENT ON COLUMN settings.value IS 'Valor en formato JSON';
