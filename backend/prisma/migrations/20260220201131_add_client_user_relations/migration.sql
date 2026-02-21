-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "responsibleUserId" TEXT;

-- CreateIndex
CREATE INDEX "Client_createdById_idx" ON "Client"("createdById");

-- CreateIndex
CREATE INDEX "Client_responsibleUserId_idx" ON "Client"("responsibleUserId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
