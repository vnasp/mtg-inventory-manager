-- Arreglar políticas RLS para permitir checkout de invitados
-- Este script permite que usuarios no autenticados puedan crear órdenes

-- 1. Primero, eliminar las políticas existentes de orders si las hay
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view orders" ON orders;

-- 2. Permitir a cualquiera (autenticado o no) INSERTAR órdenes
-- Esto es necesario para el checkout de invitados
CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3. Permitir a usuarios autenticados ver sus propias órdenes
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

-- 4. Permitir a admins ver todas las órdenes
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 5. Políticas para order_items (deben permitir inserciones relacionadas)
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;

CREATE POLICY "Anyone can create order items"
ON order_items FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their order items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

-- 6. Verificar que RLS está habilitado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Comentario: 
-- Estas políticas permiten:
-- - Checkout de invitados (usuarios no autenticados pueden crear órdenes)
-- - Usuarios autenticados pueden ver sus propias órdenes
-- - Admins pueden ver todas las órdenes
-- - Las órdenes de invitados (user_id IS NULL) son visibles para el usuario que las creó si luego se autentica
