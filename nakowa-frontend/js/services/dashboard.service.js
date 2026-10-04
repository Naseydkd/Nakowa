// Service Dashboard pour Nakowa Assainissement
import { apiService } from './api.js';

class DashboardService {
    constructor() {
        this.baseUrl = '/dashboard';
    }

    // === DONNÉES PRINCIPALES ===
    async getDashboardData(date = null) {
        const url = date ? `${this.baseUrl}?date=${date}` : this.baseUrl;
        return await apiService.get(url);
    }

    async getTodayOverview() {
        return await apiService.get(`${this.baseUrl}/today`);
    }

    // === STATISTIQUES DES COLLECTES ===
    async getTodayCollections() {
        return await apiService.get('/collections/today/stats');
    }

    async getCollectionProgress(date = null) {
        const url = date ? `/collections/progress?date=${date}` : '/collections/progress';
        return await apiService.get(url);
    }

    // === STATISTIQUES DES CLIENTS ===
    async getClientStats() {
        return await apiService.get('/clients/stats');
    }

    async getActiveClientsCount() {
        return await apiService.get('/clients/active/count');
    }

    // === STATISTIQUES DES ABONNEMENTS ===
    async getCurrentMonthSubscriptions() {
        return await apiService.get('/subscriptions/current-month/stats');
    }

    async getSubscriptionStatusDistribution() {
        return await apiService.get('/subscriptions/status-distribution');
    }

    // === STATISTIQUES DES PAIEMENTS ===
    async getCurrentMonthPayments() {
        return await apiService.get('/payments/current-month/stats');
    }

    async getPaymentTrends(days = 7) {
        return await apiService.get(`/payments/trends?days=${days}`);
    }

    async getRevenueStats() {
        return await apiService.get('/payments/revenue-stats');
    }

    // === ALERTES ET NOTIFICATIONS ===
    async getAlerts() {
        return await apiService.get(`${this.baseUrl}/alerts`);
    }

    async getPendingPayments() {
        return await apiService.get('/payments/pending');
    }

    async getPendingCollections() {
        return await apiService.get('/collections/pending');
    }

    async getProblematicCollections() {
        return await apiService.get('/collections/problems');
    }

    async getExpiringSubscriptions(days = 7) {
        return await apiService.get(`/subscriptions/expiring?days=${days}`);
    }

    // === ACTIVITÉ RÉCENTE ===
    async getRecentActivity(limit = 10) {
        return await apiService.get(`${this.baseUrl}/activity?limit=${limit}`);
    }

    async getAgentActivity(agentId = null, date = null) {
        let url = '/activity/agents';
        const params = [];
        
        if (agentId) params.push(`agentId=${agentId}`);
        if (date) params.push(`date=${date}`);
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        return await apiService.get(url);
    }

    // === PERFORMANCE DES AGENTS ===
    async getAgentsPerformance(date = null) {
        const url = date ? `/agents/performance?date=${date}` : '/agents/performance';
        return await apiService.get(url);
    }

    async getTopPerformingAgents(period = 'week') {
        return await apiService.get(`/agents/top-performers?period=${period}`);
    }

    // === ZONES ET COUVERTURE ===
    async getZoneCoverage(date = null) {
        const url = date ? `/zones/coverage?date=${date}` : '/zones/coverage';
        return await apiService.get(url);
    }

    async getZoneStats() {
        return await apiService.get('/zones/stats');
    }

    // === PRÉDICTIONS ET TENDANCES ===
    async getRevenuePrediction(months = 3) {
        return await apiService.get(`${this.baseUrl}/revenue-prediction?months=${months}`);
    }

    async getGrowthTrends(period = 'month') {
        return await apiService.get(`${this.baseUrl}/growth-trends?period=${period}`);
    }

    // === MÉTÉO DES OPÉRATIONS ===
    async getOperationalHealth() {
        return await apiService.get(`${this.baseUrl}/operational-health`);
    }

    // === FORMATAGE DES DONNÉES ===
    formatDashboardData(data) {
        if (!data) return null;

        return {
            ...data,
            collections: this.formatCollectionStats(data.collections),
            payments: this.formatPaymentStats(data.payments),
            alerts: this.formatAlerts(data.alerts),
            recentActivity: this.formatRecentActivity(data.recentActivity)
        };
    }

