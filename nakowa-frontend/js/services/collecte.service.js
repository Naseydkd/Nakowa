// Service Collecte pour Nakowa Assainissement
import { apiService } from './api.js';

class CollecteService {
    constructor() {
        this.baseUrl = '/collections';
    }

    // === GESTION DES COLLECTES ===
    async getCollections(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.date) queryParams.append('date', filters.date);
        if (filters.month) queryParams.append('month', filters.month);
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.agent) queryParams.append('agent', filters.agent);
        if (filters.zone) queryParams.append('zone', filters.zone);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.passage) queryParams.append('passage', filters.passage);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);
        
        const url = queryParams.toString() ? `${this.baseUrl}?${queryParams.toString()}` : this.baseUrl;
        return await apiService.get(url);
    }

    async getCollection(id) {
        return await apiService.get(`${this.baseUrl}/${id}`);
    }

    async getTodayCollections() {
        return await apiService.get(`${this.baseUrl}/today`);
    }

    async getAgentCollections(agentId, date = null) {
        const url = date ? 
            `${this.baseUrl}/agent/${agentId}?date=${date}` : 
            `${this.baseUrl}/agent/${agentId}`;
        return await apiService.get(url);
    }

    // === ACTIONS DE COLLECTE ===
    async markAsCollected(collectionId, data = {}) {
        return await apiService.patch(`${this.baseUrl}/${collectionId}/collected`, {
            location: data.lat !== undefined && data.lng !== undefined
                ? { latitude: data.lat, longitude: data.lng }
                : undefined
        });
    }

    async reportProblem(collectionId, problemData) {
        const statusMap = {
            CLIENT_ABSENT: 'ABSENT',
            CLIENT_REFUSED: 'REFUSED',
        };
        return await apiService.patch(`${this.baseUrl}/${collectionId}/problem`, {
            status: statusMap[problemData.status] || problemData.status,
            reason: problemData.reason,
            description: problemData.description || null,
            reportedAt: new Date().toISOString()
        });
    }

    async rescheduleCollection(collectionId, newDate) {
        return await apiService.patch(`${this.baseUrl}/${collectionId}/reschedule`, {
            newDate: newDate
        });
    }

    // === STATISTIQUES ===
    async getDayStats(date = null) {
        const url = date ? `${this.baseUrl}/stats/day?date=${date}` : `${this.baseUrl}/stats/day`;
        return await apiService.get(url);
    }

    async getMonthStats(month, year) {
        return await apiService.get(`${this.baseUrl}/stats/month?month=${month}&year=${year}`);
    }

    async getAgentStats(agentId, date = null) {
        const url = date ? 
            `/agents/${agentId}/stats?date=${date}` : 
            `/agents/${agentId}/stats`;
        return await apiService.get(url);
    }

    // === STATUTS ET CONSTANTES ===
    getCollectionStatuses() {
        return [
            { value: 'SCHEDULED', label: 'À collecter', class: 'badge-warning' },
            { value: 'COLLECTED', label: 'Collecté', class: 'badge-success' },
            { value: 'CLIENT_ABSENT', label: 'Client absent', class: 'badge-danger' },
            { value: 'NO_WASTE', label: 'Poubelle non présentée', class: 'badge-info' },
            { value: 'ACCESS_DENIED', label: 'Accès impossible', class: 'badge-danger' },
            { value: 'CLIENT_REFUSED', label: 'Refus', class: 'badge-danger' },
            { value: 'OTHER', label: 'Autre problème', class: 'badge-secondary' }
        ];
    }

    getPassageTypes() {
        return [
            { value: 1, label: 'Passage 1' },
            { value: 2, label: 'Passage 2' },
            { value: 3, label: 'Passage 3' },
            { value: 4, label: 'Passage 4' },
            { value: 5, label: 'Passage 5' },
            { value: 6, label: 'Passage 6' },
            { value: 7, label: 'Passage 7' },
            { value: 8, label: 'Passage 8' }
        ];
    }

    // === VALIDATION ===
    validateProblemReport(problemData) {
        const errors = [];
        
        if (!problemData.status) {
            errors.push('Le statut est obligatoire');
        }
        
        if (!problemData.reason) {
            errors.push('La raison est obligatoire');
        }
        
        if (problemData.status === 'OTHER' && !problemData.description?.trim()) {
            errors.push('La description est obligatoire pour "Autre problème"');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // === FORMATAGE ===
    formatCollectionForDisplay(collection) {
        const status = this.getCollectionStatuses().find(s => s.value === collection.status);
        
        return {
            ...collection,
            statusBadge: status || { value: collection.status, label: collection.status, class: 'badge-secondary' },
            passageLabel: `Passage ${collection.passageNumber}`,
            formattedDate: this.formatDate(collection.scheduledDate),
            clientName: collection.client ? `${collection.client.firstName} ${collection.client.lastName}` : 'Client inconnu'
        };
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const today = new Date();
        
        // Si c'est aujourd'hui
        if (date.toDateString() === today.toDateString()) {
            return 'Aujourd\'hui';
        }
        
        // Si c'est demain
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Demain';
        }
        
        // Si c'est hier
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Hier';
        }
        
        // Sinon, format normal
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
        });
    }

    // === GÉOLOCALISATION ===
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Géolocalisation non supportée'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    reject(new Error('Impossible d\'obtenir la position'));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    // === FILTRES ET TRI ===
    getFilterOptions() {
        return {
            zones: [
                'COMPLEX',
                'KALLEY EST',
                'DAN GAO',
                'JANGORZO',
                'BOUKOKI',
                'WADATA',
                'GOROU YENA',
                'NIAMEY 200',
                'CITE CAISSE',
                'SONNI',
                'MARCHE ALBARKA'
            ],
            statuses: this.getCollectionStatuses(),
            passages: this.getPassageTypes()
        };
    }

    // === GÉNÉRATION DE TOURNÉES ===
    async generateRoutes(date, agentId = null) {
        const data = { date };
        if (agentId) data.agentId = agentId;
        
        return await apiService.post(`${this.baseUrl}/generate-routes`, data);
    }

    async optimizeRoute(collectionIds) {
        return await apiService.post(`${this.baseUrl}/optimize-route`, {
            collectionIds
        });
    }
}

// Instance singleton
export const collecteService = new CollecteService();
