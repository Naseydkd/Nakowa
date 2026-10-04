import { apiService } from '../services/api.js';

export const mapPage = {
    render() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>Carte Géographique</h1>
                    <div class="page-subtitle">Visualisation des clients et leur statut de paiement</div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-outline" id="my-location-btn">
                        <i class="fa-solid fa-location-crosshairs"></i> Me localiser
                    </button>
                </div>
            </div>

            <div class="chart-card" style="min-height: auto; padding: 0;">
                <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; gap: 15px; align-items: center; background: white;">
                    <div style="display: flex; gap: 10px; align-items: center; margin-right: 20px;">
                        <span style="font-size: 14px; font-weight: 500;">Filtrer:</span>
                        <select class="form-input" id="map-status-filter" style="width: 150px; margin: 0;">
                            <option value="all">Tous</option>
                            <option value="paid">Payés</option>
                            <option value="unpaid">Non payés</option>
                            <option value="partial">Partiellement payés</option>
                        </select>
                    </div>
                    <div style="position: relative; flex: 1;">
                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 12px; color: var(--text-muted);"></i>
                        <input type="text" id="map-search" class="form-input" style="padding-left: 35px;" placeholder="Rechercher un client sur la carte...">
                    </div>
                </div>
                <div id="google-map" style="width: 100%; height: 600px;"></div>
            </div>
        `;
    },
    async init() {
        this.initMap();
        this.setupEventListeners();
    },
    initMap() {
        const mapElement = document.getElementById('google-map');
        if (!mapElement) return;

        // Initialisation de la carte Leaflet centrée sur Niamey
        const center = [13.512, 2.125];
        this.map = L.map('google-map').setView(center, 13);

        // Ajout des tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.markers = [];
        this.loadClientsOnMap();
    },
    async loadClientsOnMap(filter = 'all', searchQuery = '') {
        try {
            const response = await apiService.get('/clients/map');
            const clients = response.data || response;

            // Nettoyage des anciens marqueurs
            this.markers.forEach(m => this.map.removeLayer(m));
            this.markers = [];

            // Définir les couleurs des marqueurs selon le statut
            const markerColors = {
                'PAYE': '#28a745',      // Vert
                'PARTIEL': '#f59e0b',   // Orange
                'NON_PAYE': '#dc3545'   // Rouge
            };

            clients.forEach(client => {
                if (client.latitude && client.longitude) {
                    // Filtrage par recherche
                    if (searchQuery && !client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) && !client.lastName.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return;
                    }

                    // Filtrage par statut
                    if (filter !== 'all') {
                        const statusMap = {
                            'paid': 'PAYE',
                            'unpaid': 'NON_PAYE',
                            'partial': 'PARTIEL'
                        };
                        if (statusMap[filter] !== client.paymentStatus) {
                            return;
                        }
                    }

                    // Créer une icône colorée selon le statut
                    const color = markerColors[client.paymentStatus] || '#0066cc';
                    const icon = L.divIcon({
                        html: `
                            <div style="
                                background-color: ${color};
                                border: 3px solid white;
                                border-radius: 50%;
                                width: 32px;
                                height: 32px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            ">
                                <i class="fa-solid fa-map-pin" style="color: white; font-size: 14px;"></i>
                            </div>
                        `,
                        className: 'custom-marker',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32]
                    });

                    const marker = L.marker([client.latitude, client.longitude], { icon }).addTo(this.map);

                    const statusLabel = {
                        'PAYE': '✓ Payé',
                        'PARTIEL': '⚡ Partiel',
                        'NON_PAYE': '✗ Impayé'
                    };

                    marker.bindPopup(`
                        <div style="font-family: 'Inter', sans-serif; padding: 8px; min-width: 200px;">
                            <strong style="color: ${color}; font-size: 14px;">${client.firstName} ${client.lastName}</strong><br>
                            <span style="font-size: 12px; color: var(--text-muted);">Zone: ${client.zone || 'N/A'}</span><br>
                            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e0e0e0;">
                                <div style="font-size: 12px; margin-bottom: 4px;">
                                    <span style="color: var(--text-muted);">Montant attendu:</span> <strong>${client.totalExpected.toLocaleString('fr-FR')} F</strong>
                                </div>
                                <div style="font-size: 12px; margin-bottom: 4px;">
                                    <span style="color: var(--text-muted);">Payé:</span> <strong style="color: #28a745;">${client.totalPaid.toLocaleString('fr-FR')} F</strong>
                                </div>
                                <div style="font-size: 12px; margin-bottom: 8px;">
                                    <span style="color: var(--text-muted);">Restant:</span> <strong style="color: ${color};">${client.totalDebt.toLocaleString('fr-FR')} F</strong>
                                </div>
                                <span class="status-badge" style="background: ${color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                                    ${statusLabel[client.paymentStatus] || 'Inconnu'}
                                </span>
                            </div>
                            <a href="#client-details?id=${client.id}" style="color: var(--primary-color); font-weight: 600; text-decoration: none; font-size: 12px; display: block; margin-top: 8px;">Voir détails →</a>
                        </div>
                    `);

                    this.markers.push(marker);
                }
            });
        } catch (error) {
            console.error('Erreur chargement carte:', error);
        }
    },
    setupEventListeners() {
        document.getElementById('my-location-btn')?.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const coords = [pos.coords.latitude, pos.coords.longitude];
                        this.map.setView(coords, 15);
                        L.marker(coords).addTo(this.map).bindPopup('Vous êtes ici').openPopup();
                    },
                    (err) => alert('Erreur de géolocalisation: ' + err.message)
                );
            } else {
                alert('La géolocalisation n\'est pas supportée par votre navigateur');
            }
        });

        document.getElementById('map-status-filter')?.addEventListener('change', (e) => {
            this.loadClientsOnMap(e.target.value);
        });

        document.getElementById('map-search')?.addEventListener('input', (e) => {
            this.loadClientsOnMap('all', e.target.value);
        });
    }
};
