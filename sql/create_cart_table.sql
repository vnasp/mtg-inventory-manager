-- Crear tabla para el carrito de compras
CREATE TABLE IF NOT EXISTS public.cart (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_offer_id BIGINT NOT NULL REFERENCES public.card_offers(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un usuario no puede tener el mismo card_offer duplicado en el carrito
  UNIQUE(user_id, card_offer_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_card_offer_id ON public.cart(card_offer_id);

-- Habilitar RLS
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Los usuarios solo pueden ver y modificar su propio carrito
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart;
CREATE POLICY "Users can view own cart"
  ON public.cart
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cart" ON public.cart;
CREATE POLICY "Users can insert own cart"
  ON public.cart
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cart" ON public.cart;
CREATE POLICY "Users can update own cart"
  ON public.cart
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cart" ON public.cart;
CREATE POLICY "Users can delete own cart"
  ON public.cart
  FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS on_cart_updated ON public.cart;
CREATE TRIGGER on_cart_updated
  BEFORE UPDATE ON public.cart
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_cart_updated_at();

COMMENT ON TABLE public.cart IS 'Carrito de compras de usuarios';
