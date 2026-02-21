/*
  Warnings:

  - The `plan` column on the `Organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('ESSENTIAL', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELINQUENT');

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "plan",
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'ESSENTIAL',
DROP COLUMN "status",
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "ClientType" NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastContact" TIMESTAMP(3),
    "responsibleName" TEXT,
    "responsibleEmail" TEXT,
    "responsiblePhone" TEXT,
    "street" TEXT,
    "number" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Client_organizationId_idx" ON "Client"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_organizationId_code_key" ON "Client"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Client_organizationId_document_key" ON "Client"("organizationId", "document");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
