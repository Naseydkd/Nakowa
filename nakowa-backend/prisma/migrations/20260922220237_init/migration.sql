/*
  Warnings:

  - You are about to drop the `interventions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `services` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('SCHEDULED', 'COLLECTED', 'ABSENT', 'NO_WASTE', 'ACCESS_DENIED', 'REFUSED', 'OTHER');

-- DropForeignKey
ALTER TABLE "interventions" DROP CONSTRAINT "interventions_assigned_to_fkey";

-- DropForeignKey
ALTER TABLE "interventions" DROP CONSTRAINT "interventions_client_id_fkey";

-- DropForeignKey
ALTER TABLE "interventions" DROP CONSTRAINT "interventions_service_id_fkey";

-- DropTable
DROP TABLE "interventions";

-- DropTable
DROP TABLE "services";

-- DropEnum
DROP TYPE "InterventionStatus";

-- DropEnum
DROP TYPE "ServiceType";

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "status" "CollectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "passage_number" INTEGER NOT NULL DEFAULT 1,
    "problem_reason" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
