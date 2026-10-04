import { api } from '../core/api.js';

export const mesCollectesPage = {
    async render() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>Mes Collectes du Jour</h1>
                    <div class="page-subtitle">Ma tournée et mes passages à effectuer</div>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="my-total">--</div>
                    <div class="stat-label">Maisons prévues</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="my-done" style="color: var(--success);">--</div>
                    <div class="stat-label">Collectées</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="my-rest" style="color: var(--warning);">--</div>
                    <div class="stat-label">Restantes</div>
                </div>
            </div>

            <div class="collection-grid" id="my-collections-list">
                <div class="loading-placeholder">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <p>Chargement de ma tournée...</p>
                </div>
            </div>
        `;
    },
    async afterRender() {
        try {
            const data = await api.get('/collections?status=SCHEDULED');
            const collections = data.data || [];
            
            document.getElementById('my-total').textContent = collections.length;
            document.getElementById('my-done').textContent = '0'; // Mock
            document.getElementById('my-rest').textContent = collections.length;

            const container = document.getElementById('my-collections-list');
            if (collections.length === 0) {
                container.innerHTML = '<p style="text-align:center; width:100%;">Aucune collecte prévue pour vous aujourd\'hui.</p>';
                return;
            }

            container.innerHTML = collections.map(c => `
                <div class="collection-card">
                    <div class="client-info">
                        <span class="client-name">${c.client.firstName} ${c.client.lastName}</span>
                        <span class="client-address">${c.client.address}</span>
                    </div>
                    <div class="collection-details">
                        <div class="detail-item"><strong>Passage ${c.passageNumber}</strong></div>
                        <div class="detail-item"><strong>${c.scheduledAt}</strong></div>
                    </div>
                    <button class="btn-collect" onclick="window.markCollected('${c.id}')">
                        ✓
                    </button>
                </div>
            `).join('');
        } catch (e) {
            console.error(e);
        }
    }
};

window.markCollected = async function(id) {
    try {
        await api.patch(`/collections/${id}/collected`, { location: { lat: 0, lng: 0 } });
        alert('Collecte enregistrée !');
        window.location.reload();
    } catch (e) {
        alert('Erreur : ' + e.message);
    }
};
