// Page de connexion
import { authService } from '../services/auth.js';
import { router } from '../core/router.js';

export function renderLoginPage() {
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
                    <div class="demo-credentials">
                        <h4><i class="fa-solid fa-info-circle"></i> Comptes de démonstration</h4>
                        <div class="credential-item">
                            <strong>Admin:</strong> admin@nakowa.com / admin123
                        </div>
                        <div class="credential-item">
                            <strong>Agent:</strong> agent@nakowa.com / agent123
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initLoginPage() {
    // Si déjà connecté, rediriger vers dashboard
    if (authService.isAuthenticated()) {
        router.navigate('dashboard');
        return;
    }

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

        // Afficher le loader
        setLoadingState(true);
        hideError();

        try {
            const result = await authService.login(email, password);
            
            // Connexion réussie
            console.log('Connexion réussie:', result);
            
            // Rediriger vers le dashboard
            router.navigate('dashboard');
            
        } catch (error) {
            console.error('Erreur de connexion:', error);
            showError(error.message || 'Erreur de connexion. Vérifiez vos identifiants.');
        } finally {
            setLoadingState(false);
        }
    });

    // Remplissage automatique avec les credentials demo
    document.querySelectorAll('.credential-item').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.textContent;
            if (text.includes('admin@nakowa.com')) {
                emailInput.value = 'admin@nakowa.com';
                passwordInput.value = 'admin123';
            } else if (text.includes('agent@nakowa.com')) {
                emailInput.value = 'agent@nakowa.com';
                passwordInput.value = 'agent123';
            }
            emailInput.focus();
        });
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