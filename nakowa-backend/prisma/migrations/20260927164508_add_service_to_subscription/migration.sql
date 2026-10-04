/*
  Warnings:

  - Added the required column `service_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "passages" INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "service_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
