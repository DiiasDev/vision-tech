-- AlterTable
ALTER TABLE "ServiceCatalog"
ADD COLUMN "organizationId" TEXT,
ADD COLUMN "createdById" TEXT;

-- CreateIndex
CREATE INDEX "ServiceCatalog_organizationId_idx" ON "ServiceCatalog"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceCatalog_createdById_idx" ON "ServiceCatalog"("createdById");
