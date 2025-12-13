-- Migración para agregar campos adicionales a la tabla profiles existente
-- La tabla profiles ya existe con: id, email, role, first_name, last_name

-- Agregar campos nuevos si no existen
DO $$ 
BEGIN
  -- Agregar phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;

  -- Agregar address
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN address TEXT;
  END IF;

  -- Agregar city
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'city'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
  END IF;

  -- Agregar postal_code
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN postal_code TEXT;
  END IF;

  -- Agregar country con valor por defecto
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'country'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN country TEXT DEFAULT 'Chile';
  END IF;

  -- Agregar created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Agregar updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Actualizar registros existentes con valores por defecto para campos de fecha
UPDATE public.profiles 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE public.profiles 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Asegurar que el tipo ENUM user_role incluye los valores necesarios
-- (customer y admin). Si ya existe, esto no hace nada.
DO $$
BEGIN
  -- Verificar si el enum user_role existe
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Intentar agregar 'customer' si no existe
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer';
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Ignorar si ya existe o hay error
    END;
    
    -- Intentar agregar 'admin' si no existe
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Ignorar si ya existe o hay error
    END;
  END IF;
END $$;

-- Asegurar que la columna role tiene un valor por defecto correcto
-- Cambiar de 'user' a 'customer' como valor por defecto
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'customer'::user_role;

-- Opcional: Actualizar registros existentes con rol 'user' a 'customer'
-- (descomenta si quieres migrar usuarios existentes con rol 'user')
-- UPDATE public.profiles 
-- SET role = 'customer'::user_role 
-- WHERE role = 'user'::user_role;

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Habilitar RLS (Row Level Security) si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para recrearlas)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- Política: Permitir lectura a todos los usuarios autenticados
-- Esto evita la recursión infinita al permitir que cualquier usuario autenticado 
-- lea profiles (necesario para verificar roles)
CREATE POLICY "Enable read access for all users"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: Permitir inserciones para usuarios autenticados
CREATE POLICY "Enable insert for authenticated users only"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Enable update for users based on id"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios del sistema, vinculados a auth.users de Supabase';
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario: customer (cliente) o admin (administrador)';
