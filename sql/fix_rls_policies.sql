-- Corregir políticas RLS para evitar recursión infinita

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
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
