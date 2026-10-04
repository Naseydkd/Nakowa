// Service Abonnement pour Nakowa Assainissement
import { apiService } from './api.js';

class AbonnementService {
    constructor() {
        this.baseUrl = '/subscriptions';
    }

    // === GESTION DES ABONNEMENTS ===
    async getSubscriptions(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.month) queryParams.append('month', filters.month);
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.zone) queryParams.append('zone', filters.zone);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);
        
        const url = queryParams.toString() ? `${this.baseUrl}?${queryParams.toString()}` : this.baseUrl;
        return await apiService.get(url);
    }

    async getCurrentMonthSubscriptions() {
        const now = new Date();
        return await this.getSubscriptions({
            month: now.getMonth() + 1,
            year: now.getFullYear()
        });
    }

    async getSubscription(id) {
        return await apiService.get(`${this.baseUrl}/${id}`);
    }

    async createSubscription(subscriptionData) {
        return await apiService.post(`${this.baseUrl}/create`, subscriptionData);
    }

    async updateSubscription(id, subscriptionData) {
        return await apiService.patch(`${this.baseUrl}/${id}`, subscriptionData);
    }

    // === GÉNÉRATION MENSUELLE ===
    async generateNextMonth(month, year) {
        return await apiService.post(`${this.baseUrl}/generate-month`, {
            month,
            year
        });
    }

    async previewNextMonth(month, year) {
        return await apiService.get(`${this.baseUrl}/preview-month?month=${month}&year=${year}`);
    }

    // === STATISTIQUES ===
    async getMonthStats(month, year) {
        return await apiService.get(`${this.baseUrl}/stats?month=${month}&year=${year}`);
    }

    async getCurrentMonthStats() {
        const now = new Date();
        return await this.getMonthStats(now.getMonth() + 1, now.getFullYear());
    }

    async getPaymentStats(month, year) {
        return await apiService.get(`${this.baseUrl}/payment-stats?month=${month}&year=${year}`);
    }

    // === PRIX ET TARIFS ===
    async getSubscriptionPrices() {
        return await apiService.get('/subscription-prices');
    }

    async updateSubscriptionPrice(priceData) {
        return await apiService.post('/subscription-prices', priceData);
    }

    // === VALIDATION ===
    validateSubscriptionData(subscriptionData) {
        const errors = [];
        
        if (!subscriptionData.clientId) {
            errors.push('Le client est obligatoire');
        }
        
        if (!subscriptionData.amount || subscriptionData.amount <= 0) {
            errors.push('Le montant doit être supérieur à 0');
        }
        
        if (!subscriptionData.frequency || ![1, 2].includes(subscriptionData.frequency)) {
            errors.push('La fréquence doit être 1 ou 2 collectes par mois');
        }
        
        if (!subscriptionData.startDate) {
            errors.push('La date de début est obligatoire');
        }
        
        if (!subscriptionData.zone?.trim()) {
            errors.push('La zone est obligatoire');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // === FORMATAGE ===
    formatSubscriptionForDisplay(subscription) {
        return {
            ...subscription,
            formattedAmount: this.formatCurrency(subscription.amount),
            formattedPaidAmount: this.formatCurrency(subscription.paidAmount || 0),
            formattedRemaining: this.formatCurrency((subscription.amount || 0) - (subscription.paidAmount || 0)),
            paymentStatusBadge: this.getPaymentStatusBadge(subscription),
            frequencyLabel: this.getFrequencyLabel(subscription.frequency),
            periodLabel: this.getPeriodLabel(subscription.month, subscription.year)
        };
    }

    formatCurrency(amount) {
        if (amount == null) return '0 FCFA';
        return new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(amount) + ' FCFA';
    }

    getPaymentStatusBadge(subscription) {
        const amount = subscription.amount || 0;
        const paid = subscription.paidAmount || 0;
        
        if (paid >= amount) {
            return { text: 'Payé', class: 'badge-success' };
        } else if (paid > 0) {
            return { text: 'Partiel', class: 'badge-warning' };
        } else {
            return { text: 'Non payé', class: 'badge-danger' };
        }
    }

    getFrequencyLabel(frequency) {
        switch (frequency) {
            case 1: return '1 collecte / mois';
            case 2: return '2 collectes / mois';
            default: return `${frequency} collectes / mois`;
        }
    }

    getPeriodLabel(month, year) {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return `${months[month - 1]} ${year}`;
    }

    // === CALCULS ===
    calculateRemaining(subscription) {
        const amount = subscription.amount || 0;
        const paid = subscription.paidAmount || 0;
        return Math.max(0, amount - paid);
    }

    calculatePaymentPercentage(subscription) {
        const amount = subscription.amount || 0;
        const paid = subscription.paidAmount || 0;
        
        if (amount === 0) return 0;
        return Math.min(100, (paid / amount) * 100);
    }

    // === PRÉDICTIONS ===
    async predictNextMonthRevenue() {
        const now = new Date();
        const nextMonth = now.getMonth() + 2; // +1 pour index, +1 pour mois suivant
        const year = nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear();
        const month = nextMonth > 12 ? 1 : nextMonth;
        
        return await apiService.get(`${this.baseUrl}/predict-revenue?month=${month}&year=${year}`);
    }

    // === EXPIRATION ET RENOUVELLEMENT ===
    async getExpiringSubscriptions(days = 7) {
        return await apiService.get(`${this.baseUrl}/expiring?days=${days}`);
    }

    async renewSubscription(subscriptionId) {
        return await apiService.post(`${this.baseUrl}/${subscriptionId}/renew`);
    }

    async bulkRenewSubscriptions(subscriptionIds) {
        return await apiService.post(`${this.baseUrl}/bulk-renew`, {
            subscriptionIds
        });
    }

    // === ZONES ET TARIFICATION ===
    getZonePricing() {
        return [
            { zone: 'Yantala', basePrice: 5000 },
            { zone: 'Plateau', basePrice: 6000 },
            { zone: 'Koira Kano', basePrice: 5000 },
            { zone: 'Koira Tegui', basePrice: 5000 },
            { zone: 'Nouveau Marché', basePrice: 5500 },
            { zone: 'Terminus', basePrice: 4500 }
        ];
    }

    getRecommendedPrice(zone, frequency) {
        const zonePricing = this.getZonePricing().find(z => z.zone === zone);
        const basePrice = zonePricing ? zonePricing.basePrice : 5000;
        
        // Réduction pour 1 seule collecte
        if (frequency === 1) {
            return Math.round(basePrice * 0.7);
        }
        
        return basePrice;
    }

    // === RAPPORTS ===
    async generateMonthlyReport(month, year) {
        return await apiService.get(`${this.baseUrl}/reports/monthly?month=${month}&year=${year}`);
    }

    async exportSubscriptions(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        return await apiService.get(`${this.baseUrl}/export?${queryParams.toString()}`);
    }
}

// Instance singleton
export const abonnementService = new AbonnementService();
