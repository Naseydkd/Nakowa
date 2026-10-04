// Service Client pour Nakowa Assainissement
import { apiService } from './api.js';

class ClientService {
    constructor() {
        this.baseUrl = '/clients';
    }

    // === GESTION DES CLIENTS ===
    async getClients(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.search)  queryParams.append('search', filters.search);
        if (filters.address)  queryParams.append('address', filters.address);
        if (filters.status)  queryParams.append('status', filters.status);
        if (filters.page)    queryParams.append('page', filters.page);
        
        // Utiliser pageSize au lieu de limit (ce que le backend attend)
        // Par défaut, récupérer 1000 clients pour afficher tous les clients
        const pageSize = filters.pageSize || filters.limit || 1000;
        queryParams.append('pageSize', pageSize);
        
        if (filters.month)   queryParams.append('month', filters.month);
        if (filters.year)    queryParams.append('year', filters.year);
        
        const url = queryParams.toString() ? `${this.baseUrl}?${queryParams.toString()}` : this.baseUrl;
        return await apiService.get(url);
    }

    async getClient(id) {
        return await apiService.get(`${this.baseUrl}/${id}`);
    }

    async createClient(clientData) {
        return await apiService.post(this.baseUrl, clientData);
    }

    async updateClient(id, clientData) {
        return await apiService.patch(`${this.baseUrl}/${id}`, clientData);
    }

    async activateClient(id) {
        return await apiService.patch(`${this.baseUrl}/${id}/activate`);
    }

    async deactivateClient(id) {
        return await apiService.patch(`${this.baseUrl}/${id}/deactivate`);
    }

    // === STATISTIQUES ===
    async getClientsStats() {
        return await apiService.get(`${this.baseUrl}/stats`);
    }

    async getClientsForMap() {
        return await apiService.get(`${this.baseUrl}/map`);
    }

    // === ZONES ===
    async getZones() {
        return await apiService.get('/zones');
    }

    // === RECHERCHE ===
    async searchClients(query) {
        return await apiService.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    }

    // === ABONNEMENT DU CLIENT ===
    async getClientSubscription(clientId) {
        return await apiService.get(`${this.baseUrl}/${clientId}/subscription`);
    }

    async createClientSubscription(clientId, subscriptionData) {
        return await apiService.post(`${this.baseUrl}/${clientId}/subscription`, subscriptionData);
    }

    async updateClientSubscription(clientId, subscriptionData) {
        return await apiService.patch(`${this.baseUrl}/${clientId}/subscription`, subscriptionData);
    }

    // === COLLECTES DU CLIENT ===
    async getClientCollections(clientId, filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.month) queryParams.append('month', filters.month);
        if (filters.year) queryParams.append('year', filters.year);
        
        const url = queryParams.toString() ? 
            `/clients/${clientId}/collections?${queryParams.toString()}` : 
            `/clients/${clientId}/collections`;
        
        return await apiService.get(url);
    }

    // === PAIEMENTS DU CLIENT ===
    async getClientPayments(clientId, filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.month) queryParams.append('month', filters.month);
        if (filters.year) queryParams.append('year', filters.year);
        
        const url = queryParams.toString() ? 
            `/clients/${clientId}/payments?${queryParams.toString()}` : 
            `/clients/${clientId}/payments`;
        
        return await apiService.get(url);
    }

    // === HISTORIQUE DU CLIENT ===
    async getClientHistory(clientId) {
        return await apiService.get(`${this.baseUrl}/${clientId}/history`);
    }

    // === GÉOLOCALISATION ===
    async updateClientLocation(clientId, latitude, longitude) {
        return await apiService.patch(`${this.baseUrl}/${clientId}/location`, {
            latitude,
            longitude
        });
    }

    // === VALIDATION ===
    validateClientData(clientData) {
        const errors = [];
        
        if (!clientData.firstName?.trim()) {
            errors.push('Le prénom est obligatoire');
        }
        
        if (!clientData.lastName?.trim()) {
            errors.push('Le nom est obligatoire');
        }
        
        if (!clientData.phone?.trim()) {
            errors.push('Le téléphone est obligatoire');
        }
        
        // Validation du téléphone
        const phoneRegex = /^(\+227|00227|227)?[0-9]{8}$/;
        if (clientData.phone && !phoneRegex.test(clientData.phone.replace(/\s/g, ''))) {
            errors.push('Le format du téléphone n\'est pas valide');
        }

        // Validation du montant par défaut
        if (clientData.defaultAmount && (isNaN(clientData.defaultAmount) || clientData.defaultAmount < 0)) {
            errors.push('Le montant doit être un nombre positif');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // === FORMATAGE ===
    formatClientForDisplay(client) {
        return {
            ...client,
            fullName: `${client.firstName} ${client.lastName}`,
            displayPhone: this.formatPhone(client.phone),
            statusBadge: this.getStatusBadge(client.isActive),
            displayActivity: client.activity || '-',
            displayNumber: client.number || '-',
            displayAmount: client.defaultAmount || 2000
        };
    }

    formatPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }

    getStatusBadge(isActive) {
        return isActive ? 
            { text: 'Actif', class: 'badge-success' } : 
            { text: 'Inactif', class: 'badge-secondary' };
    }
}

// Instance singleton
export const clientService = new ClientService();