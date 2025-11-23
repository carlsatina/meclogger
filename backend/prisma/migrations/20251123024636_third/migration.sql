/*
  Warnings:

  - The `maintenanceType` column on the `VehicleReminder` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "VehicleReminder" DROP COLUMN "maintenanceType",
ADD COLUMN     "maintenanceType" TEXT NOT NULL DEFAULT 'OTHER';
