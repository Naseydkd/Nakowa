import { formatCurrency } from '../core/utils.js';
import { apiService } from '../services/api.js';
import { authService } from '../services/auth.js';

export const dashboardPage = {
    async render() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>Tableau de Bord</h1>
                    <div class="page-subtitle">Vue d'ensemble de l'activité Nakowa</div>
                </div>
                <div class="page-controls" style="display: flex; gap: 10px; align-items: center;">
                    <button class="btn btn-outline" id="refresh-dash">
                        <i class="fa-solid fa-rotate"></i> Actualiser
                    </button>
                </div>
            </div>

            <div id="dashboard-loading" class="loading-placeholder" style="display: none;">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Chargement des statistiques...</p>
            </div>

            <div id="dashboard-content" style="display: none;">
                <div class="dashboard-stats-layout">
                    <!-- Carte Finance à gauche (réservée aux ADMIN) -->
                    <div class="finance-card" data-role="admin">
                        <h3 style="margin-bottom: 25px; font-size: 18px; color: var(--text-primary);">
                            <i class="fa-solid fa-money-bill-wave" style="color: #006d44; margin-right: 8px;"></i>
                            Finances Globales
                        </h3>
                        
                        <div class="finance-stat-item">
                            <div class="finance-label">Total Abonnements</div>
                            <div class="finance-value" id="stat-finance-total" style="color: #006d44;">--</div>
                        </div>
                        
                        <div class="finance-stat-item">
                            <div class="finance-label">Montant Encaissé</div>
                            <div class="finance-value" id="stat-finance-paid" style="color: #28a745;">--</div>
                        </div>
                        
                        <div class="finance-stat-item">
                            <div class="finance-label">Reste à Encaisser</div>
                            <div class="finance-value" id="stat-finance-remaining" style="color: #dc3545;">--</div>
                        </div>
                    </div>

                    <!-- Grille des autres stats à droite -->
                    <div class="stats-grid-right">
                        <!-- Total Clients -->
                        <div class="stat-card">
                            <div class="stat-icon" style="color: #006d44;"><i class="fa-solid fa-users"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="stat-clients-total">--</div>
                                <div class="stat-label">Total Clients</div>
                            </div>
                        </div>

                        <!-- Tâches Terminées -->
                        <div class="stat-card">
                            <div class="stat-icon" style="color: #28a745;"><i class="fa-solid fa-check-circle"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="stat-int-completed">--</div>
                                <div class="stat-label">Collectes Terminées</div>
                            </div>
                        </div>

                        <!-- Tâches Prévues -->
                        <div class="stat-card">
                            <div class="stat-icon" style="color: #17a2b8;"><i class="fa-solid fa-calendar-days"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="stat-int-planned">--</div>
                                <div class="stat-label">Collectes Prévues</div>
                            </div>
                        </div>

                        <!-- Tâches En attente -->
                        <div class="stat-card">
                            <div class="stat-icon" style="color: #ffc107;"><i class="fa-solid fa-clock"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="stat-int-pending">--</div>
                                <div class="stat-label">Collectes En Attente</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-main-grid">
                    <div class="chart-card">
                        <h3 style="margin-bottom: 20px;">Dernières Interventions</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody id="recent-interventions">
                                <tr><td colspan="4" style="text-align: center;">Chargement...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 25px;">
                        <div class="chart-card">
                            <h3>Répartition Financière</h3>
                            <canvas id="financeChart" style="max-height: 200px;"></canvas>
                        </div>
                        <div class="upgrade-card">
                            <h3>Besoin d'aide ?</h3>
                            <p>Consultez la documentation ou contactez l'administrateur pour toute question sur le système.</p>
                            <a href="#help" class="btn-upgrade">Aller à l'aide</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    async init() {
        // Appliquer les permissions d'abord (avant de charger les données)
        this.applyRoleBasedPermissions();
        
        // Puis charger les données
        await this.loadDashboardData();
        document.getElementById('refresh-dash')?.addEventListener('click', () => this.loadDashboardData());
    },
    
    applyRoleBasedPermissions() {
        // Appliquer le contrôle d'accès basé sur le rôle
        const user = this.getCurrentUser();
        const userRole = user?.role;
        
        console.log('🔐 Applying role-based permissions. Role:', userRole);
        
        const adminOnlyElements = document.querySelectorAll('[data-role="admin"]');
        console.log('Found admin-only elements:', adminOnlyElements.length);
        
        adminOnlyElements.forEach(el => {
            const shouldShow = userRole === 'ADMIN';
            el.style.display = shouldShow ? 'block' : 'none';
            console.log('Element visibility:', shouldShow ? 'SHOWN' : 'HIDDEN');
        });
        
        // Adapter le layout si Finance Card est masquée
        if (userRole !== 'ADMIN') {
            const statsLayout = document.querySelector('.dashboard-stats-layout');
            if (statsLayout) {
                statsLayout.style.gridTemplateColumns = '1fr';
                console.log('Layout adjusted to single column');
            }
        }
        
        console.log(`✅ Permissions appliquées pour le rôle: ${userRole}`);
    },
    
    getCurrentUser() {
        return authService.getCurrentUser();
    },
    async loadDashboardData() {
        const loading = document.getElementById('dashboard-loading');
        const content = document.getElementById('dashboard-content');

        if (loading) loading.style.display = 'block';
        if (content) content.style.display = 'none';

        try {
            const stats = await apiService.get(`/dashboard`);

            // Clients
            document.getElementById('stat-clients-total').textContent = stats.clients.total;

            // Finance
            document.getElementById('stat-finance-total').textContent = formatCurrency(stats.finance.total);
            document.getElementById('stat-finance-paid').textContent = formatCurrency(stats.finance.paid);
            document.getElementById('stat-finance-remaining').textContent = formatCurrency(stats.finance.remaining);

            // Interventions (Vidange)
            document.getElementById('stat-int-completed').textContent = stats.interventions.completed;
            document.getElementById('stat-int-pending').textContent = stats.interventions.pending;
            document.getElementById('stat-int-planned').textContent = stats.interventions.planned;

            this.initFinanceChart(stats.finance);
            await this.loadRecentInterventions();

        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        } finally {
            if (loading) loading.style.display = 'none';
            if (content) content.style.display = 'block';
        }
    },
    async loadRecentInterventions() {
        const list = document.getElementById('recent-interventions');
        try {
            const response = await apiService.get('/collections?limit=50');
            const collections = response.data || [];

            if (collections.length === 0) {
                list.innerHTML = '<tr><td colspan="4" style="text-align: center;">Aucune donnée disponible</td></tr>';
                return;
            }

            // Grouper par subscription pour afficher une ligne par tâche
            const grouped = {};
            collections.forEach(c => {
                if (!grouped[c.subscriptionId]) {
                    grouped[c.subscriptionId] = {
                        client: c.client,
                        subscription: c.subscription,
                        passages: [],
                        lastActivity: c.scheduledAt
                    };
                }
                grouped[c.subscriptionId].passages.push(c);
                // Garder la date la plus récente
                if (new Date(c.scheduledAt) > new Date(grouped[c.subscriptionId].lastActivity)) {
                    grouped[c.subscriptionId].lastActivity = c.scheduledAt;
                }
            });

            const statusLabels = {
                'COLLECTED': { label: 'Terminé', class: 'status-done' },
                'SCHEDULED': { label: 'Planifié', class: 'status-pending' },
                'ABSENT':    { label: 'Absent', class: 'status-cancelled' },
                'NO_WASTE':  { label: 'Poubelle absente', class: 'status-cancelled' },
                'ACCESS_DENIED': { label: 'Accès refusé', class: 'status-cancelled' },
                'REFUSED':   { label: 'Refusé', class: 'status-cancelled' },
                'OTHER':     { label: 'Autre problème', class: 'status-cancelled' },
            };

            const tasks = Object.values(grouped).slice(0, 8);

            list.innerHTML = tasks.map(group => {
                const totalPassages = group.subscription?.service?.passages || 2;
                const collectedCount = group.passages.filter(p => p.status === 'COLLECTED').length;
                const hasScheduled = group.passages.some(p => p.status === 'SCHEDULED');
                const hasProblem = group.passages.some(p => 
                    p.status !== 'COLLECTED' && p.status !== 'SCHEDULED'
                );

                // Statut global de la tâche
                let globalStatus;
                if (collectedCount >= totalPassages) {
                    globalStatus = { label: '✓ Terminé', class: 'status-done' };
                } else if (hasProblem && !hasScheduled) {
                    globalStatus = { label: '⚠ Problème', class: 'status-cancelled' };
                } else if (hasProblem) {
                    globalStatus = { label: '⚠ Partiel', class: 'status-pending' };
                } else {
                    globalStatus = { label: `${collectedCount}/${totalPassages} passages`, class: 'status-pending' };
                }

                const clientName = group.client 
                    ? `${group.client.firstName} ${group.client.lastName}`
                    : 'Client inconnu';
                const serviceName = group.subscription?.service?.nom || 'Collecte';

                return `
                    <tr>
                        <td style="font-weight: 600;">${clientName}</td>
                        <td>${serviceName}</td>
                        <td>${new Date(group.lastActivity).toLocaleDateString('fr-FR')}</td>
                        <td><span class="status-badge ${globalStatus.class}">${globalStatus.label}</span></td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            list.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--danger);">Erreur chargement</td></tr>';
        }
    },
    initFinanceChart(finance) {
        const ctx = document.getElementById('financeChart')?.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Payé', 'Restant'],
                    datasets: [{
                        data: [finance.paid, finance.remaining],
                        backgroundColor: ['#006d44', '#dc3545'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } },
                    cutout: '70%'
                }
            });
        }
    }
};
