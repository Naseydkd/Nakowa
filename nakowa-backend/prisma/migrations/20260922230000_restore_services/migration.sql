-- Restores the service catalogue removed by the previous migration.
-- This migration is additive for databases already migrated to 20260922220237_init.
CREATE TYPE "ServiceType" AS ENUM ('VIDANGE', 'NETTOYAGE', 'ASSAINISSEMENT', 'CURAGE');

CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "description" TEXT,
    "prix_unitaire" DOUBLE PRECISION NOT NULL,
    "unite" TEXT NOT NULL,
    "duree_estimee" INTEGER,
    "materiels_necessaires" TEXT,
    "precautions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "services_nom_key" ON "services"("nom");
