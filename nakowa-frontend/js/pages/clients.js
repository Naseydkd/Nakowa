import { clientService } from '../services/client.service.js';
import { formatCurrency } from '../core/utils.js';

export const clientsPage = {
    async render() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1 style="display: flex; align-items: center; gap: 12px;">
                        <i class="fa-solid fa-users"></i> Gestion des Clients
                    </h1>
                    <div class="page-subtitle">Gérez et suivez vos clients Nakowa</div>
                </div>
                <button class="btn btn-primary" id="add-client-btn">
                    <i class="fa-solid fa-plus"></i> Ajouter un Client
                </button>
            </div>

            <div class="chart-card" style="min-height: auto; padding: 20px;">
                <div style="display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; align-items: center;">
                    <div style="flex: 1; position: relative; min-width: 250px;">
                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 12px; color: var(--text-muted);"></i>
                        <input type="text" id="client-search" class="form-input" style="padding-left: 35px;" placeholder="Rechercher un client (nom, téléphone, adresse)...">
                    </div>
                    <select id="client-status-filter" class="form-input" style="width: 160px;">
                        <option value="">Tous les statuts</option>
                        <option value="true">Actif</option>
                        <option value="false">Inactif</option>
                    </select>
                </div>

                <div id="clients-loading" class="loading-placeholder" style="display: none;">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <p>Chargement des clients...</p>
                </div>

                <table class="data-table" id="clients-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Téléphone</th>
                            <th>Activité</th>
                            <th>Nº</th>
                            <th>Montant (XOF)</th>
                            <th>Adresse</th>
                            <th>Statut</th>
                            <th id="col-total">Restant dû (tous mois)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="clients-list">
                        <!-- Data loaded dynamically -->
                    </tbody>
                </table>
            </div>

            <!-- Client Modal (Add/Edit) -->
            <div class="modal" id="client-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="client-modal-title">Ajouter un Client</h3>
                        <button class="modal-close" onclick="closeClientModal()">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="client-form">
                            <input type="hidden" id="client-id">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="form-group">
                                    <label>Prénom</label>
                                    <input type="text" id="client-firstname" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label>Nom</label>
                                    <input type="text" id="client-lastname" class="form-input" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Téléphone</label>
                                <input type="text" id="client-phone" class="form-input" placeholder="+227 00 00 00 00" required>
                            </div>
                            <div class="form-group">
                                <label>Adresse</label>
                                <div style="display: flex; gap: 10px; align-items: flex-end;">
                                    <div style="flex: 1;">
                                        <select id="client-address-select" class="form-input">
                                            <option value="">Sélectionnez une adresse</option>
                                            <option value="COMPLEX">COMPLEX</option>
                                            <option value="KALLEY EST">KALLEY EST</option>
                                            <option value="DAN GAO">DAN GAO</option>
                                            <option value="JANGORZO">JANGORZO</option>
                                            <option value="BOUKOKI">BOUKOKI</option>
                                            <option value="WADATA">WADATA</option>
                                            <option value="GOROU YENA">GOROU YENA</option>
                                            <option value="NIAMEY 200">NIAMEY 200</option>
                                            <option value="CITE CAISSE">CITE CAISSE</option>
                                            <option value="SONNI">SONNI</option>
                                            <option value="MARCHE ALBARKA">MARCHE ALBARKA</option>
                                            <option value="__custom__">+ Ajouter une adresse</option>
                                        </select>
                                    </div>
                                </div>
                                <div id="custom-address-input" style="display: none; margin-top: 10px;">
                                    <input type="text" id="client-address-custom" class="form-input" placeholder="Saisir la nouvelle adresse" style="margin-bottom: 8px;">
                                    <small style="color: var(--text-muted);">L'adresse sera ajoutée à la liste pour les prochaines utilisations</small>
                                </div>
                                <input type="hidden" id="client-address" value="">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="form-group">
                                    <label>Activité</label>
                                    <select id="client-activity" class="form-input">
                                        <option value="">Sélectionnez une activité</option>
                                        <option value="Menage">Ménage</option>
                                        <option value="Boutique">Boutique</option>
                                        <option value="Atelier de couture">Atelier de couture</option>
                                        <option value="Menagere">Ménagère</option>
                                        <option value="Chef de menage">Chef de ménage</option>
                                        <option value="autres">Autres</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Nº (P1, P2, etc.)</label>
                                    <input type="text" id="client-number" class="form-input" placeholder="ex: P1, P2" maxlength="10">
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="form-group">
                                    <label>Montant à payer (XOF)</label>
                                    <input type="number" id="client-default-amount" class="form-input" placeholder="2000" min="0" value="2000">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Géolocalisation</label>
                                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                                    <button type="button" class="btn btn-outline" id="get-location-btn" style="flex: 1;">
                                        <i class="fa-solid fa-location-crosshairs"></i> Me Localiser
                                    </button>
                                    <button type="button" class="btn btn-outline" id="toggle-manual-location" style="flex: 1;">
                                        <i class="fa-solid fa-keyboard"></i> Saisie Manuelle
                                    </button>
                                </div>
                                <div id="manual-location-inputs" style="display: none;">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                        <div>
                                            <input type="number" step="any" id="client-latitude" class="form-input" placeholder="Latitude (ex: 13.5127)">
                                        </div>
                                        <div>
                                            <input type="number" step="any" id="client-longitude" class="form-input" placeholder="Longitude (ex: 2.1128)">
                                        </div>
                                    </div>
                                </div>
                                <div id="location-status" style="margin-top: 10px; font-size: 13px; color: var(--text-muted);"></div>
                            </div>
                            <div class="form-group">
                                <label>Statut</label>
                                <select id="client-status" class="form-input">
                                    <option value="true">Actif</option>
                                    <option value="false">Inactif</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="closeClientModal()">Annuler</button>
                        <button class="btn btn-primary" id="save-client-btn">Enregistrer le Client</button>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        this.setupEventListeners();
        await this.loadClients();
    },

    async setupEventListeners() {
        document.getElementById('add-client-btn')?.addEventListener('click', () => this.openClientModal());

        const searchInput = document.getElementById('client-search');
        const statusFilter = document.getElementById('client-status-filter');

        const handleFilterChange = () => {
            this.loadClients({
                search: searchInput.value,
                status: statusFilter.value,
            });
        };

        searchInput?.addEventListener('input', this.debounce(handleFilterChange, 300));
        statusFilter?.addEventListener('change', handleFilterChange);

        document.getElementById('save-client-btn')?.addEventListener('click', () => this.saveClient());
        document.getElementById('get-location-btn')?.addEventListener('click', () => this.getCurrentLocation());
        document.getElementById('toggle-manual-location')?.addEventListener('click', () => this.toggleManualLocation());

        // Handle custom address input
        document.getElementById('client-address-select')?.addEventListener('change', (e) => {
            const customInput = document.getElementById('custom-address-input');
            const addressField = document.getElementById('client-address');
            
            if (e.target.value === '__custom__') {
                customInput.style.display = 'block';
                addressField.value = '';
            } else {
                customInput.style.display = 'none';
                addressField.value = e.target.value;
                document.getElementById('client-address-custom').value = '';
            }
        });

        // Handle custom address typing
        document.getElementById('client-address-custom')?.addEventListener('input', (e) => {
            document.getElementById('client-address').value = e.target.value;
        });
    },

    async loadClients(filters = {}) {
        const loading = document.getElementById('clients-loading');
        const list    = document.getElementById('clients-list');

        if (loading) loading.style.display = 'block';

        try {
            const response = await clientService.getClients(filters);
            const clients  = response.data || [];

            if (list) {
                list.innerHTML = clients.map(client => {
                    const formatted = clientService.formatClientForDisplay(client);
                    const debt      = client.totalDebt || 0;

                    return `
                        <tr>
                            <td>${formatted.fullName}</td>
                            <td>${formatted.displayPhone}</td>
                            <td>${formatted.displayActivity}</td>
                            <td>${formatted.displayNumber}</td>
                            <td style="font-weight:600; color:#006d44;">${formatted.displayAmount.toLocaleString('fr-FR')} XOF</td>
                            <td>${client.address || '-'}</td>
                            <td><span class="status-badge ${formatted.statusBadge.class}">${formatted.statusBadge.text}</span></td>
                            <td style="font-weight:600; color:${debt > 0 ? 'var(--danger)' : 'var(--success)'};">
                                ${debt > 0 ? formatCurrency(debt) : '✓ À jour'}
                            </td>
                            <td>
                                <button class="btn btn-outline btn-sm" data-action="view" data-id="${client.id}" title="Consulter">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                <button class="btn btn-outline btn-sm" data-action="edit" data-id="${client.id}" title="Modifier">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                // Attacher les événements après le rendu
                list.querySelectorAll('button[data-action="view"]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const clientId = btn.getAttribute('data-id');
                        window.location.hash = `client-details?id=${clientId}`;
                    });
                });
                
                list.querySelectorAll('button[data-action="edit"]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const clientId = btn.getAttribute('data-id');
                        this.openClientModal(clientId);
                    });
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement des clients:', error);
            if (list) list.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--danger);">Erreur lors du chargement des clients.</td></tr>';
        } finally {
            if (loading) loading.style.display = 'none';
        }
    },

    getCurrentLocation() {
        const statusEl = document.getElementById('location-status');
        const latInput = document.getElementById('client-latitude');
        const lonInput = document.getElementById('client-longitude');

        if (!navigator.geolocation) {
            statusEl.textContent = '❌ Géolocalisation non supportée par votre navigateur';
            statusEl.style.color = 'var(--danger)';
            return;
        }

        statusEl.textContent = '📍 Récupération de votre position...';
        statusEl.style.color = 'var(--primary-color)';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lon = position.coords.longitude.toFixed(6);
                
                latInput.value = lat;
                lonInput.value = lon;
                
                statusEl.textContent = `✅ Position obtenue : ${lat}, ${lon}`;
                statusEl.style.color = 'var(--success)';
                
                // Afficher les champs si cachés
                document.getElementById('manual-location-inputs').style.display = 'block';
            },
            (error) => {
                let errorMsg = 'Erreur lors de la récupération de la position';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = '❌ Permission de géolocalisation refusée';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = '❌ Position indisponible';
                        break;
                    case error.TIMEOUT:
                        errorMsg = '❌ Délai d\'attente dépassé';
                        break;
                }
                statusEl.textContent = errorMsg;
                statusEl.style.color = 'var(--danger)';
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    },

    toggleManualLocation() {
        const manualInputs = document.getElementById('manual-location-inputs');
        const statusEl = document.getElementById('location-status');
        
        if (manualInputs.style.display === 'none') {
            manualInputs.style.display = 'block';
            statusEl.textContent = '⌨️ Saisie manuelle activée';
            statusEl.style.color = 'var(--primary-color)';
        } else {
            manualInputs.style.display = 'none';
            statusEl.textContent = '';
            document.getElementById('client-latitude').value = '';
            document.getElementById('client-longitude').value = '';
        }
    },

    async openClientModal(clientId = null) {
        const modal = document.getElementById('client-modal');
        const title = document.getElementById('client-modal-title');
        const form = document.getElementById('client-form');
        const statusEl = document.getElementById('location-status');
        const manualInputs = document.getElementById('manual-location-inputs');
        const customInput = document.getElementById('custom-address-input');
        const addressSelect = document.getElementById('client-address-select');

        // Réinitialiser l'affichage de la géolocalisation et adresse personnalisée
        statusEl.textContent = '';
        manualInputs.style.display = 'none';
        customInput.style.display = 'none';

        if (clientId) {
            title.textContent = 'Modifier le Client';
            try {
                const response = await clientService.getClient(clientId);
                console.log('Client response:', response);
                const client = response.data || response;
                console.log('Client data:', client);
                
                document.getElementById('client-id').value = client.id;
                document.getElementById('client-firstname').value = client.firstName || '';
                document.getElementById('client-lastname').value = client.lastName || '';
                document.getElementById('client-phone').value = client.phone || '';
                document.getElementById('client-activity').value = client.activity || '';
                document.getElementById('client-number').value = client.number || '';
                document.getElementById('client-default-amount').value = client.defaultAmount || 2000;
                document.getElementById('client-status').value = client.isActive ? 'true' : 'false';
                
                // Handle address field
                const address = client.address || '';
                const predefinedAddresses = ['COMPLEX', 'KALLEY EST', 'DAN GAO', 'JANGORZO', 'BOUKOKI', 'WADATA', 'GOROU YENA', 'NIAMEY 200', 'CITE CAISSE', 'SONNI', 'MARCHE ALBARKA'];
                
                if (predefinedAddresses.includes(address)) {
                    addressSelect.value = address;
                    document.getElementById('client-address').value = address;
                    customInput.style.display = 'none';
                } else if (address) {
                    addressSelect.value = '__custom__';
                    document.getElementById('client-address-custom').value = address;
                    document.getElementById('client-address').value = address;
                    customInput.style.display = 'block';
                } else {
                    addressSelect.value = '';
                    document.getElementById('client-address').value = '';
                    customInput.style.display = 'none';
                }
                
                // Charger la géolocalisation si elle existe
                if (client.latitude && client.longitude) {
                    document.getElementById('client-latitude').value = client.latitude;
                    document.getElementById('client-longitude').value = client.longitude;
                    manualInputs.style.display = 'block';
                    statusEl.textContent = `📍 Position enregistrée : ${client.latitude}, ${client.longitude}`;
                    statusEl.style.color = 'var(--success)';
                }
            } catch (error) {
                console.error('Erreur détaillée:', error);
                alert('Erreur lors du chargement du client: ' + (error.message || error));
                return;
            }
        } else {
            title.textContent = 'Ajouter un Client';
            form.reset();
            document.getElementById('client-id').value = '';
            document.getElementById('client-latitude').value = '';
            document.getElementById('client-longitude').value = '';
            document.getElementById('client-default-amount').value = '2000';
            addressSelect.value = '';
            document.getElementById('client-address').value = '';
            customInput.style.display = 'none';
        }

        modal.classList.add('active');
    },

    closeClientModal() {
        document.getElementById('client-modal').classList.remove('active');
    },

    async saveClient() {
        const id = document.getElementById('client-id').value;
        const latitude = document.getElementById('client-latitude').value;
        const longitude = document.getElementById('client-longitude').value;
        
        const data = {
            firstName: document.getElementById('client-firstname').value,
            lastName: document.getElementById('client-lastname').value,
            phone: document.getElementById('client-phone').value,
            address: document.getElementById('client-address').value,
            activity: document.getElementById('client-activity').value || null,
            number: document.getElementById('client-number').value || null,
            defaultAmount: parseFloat(document.getElementById('client-default-amount').value) || 2000,
            isActive: document.getElementById('client-status').value === 'true'
        };

        // Ajouter la géolocalisation si renseignée
        if (latitude && longitude) {
            data.latitude = parseFloat(latitude);
            data.longitude = parseFloat(longitude);
        }

        const validation = clientService.validateClientData(data);
        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        try {
            if (id) {
                await clientService.updateClient(id, data);
            } else {
                await clientService.createClient(data);
            }
            this.closeClientModal();
            await this.loadClients();
        } catch (error) {
            alert('Erreur lors de l\'enregistrement: ' + error.message);
        }
    },

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};

window.closeClientModal = () => {
    clientsPage.closeClientModal();
};
