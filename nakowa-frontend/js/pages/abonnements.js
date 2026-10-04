import { api } from '../core/api.js';
import { formatCurrency } from '../core/utils.js';
import { authService } from '../services/auth.js';

const PAYMENT_STATUS = {
    PAYE:    { label: '✓ Payé',    class: 'status-done',      color: 'var(--success)' },
    PARTIEL: { label: '⚡ Partiel', class: 'status-pending',   color: '#f59e0b' },
    NON_PAYE:{ label: '✗ Impayé',  class: 'status-cancelled', color: 'var(--danger)' },
};

const COLLECTE_STATUS = {
    TERMINE:  { label: 'Terminé',   class: 'status-done' },
    EN_COURS: { label: 'En cours',  class: 'status-pending' },
    PLANIFIE: { label: 'Planifié',  class: 'status-info' },
};

export const abonnementsPage = {
    async render() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>Abonnements Mensuels</h1>
                    <div class="page-subtitle">Gestion des périodes d'abonnement et recouvrement</div>
                </div>
                <div class="page-controls" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                    <div style="display:flex;gap:5px;align-items:center;">
                        <select id="sub-month-filter" class="form-input" style="width:130px;padding:5px;">
                            ${[...Array(12)].map((_, i) => {
                                const label = new Date(0, i).toLocaleString('fr-FR', { month: 'long' });
                                const cur   = new Date().getMonth();
                                return `<option value="${i+1}" ${i===cur?'selected':''}>${label.charAt(0).toUpperCase()+label.slice(1)}</option>`;
                            }).join('')}
                        </select>
                        <input type="number" id="sub-year-filter" class="form-input" style="width:100px;padding:5px;" min="1900" max="2100" value="${new Date().getFullYear()}">
                    </div>
                    <button class="btn btn-danger" id="reset-month-btn">
                        <i class="fa-solid fa-trash-can"></i> Réinitialiser
                    </button>
                    <button class="btn btn-primary" id="generate-month-btn">
                        <i class="fa-solid fa-calendar-plus"></i> Préparer ce mois
                    </button>
                </div>
            </div>

            <div id="sub-loading" class="loading-placeholder" style="display:none;">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Chargement des abonnements...</p>
            </div>

            <div id="sub-content" style="display:none;">
                <!-- Cards statistiques -->
                <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
                    <div class="stat-card">
                        <div class="stat-icon" style="color:#006d44;background:var(--primary-light);">
                            <i class="fa-solid fa-file-invoice"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="stat-sub-total">--</div>
                            <div class="stat-label">Total abonnements</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="color:var(--success);background:#d4edda;">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="stat-sub-paid" style="color:var(--success);">--</div>
                            <div class="stat-label">Payés</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="color:#f59e0b;background:#fff3cd;">
                            <i class="fa-solid fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="stat-sub-partial" style="color:#f59e0b;">--</div>
                            <div class="stat-label">Paiements partiels</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="color:var(--danger);background:#f8d7da;">
                            <i class="fa-solid fa-circle-exclamation"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value" id="stat-sub-unpaid" style="color:var(--danger);">--</div>
                            <div class="stat-label">Impayés</div>
                        </div>
                    </div>
                </div>

                <!-- Barre de recouvrement -->
                <div class="chart-card" style="min-height:auto;padding:20px;margin-bottom:20px;" data-role="admin">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <span style="font-weight:600;color:var(--text-main);">Taux de recouvrement</span>
                        <span id="recovery-label" style="font-weight:700;color:var(--primary-color);">0%</span>
                    </div>
                    <div style="background:#e9ecef;border-radius:8px;height:12px;overflow:hidden;">
                        <div id="recovery-bar" style="height:100%;background:linear-gradient(90deg,#006d44,#00875a);border-radius:8px;transition:width 0.5s ease;width:0%;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px;color:var(--text-muted);">
                        <span>Encaissé : <strong id="recovery-paid">--</strong></span>
                        <span>Attendu : <strong id="recovery-total">--</strong></span>
                        <span>Restant : <strong id="recovery-remaining" style="color:var(--danger);">--</strong></span>
                    </div>
                </div>

                <!-- Tableau -->
                <div class="chart-card" style="min-height:auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Zone</th>
                                <th>Service</th>
                                <th>Collectes</th>
                                <th>Montant</th>
                                <th>Payé</th>
                                <th>Reste</th>
                                <th>Paiement</th>
                            </tr>
                        </thead>
                        <tbody id="subscriptions-list">
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    async init() {
        // Apply role-based permissions first
        this.applyRoleBasedPermissions();
        
        await this.loadSubscriptions();

        document.getElementById('sub-month-filter')?.addEventListener('change', () => this.loadSubscriptions());
        document.getElementById('sub-year-filter')?.addEventListener('change', () => this.loadSubscriptions());
        document.getElementById('sub-year-filter')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadSubscriptions();
        });

        document.getElementById('generate-month-btn')?.addEventListener('click', async () => {
            const month = document.getElementById('sub-month-filter')?.value;
            const year  = document.getElementById('sub-year-filter')?.value;
            const monthLabel = new Date(0, parseInt(month)-1).toLocaleString('fr-FR', { month: 'long' });

            if (confirm(`Préparer les abonnements et collectes pour ${monthLabel} ${year} ?`)) {
                try {
                    const btn = document.getElementById('generate-month-btn');
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Préparation...';
                    await api.post(`/subscriptions/prepare-month?month=${month}&year=${year}`, {});
                    await this.loadSubscriptions();
                } catch (error) {
                    alert('Erreur : ' + error.message);
                } finally {
                    const btn = document.getElementById('generate-month-btn');
                    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-calendar-plus"></i> Préparer ce mois'; }
                }
            }
        });

        document.getElementById('reset-month-btn')?.addEventListener('click', async () => {
            const month = document.getElementById('sub-month-filter')?.value;
            const year  = document.getElementById('sub-year-filter')?.value;
            if (confirm(`ATTENTION : Supprimer définitivement les données de ${month}/${year} ?`)) {
                try {
                    await api.delete(`/subscriptions/reset?month=${month}&year=${year}`);
                    await this.loadSubscriptions();
                } catch (error) {
                    alert('Erreur : ' + error.message);
                }
            }
        });
    },

    applyRoleBasedPermissions() {
        const user = authService.getCurrentUser();
        const userRole = user?.role;
        
        const adminOnlyElements = document.querySelectorAll('[data-role="admin"]');
        adminOnlyElements.forEach(el => {
            el.style.display = userRole === 'ADMIN' ? 'block' : 'none';
        });
        
        console.log(`🔐 Abonnements: Permissions appliquées pour le rôle: ${userRole}`);
    },

    async loadSubscriptions() {
        const loading = document.getElementById('sub-loading');
        const content = document.getElementById('sub-content');
        const month   = document.getElementById('sub-month-filter')?.value;
        const year    = document.getElementById('sub-year-filter')?.value;

        if (loading) loading.style.display = 'block';
        if (content) content.style.display = 'none';

        try {
            const data = await api.get(`/subscriptions?month=${month}&year=${year}`) || [];

            // Calculer les stats
            const stats = {
                total:   data.length,
                paid:    data.filter(s => s.paymentStatus === 'PAYE').length,
                partial: data.filter(s => s.paymentStatus === 'PARTIEL').length,
                unpaid:  data.filter(s => s.paymentStatus === 'NON_PAYE').length,
                totalAmount: data.reduce((sum, s) => sum + (s.amount || 0), 0),
                paidAmount:  data.reduce((sum, s) => sum + (s.paidAmount || 0), 0),
            };
            stats.remaining = Math.max(0, stats.totalAmount - stats.paidAmount);
            const rate = stats.totalAmount > 0 ? Math.round((stats.paidAmount / stats.totalAmount) * 100) : 0;

            // Mettre à jour les cards
            document.getElementById('stat-sub-total').textContent   = stats.total;
            document.getElementById('stat-sub-paid').textContent    = stats.paid;
            document.getElementById('stat-sub-partial').textContent = stats.partial;
            document.getElementById('stat-sub-unpaid').textContent  = stats.unpaid;

            // Barre de recouvrement
            document.getElementById('recovery-bar').style.width  = `${rate}%`;
            document.getElementById('recovery-label').textContent = `${rate}%`;
            document.getElementById('recovery-paid').textContent  = formatCurrency(stats.paidAmount);
            document.getElementById('recovery-total').textContent = formatCurrency(stats.totalAmount);
            document.getElementById('recovery-remaining').textContent = formatCurrency(stats.remaining);

            // Tableau
            const list = document.getElementById('subscriptions-list');

            if (data.length === 0) {
                list.innerHTML = `
                    <tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted);">
                        <i class="fa-solid fa-inbox" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.4;"></i>
                        Aucun abonnement pour cette période.<br>
                        <small>Cliquez sur "Préparer ce mois" pour générer les abonnements.</small>
                    </td></tr>`;
                return;
            }

            list.innerHTML = data.map(s => {
                const ps  = PAYMENT_STATUS[s.paymentStatus]   || PAYMENT_STATUS.NON_PAYE;
                const cs  = COLLECTE_STATUS[s.collecteStatus] || COLLECTE_STATUS.PLANIFIE;
                const remaining = Math.max(0, s.amount - (s.paidAmount || 0));
                
                // Couleur de fond selon statut de paiement
                let rowStyle = '';
                if (s.paymentStatus === 'NON_PAYE') {
                    rowStyle = 'style="background-color:#fff5f5;border-left:4px solid var(--danger);"';
                } else if (s.paymentStatus === 'PARTIEL') {
                    rowStyle = 'style="background-color:#fffaf0;border-left:4px solid #f59e0b;"';
                }

                // Barre progression collectes
                const collecteBar = `
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span style="font-size:12px;color:var(--text-muted);">${s.collectedCount||0}/${s.totalPassages||2}</span>
                        <div style="flex:1;background:#e9ecef;border-radius:4px;height:6px;min-width:50px;">
                            <div style="width:${Math.round(((s.collectedCount||0)/(s.totalPassages||2))*100)}%;height:100%;background:var(--success);border-radius:4px;"></div>
                        </div>
                        <span class="status-badge ${cs.class}" style="font-size:10px;padding:2px 6px;">${cs.label}</span>
                    </div>`;

                return `
                    <tr ${rowStyle}>
                        <td>
                            <div style="font-weight:600;">${s.client.firstName} ${s.client.lastName}</div>
                            <div style="font-size:12px;color:var(--text-muted);">${s.client.phone||''}</div>
                        </td>
                        <td>${s.client.zone || s.client.city || '-'}</td>
                        <td style="font-size:13px;">${s.service?.nom || 'Collecte'}</td>
                        <td>${collecteBar}</td>
                        <td style="font-weight:600;">${formatCurrency(s.amount)}</td>
                        <td style="color:var(--success);font-weight:600;">${formatCurrency(s.paidAmount||0)}</td>
                        <td style="color:${remaining>0?'var(--danger)':'var(--success)'};font-weight:600;">
                            ${remaining > 0 ? formatCurrency(remaining) : '✓ Soldé'}
                        </td>
                        <td><span class="status-badge ${ps.class}">${ps.label}</span></td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            console.error('Erreur abonnements:', error);
        } finally {
            if (loading) loading.style.display = 'none';
            if (content) content.style.display = 'block';
        }
    }
};
