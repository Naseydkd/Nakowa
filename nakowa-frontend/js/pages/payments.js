import { paiementService } from '../services/paiement.service.js';
import { clientService } from '../services/client.service.js';
import { formatCurrency } from '../core/utils.js';

export const paymentsPage = {
    render() {
        const now = new Date();
        const monthOptions = [...Array(12)].map((_, i) => {
            const label = new Date(0, i).toLocaleString('fr-FR', { month: 'long' });
            return `<option value="${i + 1}" ${i === now.getMonth() ? 'selected' : ''}>${label.charAt(0).toUpperCase() + label.slice(1)}</option>`;
        }).join('');

        return `
            <div class="page-header">
                <div class="page-title">
                    <h1><i class="fa-solid fa-money-bill-wave"></i> Paiements</h1>
                    <div class="page-subtitle">Historique et enregistrement des règlements clients</div>
                </div>
                <button class="btn btn-primary" id="add-payment-btn">
                    <i class="fa-solid fa-plus"></i> Enregistrer un Paiement
                </button>
            </div>

            <!-- Filtres -->
            <div class="chart-card" style="min-height: auto; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
                    <select id="pay-month-filter" class="form-input" style="width: 140px;">${monthOptions}</select>
                    <select id="pay-year-filter" class="form-input" style="width: 100px;">
                        <option value="${now.getFullYear()}" selected>${now.getFullYear()}</option>
                        <option value="${now.getFullYear() - 1}">${now.getFullYear() - 1}</option>
                    </select>
                    <select id="pay-method-filter" class="form-input" style="width: 160px;">
                        <option value="">Toutes les méthodes</option>
                        <option value="ESPECES">Espèces</option>
                        <option value="MYNITA">MyNita</option>
                        <option value="AMANA_TA">AmanaTa</option>
                        <option value="VIREMENT">Virement</option>
                        <option value="AUTRE">Autre</option>
                    </select>
                    <button class="btn btn-outline" id="refresh-payments-btn">
                        <i class="fa-solid fa-rotate"></i> Actualiser
                    </button>
                </div>
            </div>

            <!-- Tableau des paiements -->
            <div class="chart-card" style="min-height: auto;">
                <div id="payments-loading" class="loading-placeholder" style="display:none;">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <p>Chargement...</p>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Mois concerné</th>
                            <th>Montant</th>
                            <th>Date</th>
                            <th>Méthode</th>
                            <th>Référence</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="payments-list">
                        <tr><td colspan="8" style="text-align:center;">Chargement...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Modal Ajouter Paiement -->
            <div class="modal" id="payment-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Enregistrer un Paiement</h3>
                        <button class="modal-close" id="close-payment-modal">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="payment-form">
                            <div class="form-group">
                                <label>Client *</label>
                                <select id="pay-client-id" class="form-input" required>
                                    <option value="">Sélectionnez un client...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Mois concerné *</label>
                                <div style="display:flex;gap:8px;">
                                    <select id="pay-period-month" class="form-input" required>
                                        ${[...Array(12)].map((_, i) => {
                                            const label = new Date(0, i).toLocaleString('fr-FR', { month: 'long' });
                                            const cur   = new Date().getMonth();
                                            return `<option value="${i+1}" ${i===cur?'selected':''}>${label.charAt(0).toUpperCase()+label.slice(1)}</option>`;
                                        }).join('')}
                                    </select>
                                    <select id="pay-period-year" class="form-input" style="width:110px;" required>
                                        <option value="${now.getFullYear()}" selected>${now.getFullYear()}</option>
                                        <option value="${now.getFullYear() - 1}">${now.getFullYear() - 1}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Montant (FCFA) *</label>
                                <input type="number" id="pay-amount" class="form-input" min="1" placeholder="Ex: 5000" required>
                            </div>
                            <div class="form-group">
                                <label>Date du paiement *</label>
                                <input type="date" id="pay-date" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label>Méthode de paiement *</label>
                                <select id="pay-method" class="form-input" required>
                                    <option value="ESPECES">Espèces</option>
                                    <option value="MYNITA">MyNita</option>
                                    <option value="AMANA_TA">AmanaTa</option>
                                    <option value="VIREMENT">Virement</option>
                                    <option value="AUTRE">Autre</option>
                                </select>
                            </div>
                            <div class="form-group" id="pay-reference-group" style="display:none;">
                                <label>Référence *</label>
                                <input type="text" id="pay-reference" class="form-input" placeholder="Numéro de transaction">
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea id="pay-notes" class="form-input" rows="2" placeholder="Remarques optionnelles..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancel-payment-btn">Annuler</button>
                        <button class="btn btn-primary" id="save-payment-btn">
                            <i class="fa-solid fa-save"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    async afterRender() {
        await this.loadPayments();
        await this.loadClientsForSelect();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Filtres
        document.getElementById('pay-month-filter')?.addEventListener('change', () => this.loadPayments());
        document.getElementById('pay-year-filter')?.addEventListener('change', () => this.loadPayments());
        document.getElementById('pay-method-filter')?.addEventListener('change', () => this.loadPayments());
        document.getElementById('refresh-payments-btn')?.addEventListener('click', () => this.loadPayments());

        // Modal
        document.getElementById('add-payment-btn')?.addEventListener('click', () => this.openModal());
        document.getElementById('close-payment-modal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-payment-btn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('save-payment-btn')?.addEventListener('click', () => this.savePayment());

        // Afficher/cacher référence selon la méthode
        document.getElementById('pay-method')?.addEventListener('change', (e) => {
            const refGroup = document.getElementById('pay-reference-group');
            refGroup.style.display = ['MYNITA', 'AMANA_TA'].includes(e.target.value) ? 'block' : 'none';
        });

        // Date par défaut = aujourd'hui
        const dateInput = document.getElementById('pay-date');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    },

    async loadPayments() {
        const list = document.getElementById('payments-list');
        const loading = document.getElementById('payments-loading');
        if (loading) loading.style.display = 'block';

        const filters = {
            month:  document.getElementById('pay-month-filter')?.value,
            year:   document.getElementById('pay-year-filter')?.value,
            method: document.getElementById('pay-method-filter')?.value,
            limit:  100,
        };

        try {
            const response = await paiementService.getPayments(filters);
            const payments = response.data || [];

            if (payments.length === 0) {
                list.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Aucun paiement pour cette période</td></tr>';
                return;
            }

            const methodLabels = { ESPECES: 'Espèces', MYNITA: 'MyNita', AMANA_TA: 'AmanaTa', VIREMENT: 'Virement', AUTRE: 'Autre' };

            list.innerHTML = payments.map(p => `
                <tr>
                    <td style="font-weight:600;">${p.client ? p.client.firstName + ' ' + p.client.lastName : 'N/A'}</td>
                    <td><span class="status-badge status-info" style="font-size:12px;">${p.period || '-'}</span></td>
                    <td style="font-weight:600; color: var(--success);">${formatCurrency(p.amount)}</td>
                    <td>${new Date(p.paymentDate).toLocaleDateString('fr-FR')}</td>
                    <td>${methodLabels[p.method] || p.method}</td>
                    <td>${p.reference || '-'}</td>
                    <td>${p.notes || '-'}</td>
                    <td>
                        <button class="btn-danger btn-sm" data-delete-id="${p.id}" title="Supprimer" style="padding: 4px 8px; font-size: 12px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            // Attacher les événements de suppression
            list.querySelectorAll('[data-delete-id]').forEach(btn => {
                btn.addEventListener('click', () => this.deletePayment(btn.dataset.deleteId));
            });

        } catch (error) {
            console.error('Erreur chargement paiements:', error);
            list.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--danger);">Erreur lors du chargement</td></tr>';
        } finally {
            if (loading) loading.style.display = 'none';
        }
    },

    async loadClientsForSelect() {
        const select = document.getElementById('pay-client-id');
        if (!select) return;
        try {
            const response = await clientService.getClients({ limit: 200 });
            const clients = response.data || [];
            clients.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.firstName} ${c.lastName} — ${c.phone || ''}`;
                select.appendChild(opt);
            });
        } catch (error) {
            console.error('Erreur chargement clients:', error);
        }
    },

    openModal(clientId = null) {
        const modal = document.getElementById('payment-modal');
        document.getElementById('payment-form')?.reset();
        document.getElementById('pay-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('pay-reference-group').style.display = 'none';
        if (clientId) document.getElementById('pay-client-id').value = clientId;
        modal?.classList.add('active');
    },

    closeModal() {
        document.getElementById('payment-modal')?.classList.remove('active');
    },

    async savePayment() {
        const monthVal = document.getElementById('pay-period-month').value;
        const yearVal  = document.getElementById('pay-period-year').value;
        const monthLabel = new Date(0, parseInt(monthVal)-1).toLocaleString('fr-FR', { month: 'long' });
        const period = `${monthLabel} ${yearVal}`;

        const data = {
            clientId:    document.getElementById('pay-client-id').value,
            amount:      parseFloat(document.getElementById('pay-amount').value),
            period,
            paymentDate: document.getElementById('pay-date').value,
            method:      document.getElementById('pay-method').value,
            reference:   document.getElementById('pay-reference').value || null,
            notes:        document.getElementById('pay-notes').value || null,
        };

        const validation = paiementService.validatePaymentData(data);
        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        const btn = document.getElementById('save-payment-btn');
        btn.disabled = true;
        btn.textContent = 'Enregistrement...';

        try {
            await paiementService.createPayment(data);
            this.closeModal();
            await this.loadPayments();
        } catch (error) {
            alert('Erreur : ' + (error.message || 'Impossible d\'enregistrer le paiement'));
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Enregistrer';
        }
    },

    async deletePayment(id) {
        if (!confirm('Supprimer ce paiement ?')) return;
        try {
            await paiementService.deletePayment(id);
            await this.loadPayments();
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    },
};

// Export pour compatibilité avec le routeur
export function renderPaymentsPage() {
    return paymentsPage.render();
}
