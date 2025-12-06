-- Add mtgjson_uuid column to cards table
-- This UUID is used to match cards with MTGJSON's AllPricesToday.json for price syncing

ALTER TABLE cards
ADD COLUMN IF NOT EXISTS mtgjson_uuid TEXT;

-- Create index for faster lookups when syncing prices
CREATE INDEX IF NOT EXISTS idx_cards_mtgjson_uuid ON cards(mtgjson_uuid)
WHERE mtgjson_uuid IS NOT NULL;

-- Add comment to document the field
COMMENT ON COLUMN cards.mtgjson_uuid IS 'MTGJSON UUID for price syncing with AllPricesToday.json';
