-- Remove probability from budget table and its index.
DROP INDEX IF EXISTS "Budget_probability_idx";
ALTER TABLE "Budget" DROP COLUMN IF EXISTS "probability";
