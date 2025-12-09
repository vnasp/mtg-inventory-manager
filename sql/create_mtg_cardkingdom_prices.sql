-- Create table for storing Card Kingdom retail prices from MTGJSON
-- This table caches the latest prices from AllPricesToday.json
-- Updated by the sync_mtg_prices Edge Function

CREATE TABLE public.mtg_cardkingdom_prices (
  mtgjson_uuid UUID PRIMARY KEY,
  price_retail_nonfoil_usd NUMERIC(10,4),
  price_retail_foil_usd NUMERIC(10,4),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mtg_ck_prices_updated 
ON public.mtg_cardkingdom_prices(updated_at);

-- Add comments for documentation
COMMENT ON TABLE public.mtg_cardkingdom_prices IS 
'Card Kingdom retail prices for MTG cards, indexed by MTGJSON UUID. Updated daily by sync_mtg_prices function.';

COMMENT ON COLUMN public.mtg_cardkingdom_prices.mtgjson_uuid IS 
'MTGJSON UUID linking to mtg_cardidentifiers table';

COMMENT ON COLUMN public.mtg_cardkingdom_prices.price_retail_nonfoil_usd IS 
'Latest Card Kingdom retail price for nonfoil/normal version in USD';

COMMENT ON COLUMN public.mtg_cardkingdom_prices.price_retail_foil_usd IS 
'Latest Card Kingdom retail price for foil version in USD';

COMMENT ON COLUMN public.mtg_cardkingdom_prices.updated_at IS 
'Timestamp of last price update from MTGJSON AllPricesToday.json';

-- Enable Row Level Security
ALTER TABLE public.mtg_cardkingdom_prices ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read prices
CREATE POLICY "Admin read access to prices"
ON public.mtg_cardkingdom_prices
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Policy: Service role can insert/update prices (for Edge Function)
CREATE POLICY "Service role can manage prices"
ON public.mtg_cardkingdom_prices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
