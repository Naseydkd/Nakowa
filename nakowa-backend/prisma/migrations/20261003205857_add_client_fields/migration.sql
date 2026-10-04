-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "activity" TEXT,
ADD COLUMN     "default_amount" DOUBLE PRECISION NOT NULL DEFAULT 2000,
ADD COLUMN     "number" TEXT;
