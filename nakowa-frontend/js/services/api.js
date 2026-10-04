// Service API centralisé pour Nakowa Assainissement
import { authService } from './auth.js';
import { API_BASE_URL } from '../core/config.js';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    async post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async patch(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }

    async request(url, options = {}) {
        const token = authService.getToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

        try {
            const response = await fetch(fullUrl, config);
            
            // Gestion des erreurs d'authentification
            if (response.status === 401) {
                authService.logout();
                throw new Error('Session expirée, veuillez vous reconnecter');
            }

            // Gestion des erreurs HTTP
            if (!response.ok) {
                let errorMessage = `Erreur HTTP ${response.status}`;
                
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    // Si on ne peut pas parser la réponse d'erreur, on garde le message par défaut
                }
                
                throw new Error(errorMessage);
            }

            // Retourner les données JSON ou la réponse brute
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return response;
            
        } catch (error) {
            console.error('Erreur API:', error);
            
            // Gestion des erreurs réseau
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('Erreur de connexion au serveur');
            }
            
            throw error;
        }
    }

    // === MÉTHODES SPÉCIFIQUES NAKOWA ===

    // Clients
    async getClients(filters = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });
        
        const url = queryParams.toString() ? `/clients?${queryParams.toString()}` : '/clients';
        return this.get(url);
    }

    async getClient(id) {
        return this.get(`/clients/${id}`);
    }

    async createClient(clientData) {
        return this.post('/clients', clientData);
    }

    async updateClient(id, clientData) {
        return this.patch(`/clients/${id}`, clientData);
    }

    // Collectes
    async getCollections(filters = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });
        
        const url = queryParams.toString() ? `/collections?${queryParams.toString()}` : '/collections';
        return this.get(url);
    }

    async markCollectionAsCollected(id, data) {
        return this.patch(`/collections/${id}/collected`, data);
    }

    async reportCollectionProblem(id, data) {
        return this.patch(`/collections/${id}/problem`, data);
    }

    // Abonnements
    async getSubscriptions(filters = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });
        
        const url = queryParams.toString() ? `/subscriptions?${queryParams.toString()}` : '/subscriptions';
        return this.get(url);
    }

    async createSubscription(subscriptionData) {
        return this.post('/subscriptions/create', subscriptionData);
    }

    // Paiements
    async getPayments(filters = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });
        
        const url = queryParams.toString() ? `/payments?${queryParams.toString()}` : '/payments';
        return this.get(url);
    }

    async createPayment(paymentData) {
        return this.post('/payments', paymentData);
    }

    // Dashboard
    async getDashboardData() {
        return this.get('/dashboard');
    }

    async getTodayStats() {
        return this.get('/dashboard/today');
    }

    // Utilitaires
    buildQueryString(params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });
        return queryParams.toString();
    }
}

// Instance singleton
export const apiService = new ApiService();