    formatCollectionStats(collections) {
        if (!collections) return null;

        const total = collections.scheduled || 0;
        const completed = collections.completed || 0;
        const remaining = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            ...collections,
            remaining,
            percentage,
            progressLabel: `${completed} / ${total}`,
            statusColor: this.getProgressColor(percentage)
        };
    }

    formatPaymentStats(payments) {
        if (!payments) return null;

        return {
            ...payments,
            formattedExpected: this.formatCurrency(payments.expected || 0),
            formattedReceived: this.formatCurrency(payments.received || 0),
            formattedRemaining: this.formatCurrency((payments.expected || 0) - (payments.received || 0)),
            collectionRate: payments.expected > 0 ? 
                Math.round((payments.received / payments.expected) * 100) : 0
        };
    }

    formatAlerts(alerts) {
        if (!Array.isArray(alerts)) return [];

        return alerts.map(alert => ({
            ...alert,
            icon: this.getAlertIcon(alert.type),
            color: this.getAlertColor(alert.priority),
            formattedDate: this.formatDate(alert.createdAt)
        }));
    }

    formatRecentActivity(activities) {
        if (!Array.isArray(activities)) return [];

        return activities.map(activity => ({
            ...activity,
            icon: this.getActivityIcon(activity.type),
            formattedDate: this.formatRelativeDate(activity.createdAt),
            displayText: this.getActivityDisplayText(activity)
        }));
    }

    // === UTILITAIRES DE FORMATAGE ===
    formatCurrency(amount) {
        if (amount == null) return '0 FCFA';
        return new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(amount) + ' FCFA';
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatRelativeDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'À l\'instant';
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
        
        return this.formatDate(dateString);
    }

    getProgressColor(percentage) {
        if (percentage >= 90) return 'success';
        if (percentage >= 70) return 'warning';
        return 'danger';
    }

    getAlertIcon(type) {
        const icons = {
            'payment': 'fa-credit-card',
            'collection': 'fa-truck',
            'subscription': 'fa-calendar',
            'client': 'fa-user',
            'system': 'fa-exclamation-triangle'
        };
        return icons[type] || 'fa-bell';
    }

    getAlertColor(priority) {
        const colors = {
            'high': 'danger',
            'medium': 'warning',
            'low': 'info'
        };
        return colors[priority] || 'info';
    }

    getActivityIcon(type) {
        const icons = {
            'collection_completed': 'fa-check-circle',
            'payment_received': 'fa-money-bill',
            'client_created': 'fa-user-plus',
            'subscription_created': 'fa-calendar-plus',
            'problem_reported': 'fa-exclamation-triangle'
        };
        return icons[type] || 'fa-info-circle';
    }

    getActivityDisplayText(activity) {
        const templates = {
            'collection_completed': `${activity.agent?.name || 'Un agent'} a collecté chez ${activity.client?.name || 'un client'}`,
            'payment_received': `Paiement de ${this.formatCurrency(activity.amount)} reçu`,
            'client_created': `Nouveau client : ${activity.client?.name || 'Client'}`,
            'subscription_created': `Nouvel abonnement créé`,
            'problem_reported': `Problème signalé : ${activity.description || 'Problème de collecte'}`
        };
        
        return templates[activity.type] || activity.description || 'Activité';
    }

    // === CALCULS DE KPI ===
    calculateKPIs(data) {
        return {
            collectionEfficiency: this.calculateCollectionEfficiency(data.collections),
            paymentRate: this.calculatePaymentRate(data.payments),
            clientSatisfaction: this.calculateClientSatisfaction(data.collections),
            agentProductivity: this.calculateAgentProductivity(data.agents),
            zoneCoverage: this.calculateZoneCoverage(data.zones)
        };
    }

    calculateCollectionEfficiency(collections) {
        if (!collections || !collections.scheduled) return 0;
        return Math.round((collections.completed / collections.scheduled) * 100);
    }

    calculatePaymentRate(payments) {
        if (!payments || !payments.expected) return 0;
        return Math.round((payments.received / payments.expected) * 100);
    }

    calculateClientSatisfaction(collections) {
        if (!collections || !collections.total) return 0;
        const successful = collections.completed || 0;
        const problems = collections.problems || 0;
        return Math.round(((successful) / (successful + problems)) * 100);
    }

    calculateAgentProductivity(agents) {
        if (!Array.isArray(agents) || agents.length === 0) return 0;
        const totalCompleted = agents.reduce((sum, agent) => sum + (agent.completed || 0), 0);
        const totalScheduled = agents.reduce((sum, agent) => sum + (agent.scheduled || 0), 0);
        return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    }

    calculateZoneCoverage(zones) {
        if (!Array.isArray(zones) || zones.length === 0) return 0;
        const coveredZones = zones.filter(zone => zone.covered).length;
        return Math.round((coveredZones / zones.length) * 100);
    }
}

// Instance singleton
export const dashboardService = new DashboardService();