// Service Paiement pour Nakowa Assainissement
import { apiService } from './api.js';

class PaiementService {
    constructor() {
        this.baseUrl = '/payments';
    }

    // === GESTION DES PAIEMENTS ===
    async getPayments(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.month) queryParams.append('month', filters.month);
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.client) queryParams.append('client', filters.client);
        if (filters.method) queryParams.append('method', filters.method);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);
        
        const url = queryParams.toString() ? `${this.baseUrl}?${queryParams.toString()}` : this.baseUrl;
        return await apiService.get(url);
    }

    async getPayment(id) {
        return await apiService.get(`${this.baseUrl}/${id}`);
    }

    async createPayment(paymentData) {
        return await apiService.post(this.baseUrl, paymentData);
    }

    async updatePayment(id, paymentData) {
        return await apiService.patch(`${this.baseUrl}/${id}`, paymentData);
    }

    async deletePayment(id) {
        return await apiService.delete(`${this.baseUrl}/${id}`);
    }

    // === PAIEMENTS PAR CLIENT ===
    async getClientPayments(clientId, filters = {}) {
        const queryParams = new URLSearchParams(filters);
        const url = queryParams.toString() ? 
            `/clients/${clientId}/payments?${queryParams.toString()}` : 
            `/clients/${clientId}/payments`;
        
        return await apiService.get(url);
    }

    // === STATISTIQUES ===
    async getPaymentStats(month, year) {
        return await apiService.get(`${this.baseUrl}/stats?month=${month}&year=${year}`);
    }

    async getCurrentMonthStats() {
        const now = new Date();
        return await this.getPaymentStats(now.getMonth() + 1, now.getFullYear());
    }

    async getDailyPayments(date = null) {
        const url = date ? `${this.baseUrl}/daily?date=${date}` : `${this.baseUrl}/daily`;
        return await apiService.get(url);
    }

    async getPaymentsByMethod(month, year) {
        return await apiService.get(`${this.baseUrl}/by-method?month=${month}&year=${year}`);
    }

    // === MÉTHODES DE PAIEMENT ===
    getPaymentMethods() {
        return [
            { value: 'ESPECES',  label: 'Espèces',   icon: 'fa-money-bill' },
            { value: 'MYNITA',   label: 'MyNita',    icon: 'fa-mobile-alt' },
            { value: 'AMANA_TA', label: 'AmanaTa',   icon: 'fa-mobile-alt' },
            { value: 'VIREMENT', label: 'Virement',  icon: 'fa-university' },
            { value: 'AUTRE',    label: 'Autre',     icon: 'fa-question-circle' }
        ];
    }

    getPaymentStatuses() {
        return [
            { value: 'COMPLETED', label: 'Confirmé', class: 'badge-success' },
            { value: 'PENDING', label: 'En attente', class: 'badge-warning' },
            { value: 'FAILED', label: 'Échec', class: 'badge-danger' },
            { value: 'CANCELLED', label: 'Annulé', class: 'badge-secondary' }
        ];
    }

    // === VALIDATION ===
    validatePaymentData(paymentData) {
        const errors = [];
        
        if (!paymentData.clientId) {
            errors.push('Le client est obligatoire');
        }
        if (!paymentData.amount || paymentData.amount <= 0) {
            errors.push('Le montant doit être supérieur à 0');
        }
        if (!paymentData.method) {
            errors.push('La méthode de paiement est obligatoire');
        }
        if (!paymentData.paymentDate) {
            errors.push('La date de paiement est obligatoire');
        }
        // Référence obligatoire pour MyNita et AmanaTa
        if (['MYNITA', 'AMANA_TA'].includes(paymentData.method) && !paymentData.reference?.trim()) {
            errors.push('La référence de transaction est obligatoire pour MyNita et AmanaTa');
        }
        
        return { isValid: errors.length === 0, errors };
    }

    // === FORMATAGE ===
    formatPaymentForDisplay(payment) {
        const method = this.getPaymentMethods().find(m => m.value === payment.method);
        const status = this.getPaymentStatuses().find(s => s.value === payment.status);
        
        return {
            ...payment,
            formattedAmount: this.formatCurrency(payment.amount),
            methodLabel: method ? method.label : payment.method,
            methodIcon: method ? method.icon : 'fa-question-circle',
            statusBadge: status || { value: payment.status, label: payment.status, class: 'badge-secondary' },
            formattedDate: this.formatDate(payment.paymentDate),
            clientName: payment.client ? `${payment.client.firstName} ${payment.client.lastName}` : 'Client inconnu'
        };
    }

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

    // === RECHERCHE ET SUGGESTIONS ===
    async searchClients(query) {
        return await apiService.get(`/clients/search?q=${encodeURIComponent(query)}`);
    }

    async getClientPendingPayments(clientId) {
        return await apiService.get(`/clients/${clientId}/pending-payments`);
    }

    async calculatePaymentSuggestion(clientId, subscriptionId) {
        return await apiService.get(`${this.baseUrl}/suggest/${clientId}/${subscriptionId}`);
    }

    // === RÉCONCILIATION ===
    async reconcilePayments(date) {
        return await apiService.post(`${this.baseUrl}/reconcile`, { date });
    }

    async getPendingReconciliation() {
        return await apiService.get(`${this.baseUrl}/pending-reconciliation`);
    }

    // === EXPORTS ET RAPPORTS ===
    async exportPayments(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        return await apiService.get(`${this.baseUrl}/export?${queryParams.toString()}`);
    }

    async generatePaymentReport(month, year) {
        return await apiService.get(`${this.baseUrl}/reports/monthly?month=${month}&year=${year}`);
    }

    async generateReceiptData(paymentId) {
        return await apiService.get(`${this.baseUrl}/${paymentId}/receipt`);
    }

    // === REMBOURSEMENTS ===
    async createRefund(paymentId, refundData) {
        return await apiService.post(`${this.baseUrl}/${paymentId}/refund`, refundData);
    }

    async getRefunds(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        return await apiService.get(`${this.baseUrl}/refunds?${queryParams.toString()}`);
    }

    // === NOTIFICATIONS ===
    async getOverduePayments(days = 30) {
        return await apiService.get(`${this.baseUrl}/overdue?days=${days}`);
    }

    async sendPaymentReminder(clientId, subscriptionId) {
        return await apiService.post(`${this.baseUrl}/remind`, {
            clientId,
            subscriptionId
        });
    }

    // === CALCULS ===
    calculateTotalRevenue(payments) {
        return payments
            .filter(p => p.status === 'COMPLETED')
            .reduce((total, payment) => total + (payment.amount || 0), 0);
    }

    calculateMethodDistribution(payments) {
        const methods = {};
        
        payments.forEach(payment => {
            if (payment.status === 'COMPLETED') {
                methods[payment.method] = (methods[payment.method] || 0) + payment.amount;
            }
        });
        
        return methods;
    }

    calculateDailyTrend(payments, days = 30) {
        const trend = {};
        const endDate = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(endDate);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            trend[dateKey] = 0;
        }
        
        payments.forEach(payment => {
            if (payment.status === 'COMPLETED') {
                const dateKey = payment.paymentDate.split('T')[0];
                if (trend.hasOwnProperty(dateKey)) {
                    trend[dateKey] += payment.amount;
                }
            }
        });
        
        return trend;
    }

    // === UTILITAIRES ===
    generateReference(method) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        switch (method) {
            case 'MOBILE_MONEY':
                return `MM${timestamp.slice(-6)}${random.slice(0, 3)}`;
            case 'BANK_TRANSFER':
                return `VIR${timestamp.slice(-6)}${random.slice(0, 3)}`;
            case 'CHECK':
                return `CHQ${timestamp.slice(-6)}`;
            default:
                return `PAY${timestamp.slice(-6)}${random.slice(0, 2)}`;
        }
    }
}

// Instance singleton
export const paiementService = new PaiementService();