/*
  Warnings:

  - You are about to drop the column `city` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `zone` on the `clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "city",
DROP COLUMN "zone";
