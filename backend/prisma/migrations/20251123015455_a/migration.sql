/*
  Warnings:

  - The `maintenanceType` column on the `CarMaintenanceHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maintenanceType` column on the `MaintenanceRecord` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CarMaintenanceHistory" DROP COLUMN "maintenanceType",
ADD COLUMN     "maintenanceType" TEXT NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "MaintenanceRecord" DROP COLUMN "maintenanceType",
ADD COLUMN     "maintenanceType" TEXT NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "CarMaintenanceHistory_maintenanceType_idx" ON "CarMaintenanceHistory"("maintenanceType");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_maintenanceType_idx" ON "MaintenanceRecord"("maintenanceType");
