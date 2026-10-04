import { authService } from '../services/auth.js';
import { router } from './router.js';

export const initAuth = () => {
    console.log('🔐 Initialisation de l\'authentification...');

    // Écouter les changements d'authentification
    authService.addAuthListener((isAuthenticated, user) => {
        console.log('📡 Changement d\'auth:', isAuthenticated ? 'connecté' : 'déconnecté');
        updateUI(isAuthenticated, user);
    });

    // Vérifier l'état initial de l'authentification
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();

    console.log('🎯 État initial:', isAuthenticated ? 'connecté' : 'non connecté');
    updateUI(isAuthenticated, user);

    // Liaison des boutons de déconnexion
    const logoutButtons = ['sidebar-logout-btn', 'header-logout-btn'];
    logoutButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', logout);
        }
    });
};

function updateUI(isAuthenticated, user) {
    const loginContainer = document.getElementById('login-container');
    const appInterface = document.getElementById('app-interface');
    
    if (isAuthenticated && user) {
        // Utilisateur connecté - afficher l'interface principale
        console.log('✅ Affichage de l\'interface principale');
        document.body.className = 'app-page bg-color';
        
        if (loginContainer) loginContainer.style.display = 'none';
        if (appInterface) appInterface.style.display = 'flex';
        
        updateUserInfo(user);
        updateUIByRole(user.role);
        
    } else {
        // Utilisateur non connecté - afficher la page de login
        console.log('🔑 Affichage de la page de connexion');
        document.body.className = 'login-page';
        
        if (appInterface) appInterface.style.display = 'none';
        if (loginContainer) {
            loginContainer.style.display = 'block';
            loginContainer.innerHTML = renderLoginPage();
            initLoginPage();
        }
    }
}

function updateUserInfo(user) {
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    const userAvatarEl = document.querySelector('.user-avatar');
    
    if (userNameEl) userNameEl.textContent = user.name;
    if (userRoleEl) userRoleEl.textContent = getRoleDisplayName(user.role);
    if (userAvatarEl) {
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        userAvatarEl.textContent = initials;
    }
}

function getRoleDisplayName(role) {
    switch (role) {
        case 'ADMIN': return 'Administrateur';
        case 'AGENT': return 'Agent';
        default: return role;
    }
}

function updateUIByRole(role) {
    // Masquer les éléments réservés aux ADMIN
    const adminOnlyElements = document.querySelectorAll('[data-role="admin"]');
    adminOnlyElements.forEach(el => {
        el.style.display = role === 'ADMIN' ? 'block' : 'none';
    });
    
    // Masquer les éléments réservés aux AGENTS
    const agentOnlyElements = document.querySelectorAll('[data-role="agent"]');
    agentOnlyElements.forEach(el => {
        el.style.display = role === 'AGENT' ? 'block' : 'none';
    });
    
    console.log(`🔐 UI mise à jour pour le rôle: ${role}`);
}

// Fonction de déconnexion globale
export const logout = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        await authService.logout();
    }
};

// Rendu de la page de login (intégré ici pour éviter les imports circulaires)
function renderLoginPage() {
    return `
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <div class="login-logo">
                        <i class="fa-solid fa-leaf"></i>
                        <span>Nakowa</span>
                    </div>
                    <h2>Connexion</h2>
                    <p>Accédez à votre espace de gestion</p>
                </div>

                <form id="loginForm" class="login-form">
                    <div class="form-group">
                        <label for="email">
                            <i class="fa-solid fa-envelope"></i>
                            Email
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email"
                            placeholder="admin@nakowa.com"
                            required
                            autocomplete="email"
                        >
                    </div>

                    <div class="form-group">
                        <label for="password">
                            <i class="fa-solid fa-lock"></i>
                            Mot de passe
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            placeholder="••••••••"
                            required
                            autocomplete="current-password"
                        >
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="remember" name="remember">
                            <span class="checkmark"></span>
                            Se souvenir de moi
                        </label>
                    </div>

                    <button type="submit" class="login-btn" id="loginBtn">
                        <span class="btn-text">Se connecter</span>
                        <i class="fa-solid fa-spinner fa-spin btn-loader" style="display: none;"></i>
                    </button>

                    <div class="login-error" id="loginError" style="display: none;">
                        <i class="fa-solid fa-exclamation-triangle"></i>
                        <span class="error-message"></span>
                    </div>
                </form>

                <div class="login-footer">
                    <p>Utilisez le compte administrateur créé lors de l’initialisation de la base.</p>
                </div>
            </div>
        </div>
    `;
}

function initLoginPage() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');
    const errorDiv = document.getElementById('loginError');

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError('Veuillez remplir tous les champs');
            return;
        }

        setLoadingState(true);
        hideError();

        try {
            await authService.login(email, password);
            console.log('✅ Connexion réussie!');
        } catch (error) {
            console.error('❌ Erreur de connexion:', error);
            showError(error.message || 'Erreur de connexion. Vérifiez vos identifiants.');
        } finally {
            setLoadingState(false);
        }
    });

    // Fonctions utilitaires
    function setLoadingState(loading) {
        loginBtn.disabled = loading;
        btnText.style.display = loading ? 'none' : 'inline';
        btnLoader.style.display = loading ? 'inline' : 'none';
    }

    function showError(message) {
        const errorMessage = errorDiv.querySelector('.error-message');
        errorMessage.textContent = message;
        errorDiv.style.display = 'flex';
    }

    function hideError() {
        errorDiv.style.display = 'none';
    }


    // Focus sur le champ email
    emailInput.focus();
}
