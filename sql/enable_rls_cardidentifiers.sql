-- Enable RLS for mtg_cardidentifiers table and create policy for service role access
-- This allows the API to read MTGJSON data using the service role key

-- Enable RLS (may already be enabled)
ALTER TABLE "mtg_cardidentifiers" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to read all rows
CREATE POLICY "Allow service role to read mtg_cardidentifiers"
ON "mtg_cardidentifiers"
FOR SELECT
TO service_role
USING (true);

-- Also allow authenticated users to read (optional, for future features)
CREATE POLICY "Allow authenticated users to read mtg_cardidentifiers"
ON "mtg_cardidentifiers"
FOR SELECT
TO authenticated
USING (true);
