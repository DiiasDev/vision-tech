ALTER TABLE "Budget"
  ADD COLUMN IF NOT EXISTS "serviceId" TEXT,
  ADD COLUMN IF NOT EXISTS "clientName" TEXT,
  ADD COLUMN IF NOT EXISTS "clientSegment" TEXT,
  ADD COLUMN IF NOT EXISTS "clientDocument" TEXT,
  ADD COLUMN IF NOT EXISTS "clientCity" TEXT,
  ADD COLUMN IF NOT EXISTS "clientState" TEXT,
  ADD COLUMN IF NOT EXISTS "clientContactName" TEXT,
  ADD COLUMN IF NOT EXISTS "clientContactRole" TEXT,
  ADD COLUMN IF NOT EXISTS "clientEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "clientPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceCode" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceName" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceBillingModel" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceEstimatedDuration" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceResponsible" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "productsTotalAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "productsCostAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "serviceTotalAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "serviceCostAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "budgetDiscount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "budgetTotalCostAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "budgetTotalAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "budgetProfitPercent" DECIMAL(5, 2) NOT NULL DEFAULT 0;

UPDATE "Budget"
SET
  "assumptions" = COALESCE("assumptions", ARRAY[]::TEXT[]),
  "exclusions" = COALESCE("exclusions", ARRAY[]::TEXT[]),
  "attachments" = COALESCE("attachments", ARRAY[]::TEXT[])
WHERE "assumptions" IS NULL
   OR "exclusions" IS NULL
   OR "attachments" IS NULL;

ALTER TABLE "Budget"
  ALTER COLUMN "assumptions" SET NOT NULL,
  ALTER COLUMN "exclusions" SET NOT NULL,
  ALTER COLUMN "attachments" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Budget_serviceId_fkey'
  ) THEN
    ALTER TABLE "Budget"
      ADD CONSTRAINT "Budget_serviceId_fkey"
      FOREIGN KEY ("serviceId") REFERENCES "ServiceCatalog"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "Budget_serviceId_idx" ON "Budget"("serviceId");
