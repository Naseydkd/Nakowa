import { clientService } from '../services/client.service.js';
import { paiementService } from '../services/paiement.service.js';
import { formatCurrency, formatDate } from '../core/utils.js';

const METHOD_LABELS = { ESPECES: 'Espèces', MYNITA: 'MyNita', AMANA_TA: 'AmanaTa', VIREMENT: 'Virement', AUTRE: 'Autre' };
const STATUS_LABELS  = {
    COLLECTED:    { label: 'Collecté',          class: 'status-done' },
    SCHEDULED:    { label: 'Planifié',           class: 'status-pending' },
    ABSENT:       { label: 'Client absent',      class: 'status-cancelled' },
    NO_WASTE:     { label: 'Poubelle absente',   class: 'status-cancelled' },
    ACCESS_DENIED:{ label: 'Accès refusé',       class: 'status-cancelled' },
    REFUSED:      { label: 'Refusé',             class: 'status-cancelled' },
    OTHER:        { label: 'Autre problème',     class: 'status-cancelled' },
};

export const clientDetailsPage = {
    async render() {
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const clientId = params.get('id');

        if (!clientId) {
            return `
                <div class="error-page">
                    <i class="fa-solid fa-circle-exclamation error-icon"></i>
                    <h2>Client non trouvé</h2>
                    <p>L'identifiant du client est manquant dans l'URL.</p>
                    <a href="#clients" class="btn btn-primary">Retour aux clients</a>
                </div>
            `;
        }

        try {
            const response = await clientService.getClient(clientId);
            const client   = response.data || response;

            return `
                <div class="page-header">
                    <div class="page-title">
                        <h1 style="display:flex;align-items:center;gap:15px;">
                            <a href="#clients" style="color:var(--text-muted);"><i class="fa-solid fa-arrow-left"></i></a>
                            ${client.firstName} ${client.lastName}
                        </h1>
                        <div class="page-subtitle">Fiche détaillée du client #${client.id.substring(0, 8)}</div>
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button class="btn btn-outline" id="edit-client-btn"><i class="fa-solid fa-pen"></i> Modifier</button>
                        <button class="btn btn-primary" id="view-on-map-btn"><i class="fa-solid fa-map-location-dot"></i> Voir sur la carte</button>
                    </div>
                </div>

                <div class="dashboard-main-grid" style="grid-template-columns:1fr 2fr;">
                    <!-- Infos client -->
                    <div class="chart-card">
                        <h3 style="margin-bottom:20px;">Informations</h3>
                        <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;">
                            <div class="form-group" style="margin:0;">
                                <span class="stat-label">Prénom & Nom</span>
                                <span style="font-weight:600;">${client.firstName} ${client.lastName}</span>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <span class="stat-label">Téléphone</span>
                                <span style="font-weight:600;">${client.phone || 'Non renseigné'}</span>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <span class="stat-label">Adresse</span>
                                <span style="font-weight:600;">${client.address || 'Non renseigné'}, ${client.city || ''}</span>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <span class="stat-label">Zone</span>
                                <span style="font-weight:600;">${client.zone || 'Non définie'}</span>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <span class="stat-label">Statut</span>
                                <span class="status-badge ${client.isActive ? 'status-done' : 'status-cancelled'}">${client.isActive ? 'Actif' : 'Inactif'}</span>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex;flex-direction:column;gap:25px;">
                        <!-- Carte -->
                        <div class="chart-card">
                            <h3 style="margin-bottom:20px;">Localisation</h3>
                            <div id="client-location-map" style="width:100%;height:250px;background:#eee;border-radius:8px;"></div>
                        </div>

                        <!-- Interventions -->
                        <div class="chart-card">
                            <h3 style="margin-bottom:20px;">Historique des Interventions</h3>
                            <table class="data-table">
                                <thead>
                                    <tr><th>Service</th><th>Date</th><th>Agent</th><th>Statut</th></tr>
                                </thead>
                                <tbody id="interventions-list">
                                    <tr><td colspan="4" style="text-align:center;">Chargement...</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Paiements -->
                        <div class="chart-card">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                                <h3>Historique des Paiements</h3>
                                <button class="btn btn-primary" id="add-payment-client-btn" data-client-id="${client.id}" style="font-size:13px;">
                                    <i class="fa-solid fa-plus"></i> Ajouter un paiement
                                </button>
                            </div>
                            <table class="data-table">
                                <thead>
                                    <tr><th>Mois</th><th>Date</th><th>Montant</th><th>Méthode</th><th>Réf</th><th></th></tr>
                                </thead>
                                <tbody id="payments-list">
                                    <tr><td colspan="6" style="text-align:center;">Chargement...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Modal paiement -->
                <div class="modal" id="detail-payment-modal">
                    <div class="modal-content" style="max-width:480px;">
                        <div class="modal-header">
                            <h3>Enregistrer un Paiement</h3>
                            <button class="modal-close" id="close-detail-payment-modal">
                                <i class="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="detail-payment-form">
                                <div class="form-group">
                                    <label>Mois concerné *</label>
                                    <div style="display:flex;gap:8px;">
                                        <select id="dp-period-month" class="form-input" required>
                                            ${[...Array(12)].map((_, i) => {
                                                const label = new Date(0, i).toLocaleString('fr-FR', { month: 'long' });
                                                const cur   = new Date().getMonth();
                                                return `<option value="${i+1}" ${i===cur?'selected':''}>${label.charAt(0).toUpperCase()+label.slice(1)}</option>`;
                                            }).join('')}
                                        </select>
                                        <select id="dp-period-year" class="form-input" style="width:110px;" required>
                                            <option value="${new Date().getFullYear()}" selected>${new Date().getFullYear()}</option>
                                            <option value="${new Date().getFullYear()-1}">${new Date().getFullYear()-1}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Montant (FCFA) *</label>
                                    <input type="number" id="dp-amount" class="form-input" min="1" placeholder="Ex: 5000" required>
                                </div>
                                <div class="form-group">
                                    <label>Date du paiement *</label>
                                    <input type="date" id="dp-date" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label>Méthode de paiement *</label>
                                    <select id="dp-method" class="form-input" required>
                                        <option value="ESPECES">Espèces</option>
                                        <option value="MYNITA">MyNita</option>
                                        <option value="AMANA_TA">AmanaTa</option>
                                        <option value="VIREMENT">Virement</option>
                                        <option value="AUTRE">Autre</option>
                                    </select>
                                </div>
                                <div class="form-group" id="dp-reference-group" style="display:none;">
                                    <label>Référence *</label>
                                    <input type="text" id="dp-reference" class="form-input" placeholder="Numéro de transaction">
                                </div>
                                <div class="form-group">
                                    <label>Notes</label>
                                    <textarea id="dp-notes" class="form-input" rows="2" placeholder="Optionnel..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-outline" id="cancel-detail-payment-btn">Annuler</button>
                            <button class="btn btn-primary" id="save-detail-payment-btn">
                                <i class="fa-solid fa-save"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Erreur chargement client:', error);
            return `
                <div class="error-page">
                    <i class="fa-solid fa-circle-exclamation error-icon"></i>
                    <h2>Erreur</h2>
                    <p>Impossible de charger les informations du client.</p>
                    <a href="#clients" class="btn btn-primary">Retour aux clients</a>
                </div>
            `;
        }
    },

    async init() {
        const params   = new URLSearchParams(window.location.hash.split('?')[1]);
        const clientId = params.get('id');
        if (!clientId) return;

        try {
            const response = await clientService.getClient(clientId);
            const client   = response.data || response;

            this.initClientMap(client);
            await this.loadInterventions(clientId);
            await this.loadPayments(clientId);

            // Navigation
            document.getElementById('view-on-map-btn')?.addEventListener('click', () => {
                window.location.hash = 'map?clientId=' + clientId;
            });
            document.getElementById('edit-client-btn')?.addEventListener('click', () => {
                window.location.hash = 'clients';
            });

            // Modal paiement
            document.getElementById('add-payment-client-btn')?.addEventListener('click', () => {
                this.openPaymentModal(clientId);
            });
            document.getElementById('close-detail-payment-modal')?.addEventListener('click', () => {
                this.closePaymentModal();
            });
            document.getElementById('cancel-detail-payment-btn')?.addEventListener('click', () => {
                this.closePaymentModal();
            });
            document.getElementById('save-detail-payment-btn')?.addEventListener('click', () => {
                this.savePayment(clientId);
            });

            // Afficher/cacher référence
            document.getElementById('dp-method')?.addEventListener('change', (e) => {
                document.getElementById('dp-reference-group').style.display =
                    ['MYNITA', 'AMANA_TA'].includes(e.target.value) ? 'block' : 'none';
            });

        } catch (error) {
            console.error('Erreur initialisation détails client:', error);
        }
    },

    initClientMap(client) {
        const mapElement = document.getElementById('client-location-map');
        if (!mapElement || !client.latitude || !client.longitude) {
            if (mapElement) mapElement.innerHTML = '<p style="padding:20px;text-align:center;color:var(--text-muted);">Aucune position enregistrée</p>';
            return;
        }
        const center = [client.latitude, client.longitude];
        const map = L.map('client-location-map').setView(center, 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        L.marker(center).addTo(map).bindPopup(`<b>${client.firstName} ${client.lastName}</b>`).openPopup();
    },

    async loadInterventions(clientId) {
        const list = document.getElementById('interventions-list');
        try {
            const response    = await clientService.getClientCollections(clientId);
            const collections = response.data || response;

            if (!collections || collections.length === 0) {
                list.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Aucune intervention</td></tr>';
                return;
            }

            list.innerHTML = collections.map(c => {
                const st = STATUS_LABELS[c.status] || { label: c.status, class: 'status-pending' };
                const serviceName = c.subscription?.service?.nom || 'Collecte';
                
                // Extraire le mois/année de la date planifiée
                const scheduledDate = new Date(c.scheduledAt);
                const monthLabel = scheduledDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                
                return `
                    <tr>
                        <td>${serviceName}</td>
                        <td>${monthLabel}</td>
                        <td>${c.agent?.name || 'N/A'}</td>
                        <td><span class="status-badge ${st.class}">${st.label}</span></td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Erreur chargement interventions:', error);
            list.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Erreur de chargement</td></tr>';
        }
    },

    async loadPayments(clientId) {
        const list = document.getElementById('payments-list');
        try {
            const response = await clientService.getClientPayments(clientId);
            const payments = response.data || response;

            if (!payments || payments.length === 0) {
                list.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Aucun paiement enregistré</td></tr>';
                return;
            }

            list.innerHTML = payments.map(p => `
                <tr>
                    <td><span class="status-badge status-info" style="font-size:11px;">${p.period || '-'}</span></td>
                    <td>${formatDate(p.paymentDate)}</td>
                    <td style="font-weight:600;color:var(--success);">${formatCurrency(p.amount)}</td>
                    <td>${METHOD_LABELS[p.method] || p.method}</td>
                    <td>${p.reference || '-'}</td>
                    <td>
                        <button class="btn-danger btn-sm" data-delete-pay="${p.id}" data-client="${clientId}" style="padding:3px 7px;font-size:11px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            list.querySelectorAll('[data-delete-pay]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Supprimer ce paiement ?')) return;
                    try {
                        await paiementService.deletePayment(btn.dataset.deletePay);
                        await this.loadPayments(btn.dataset.client);
                    } catch { alert('Erreur lors de la suppression'); }
                });
            });

        } catch (error) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--danger);">Erreur de chargement</td></tr>';
        }
    },

    openPaymentModal(clientId) {
        document.getElementById('detail-payment-form')?.reset();
        document.getElementById('dp-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('dp-reference-group').style.display = 'none';
        document.getElementById('detail-payment-modal')?.classList.add('active');
    },

    closePaymentModal() {
        document.getElementById('detail-payment-modal')?.classList.remove('active');
    },

    async savePayment(clientId) {
        const monthVal   = document.getElementById('dp-period-month').value;
        const yearVal    = document.getElementById('dp-period-year').value;
        const monthLabel = new Date(0, parseInt(monthVal)-1).toLocaleString('fr-FR', { month: 'long' });
        const period     = `${monthLabel} ${yearVal}`;

        const data = {
            clientId,
            amount:      parseFloat(document.getElementById('dp-amount').value),
            period,
            paymentDate: document.getElementById('dp-date').value,
            method:      document.getElementById('dp-method').value,
            reference:   document.getElementById('dp-reference').value || null,
            notes:        document.getElementById('dp-notes').value || null,
        };

        const validation = paiementService.validatePaymentData(data);
        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        const btn = document.getElementById('save-detail-payment-btn');
        btn.disabled    = true;
        btn.textContent = 'Enregistrement...';

        try {
            await paiementService.createPayment(data);
            this.closePaymentModal();
            await this.loadPayments(clientId);
        } catch (error) {
            alert('Erreur : ' + (error.message || 'Impossible d\'enregistrer'));
        } finally {
            btn.disabled  = false;
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Enregistrer';
        }
    },
};
