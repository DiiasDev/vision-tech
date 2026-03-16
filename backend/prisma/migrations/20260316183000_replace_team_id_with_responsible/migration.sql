-- DropIndex
DROP INDEX IF EXISTS "ServiceCatalog_team_id_code_key";

-- DropIndex
DROP INDEX IF EXISTS "ServiceCatalog_team_id_idx";

-- AlterTable
ALTER TABLE "ServiceCatalog"
ADD COLUMN "responsible" TEXT NOT NULL DEFAULT 'Responsavel padrao';

-- Preserve prior ownership values when available
UPDATE "ServiceCatalog"
SET "responsible" = COALESCE(NULLIF("team_id", ''), 'Responsavel padrao');

-- AlterTable
ALTER TABLE "ServiceCatalog"
DROP COLUMN "team_id";

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCatalog_code_key" ON "ServiceCatalog"("code");

-- CreateIndex
CREATE INDEX "ServiceCatalog_responsible_idx" ON "ServiceCatalog"("responsible");
