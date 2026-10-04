import { reportPage } from '../pages/report.js';
import { dashboardPage } from '../pages/dashboard.js';
import { clientsPage } from '../pages/clients.js';
import { clientDetailsPage } from '../pages/client-details.js';
import { interventionsPage } from '../pages/interventions.js';
import { paymentsPage } from '../pages/payments.js';
import { mapPage } from '../pages/map.js';
import { servicesPage } from '../pages/services.js';
import { usersPage } from '../pages/users.js';
import { abonnementsPage } from '../pages/abonnements.js';
import { importPage } from '../pages/import.js';
import { collectesPage } from '../pages/collectes.js';
import { mesCollectesPage } from '../pages/mes-collectes.js';
import { authService } from '../services/auth.js';

const routes = {
    'report': reportPage,
    'dashboard': dashboardPage,
    'clients': clientsPage,
    'client-details': clientDetailsPage,
    'interventions': interventionsPage,
    'payments': paymentsPage,
    'map': mapPage,
    'services': servicesPage,
    'users': usersPage,
    'abonnements': abonnementsPage,
    'import': importPage,
    'collectes': collectesPage,
};

export const router = {
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.getAttribute('data-page');
                if (page) {
                    window.location.hash = page;
                }
            });
        });
    },

    async handleRoute() {
        const hashFull = window.location.hash.replace('#', '') || 'dashboard';
        const pageName = hashFull.split('?')[0]; // Extraire le nom de la page avant le '?'
        const content = document.getElementById('page-content');

        // Vérifier les permissions basées sur le rôle
        const adminOnlyPages = ['users', 'import'];
        const user = this.getCurrentUser();
        const userRole = user?.role;
        
        if (adminOnlyPages.includes(pageName) && userRole !== 'ADMIN') {
            console.warn(`⛔ Accès refusé à la page ${pageName} pour le rôle ${userRole}`);
            window.location.hash = 'dashboard';
            return;
        }

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-page') === pageName);
        });

        if (routes[pageName]) {
            const html = await routes[pageName].render();
            content.innerHTML = html;
            const lifecycle = routes[pageName].afterRender || routes[pageName].init;
            if (lifecycle) {
                await lifecycle.call(routes[pageName]);
            }
        } else {
            content.innerHTML = '<h1 style="padding: 30px;">404 - Page Not Found</h1>';
        }
    },

    getCurrentUser() {
        return authService.getCurrentUser();
    }
};
