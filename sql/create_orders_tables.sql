-- Crear tabla de órdenes
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL, -- Ej: ORD-20231215-001
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL si es compra como invitado
  
  -- Información del cliente
  customer_email VARCHAR(255) NOT NULL,
  customer_first_name VARCHAR(100),
  customer_last_name VARCHAR(100),
  customer_phone VARCHAR(50),
  
  -- Dirección de envío
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(100) DEFAULT 'Chile',
  
  -- Método de envío (pendiente integración)
  shipping_method VARCHAR(100),
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  
  -- Método de pago (pendiente integración)
  payment_method VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_reference VARCHAR(255), -- ID de transacción del gateway
  
  -- Totales
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CLP',
  
  -- Estado de la orden
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  
  -- Notas
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Crear tabla de items de la orden
CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  card_offer_id BIGINT NOT NULL REFERENCES public.card_offers(id) ON DELETE RESTRICT,
  
  -- Snapshot de la carta al momento de la compra
  card_name VARCHAR(255) NOT NULL,
  card_set_name VARCHAR(255),
  card_image_url TEXT,
  
  -- Snapshot del precio y detalles al momento de la compra
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10, 2) NOT NULL,
  
  -- Detalles de la oferta
  condition VARCHAR(50),
  foil VARCHAR(50),
  language VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR 
    user_id IS NULL -- Permite compras como invitado
  );

-- Políticas RLS para order_items
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (
        orders.user_id = auth.uid() 
        OR 
        orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (
        orders.user_id = auth.uid() 
        OR 
        orders.user_id IS NULL
      )
    )
  );

-- Función para generar número de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  date_part TEXT;
  sequence_part TEXT;
BEGIN
  -- Formato: ORD-YYYYMMDD-XXX
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Obtener el siguiente número de secuencia para el día
  SELECT LPAD(
    COALESCE(
      MAX(
        CAST(
          SUBSTRING(order_number FROM 'ORD-\d{8}-(\d+)') AS INTEGER
        )
      ), 0
    )::INTEGER + 1, 
    3, 
    '0'
  )
  INTO sequence_part
  FROM public.orders
  WHERE order_number LIKE 'ORD-' || date_part || '-%';
  
  new_number := 'ORD-' || date_part || '-' || COALESCE(sequence_part, '001');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar order_number automáticamente
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION handle_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_orders_updated ON public.orders;
CREATE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_orders_updated_at();

COMMENT ON TABLE public.orders IS 'Órdenes de compra del sistema';
COMMENT ON TABLE public.order_items IS 'Items de las órdenes de compra';
