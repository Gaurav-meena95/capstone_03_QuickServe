-- Drop the unique constraint on token
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_token_key";

-- Add compound unique constraint on shopId and token
ALTER TABLE "orders" ADD CONSTRAINT "orders_shopId_token_key" UNIQUE ("shopId", "token");
