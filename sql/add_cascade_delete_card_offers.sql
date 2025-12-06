-- Add CASCADE DELETE to card_offers foreign key
-- When a card is deleted from cards table, all its offers are automatically deleted

-- First, drop the existing foreign key constraint
ALTER TABLE card_offers
DROP CONSTRAINT IF EXISTS card_offers_card_id_fkey;

-- Recreate it with ON DELETE CASCADE
ALTER TABLE card_offers
ADD CONSTRAINT card_offers_card_id_fkey
FOREIGN KEY (card_id)
REFERENCES cards(id)
ON DELETE CASCADE;

-- This ensures that when a card is deleted, all its offers are automatically removed
COMMENT ON CONSTRAINT card_offers_card_id_fkey ON card_offers 
IS 'Foreign key with cascade delete - removing a card removes all its offers';
