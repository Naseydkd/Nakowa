// Service d'authentification pour Nakowa
import { API_BASE_URL } from '../core/config.js';
class AuthService {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.tokenKey = 'nakowa_token';
        this.userKey = 'nakowa_user';
        this.listeners = [];
    }

    // Ajouter un écouteur pour les changements d'auth
    addAuthListener(callback) {
        this.listeners.push(callback);
    }

    // Notifier tous les écouteurs
    notifyListeners() {
        const isAuthenticated = this.isAuthenticated();
        const user = this.getCurrentUser();
        this.listeners.forEach(callback => callback(isAuthenticated, user));
    }

    // Connexion utilisateur
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur de connexion');
            }

            const data = await response.json();
            
            // Stocker le token et les infos utilisateur
            localStorage.setItem(this.tokenKey, data.access_token);
            localStorage.setItem(this.userKey, JSON.stringify(data.user));
            
            this.notifyListeners();
            return data;
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        }
    }

    // Déconnexion utilisateur
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                // Optionnel: appeler l'API de logout
                await fetch(`${this.baseUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.warn('Erreur lors de la déconnexion API:', error);
        } finally {
            // Supprimer les données locales
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            this.notifyListeners();
        }
    }

    // Vérifier si l'utilisateur est connecté
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Vérifier si le token n'est pas expiré
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            console.error('Token invalide:', error);
            this.logout();
            return false;
        }
    }

    // Récupérer le token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Récupérer l'utilisateur actuel
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem(this.userKey);
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            return null;
        }
    }

    // Effectuer une requête authentifiée
    async authenticatedRequest(url, options = {}) {
        const token = this.getToken();
        if (!token) {
            throw new Error('Non authentifié');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(`${this.baseUrl}${url}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expiré ou invalide
            this.logout();
            throw new Error('Session expirée, veuillez vous reconnecter');
        }

        return response;
    }

    // Vérifier le rôle de l'utilisateur
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    // Vérifier si l'utilisateur est admin
    isAdmin() {
        return this.hasRole('ADMIN');
    }

    // Vérifier si l'utilisateur est agent
    isAgent() {
        return this.hasRole('AGENT');
    }
}

// Instance singleton
export const authService = new AuthService();
