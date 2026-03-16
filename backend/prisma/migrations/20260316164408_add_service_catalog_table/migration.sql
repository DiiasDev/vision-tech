-- CreateTable
CREATE TABLE "ServiceCatalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "billing_model" TEXT NOT NULL,
    "billing_unit" TEXT NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL,
    "internal_cost" DECIMAL(12,2) NOT NULL,
    "estimated_duration" TEXT NOT NULL,
    "complexity_level" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCatalog_team_id_code_key" ON "ServiceCatalog"("team_id", "code");

-- CreateIndex
CREATE INDEX "ServiceCatalog_team_id_idx" ON "ServiceCatalog"("team_id");

-- CreateIndex
CREATE INDEX "ServiceCatalog_status_idx" ON "ServiceCatalog"("status");

-- CreateIndex
CREATE INDEX "ServiceCatalog_category_idx" ON "ServiceCatalog"("category");
