-- CreateIndex
CREATE INDEX "clients_phone_idx" ON "clients"("phone");

-- CreateIndex
CREATE INDEX "clients_is_active_idx" ON "clients"("is_active");

-- CreateIndex
CREATE INDEX "collections_scheduled_at_idx" ON "collections"("scheduled_at");

-- CreateIndex
CREATE INDEX "collections_status_idx" ON "collections"("status");

-- CreateIndex
CREATE INDEX "collections_agent_id_idx" ON "collections"("agent_id");

-- CreateIndex
CREATE INDEX "collections_client_id_idx" ON "collections"("client_id");

-- CreateIndex
CREATE INDEX "payments_client_id_idx" ON "payments"("client_id");

-- CreateIndex
CREATE INDEX "subscriptions_client_id_idx" ON "subscriptions"("client_id");

-- CreateIndex
CREATE INDEX "subscriptions_is_active_idx" ON "subscriptions"("is_active");
