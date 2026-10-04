// Page Collectes pour Nakowa Assainissement
import { collecteService } from '../services/collecte.service.js';
import { authService } from '../services/auth.js';

export function renderCollectesPage() {
    return `
        <div class="page-header">
            <div class="header-content">
                <h1><i class="fa-solid fa-truck"></i> Collectes</h1>
                <p id="current-date">${getCurrentDateLabel()}</p>
            </div>
            <div class="header-actions">
                <button class="btn-secondary" onclick="refreshCollections()">
                    <i class="fa-solid fa-refresh"></i> Actualiser
                </button>
            </div>
        </div>

        <!-- Statistiques du jour -->
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="stat-card">
                <div class="stat-icon success">
                    <i class="fa-solid fa-calendar-check"></i>
                </div>
                <div class="stat-content">
                    <h3 id="stat-scheduled">--</h3>
                    <p>Prévues</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon success">
                    <i class="fa-solid fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <h3 id="stat-completed">--</h3>
                    <p>Terminées</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon warning">
                    <i class="fa-solid fa-clock"></i>
                </div>
                <div class="stat-content">
                    <h3 id="stat-remaining">--</h3>
                    <p>Restantes</p>
                </div>
            </div>
        </div>

        <!-- Barre de progression -->
        <div class="progress-section">
            <div class="progress-header">
                <span id="progress-label">0 / 0</span>
                <span id="progress-percentage">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
        </div>

        <!-- Filtres -->
        <div class="filters-section">
            <div class="filters-header">
                <h3><i class="fa-solid fa-filter"></i> Filtres de recherche</h3>
                <button class="btn-ghost filter-toggle" onclick="toggleFilters()">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>
            <div class="filters-content" id="filters-content">
                <div class="filters-grid">
                    <!-- Recherche par texte -->
                    <div class="filter-group" style="grid-column: 1 / -1;">
                        <label>Recherche (Nom, Téléphone, Adresse)</label>
                        <input type="text" id="filter-search" class="form-input" placeholder="Ex: Jean Dupont, 77123456, Kalley..." onkeyup="applyFilters()">
                    </div>
                    
                    <!-- Filtres de date -->
                    <div class="filter-group">
                        <label>Mois</label>
                        <select id="filter-month" class="form-input" onchange="applyFilters()">
                            ${[...Array(12)].map((_, i) => {
                                const label = new Date(0, i).toLocaleString('fr-FR', { month: 'long' });
                                const cur   = new Date().getMonth();
                                return `<option value="${i+1}" ${i===cur?'selected':''}>${label.charAt(0).toUpperCase()+label.slice(1)}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Année</label>
                        <input type="number" id="filter-year" class="form-input" min="1900" max="2100" value="${new Date().getFullYear()}" onchange="applyFilters()">
                    </div>
                    
                    <!-- Filtres de localisation et agent -->
                    <div class="filter-group">
                        <label>Zone/Adresse</label>
                        <select id="filter-zone" class="form-input" onchange="applyFilters()">
                            <option value="">Toutes les zones</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Agent</label>
                        <select id="filter-agent" class="form-input" onchange="applyFilters()">
                            <option value="">Tous les agents</option>
                        </select>
                    </div>
                    
                    <!-- Filtres de statut et passage -->
                    <div class="filter-group">
                        <label>Statut</label>
                        <select id="filter-status" class="form-input" onchange="applyFilters()">
                            <option value="">Tous les statuts</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Passage</label>
                        <select id="filter-passage" class="form-input" onchange="applyFilters()">
                            <option value="">Tous les passages</option>
                            <option value="1">Passage 1</option>
                            <option value="2">Passage 2</option>
                            <option value="3">Passage 3</option>
                            <option value="4">Passage 4</option>
                            <option value="5">Passage 5</option>
                            <option value="6">Passage 6</option>
                            <option value="7">Passage 7</option>
                            <option value="8">Passage 8</option>
                        </select>
                    </div>
                    
                    <!-- Boutons d'action -->
                    <div class="filter-group" style="grid-column: 1 / -1; display: flex; gap: 10px;">
                        <button class="btn btn-outline" onclick="resetFilters()" style="flex: 1;">
                            <i class="fa-solid fa-redo"></i> Réinitialiser
                        </button>
                        <button class="btn btn-primary" onclick="applyFilters()" style="flex: 1;">
                            <i class="fa-solid fa-search"></i> Appliquer les filtres
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Liste des collectes -->
        <div class="collections-section">
            <div class="collections-header">
                <h3>Liste des collectes</h3>
                <div class="view-toggle">
                    <button class="btn-ghost active" onclick="setCollectionsView('cards')" data-view="cards">
                        <i class="fa-solid fa-th-large"></i>
                    </button>
                    <button class="btn-ghost" onclick="setCollectionsView('table')" data-view="table">
                        <i class="fa-solid fa-list"></i>
                    </button>
                </div>
            </div>

            <div id="collections-container" class="collections-grid">
                <div class="loading-placeholder">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <p>Chargement des collectes...</p>
                </div>
            </div>

            <!-- Pagination -->
            <div class="pagination-container">
                <div class="pagination-info">
                    <span id="pagination-info">--</span>
                </div>
                <div class="pagination-controls">
                    <button class="btn-ghost" id="prev-page" onclick="previousPage()">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <span id="page-numbers"></span>
                    <button class="btn-ghost" id="next-page" onclick="nextPage()">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de problème -->
        <div class="modal" id="problem-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Signaler un problème</h3>
                    <button class="modal-close" onclick="closeProblemModal()">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Pourquoi la collecte n'a pas été effectuée ?</p>
                    <form id="problem-form">
                        <input type="hidden" id="problem-collection-id">

                        <div class="problem-reasons">
                            <label class="radio-card">
                                <input type="radio" name="reason" value="ABSENT">
                                <div class="card-content">
                                    <i class="fa-solid fa-user-slash"></i>
                                    <span>Client absent</span>
                                </div>
                            </label>

                            <label class="radio-card">
                                <input type="radio" name="reason" value="NO_WASTE">
                                <div class="card-content">
                                    <i class="fa-solid fa-trash-can"></i>
                                    <span>Poubelle non présentée</span>
                                </div>
                            </label>

                            <label class="radio-card">
                                <input type="radio" name="reason" value="ACCESS_DENIED">
                                <div class="card-content">
                                    <i class="fa-solid fa-ban"></i>
                                    <span>Accès impossible</span>
                                </div>
                            </label>

                            <label class="radio-card">
                                <input type="radio" name="reason" value="REFUSED">
                                <div class="card-content">
                                    <i class="fa-solid fa-hand"></i>
                                    <span>Client refuse</span>
                                </div>
                            </label>

                            <label class="radio-card">
                                <input type="radio" name="reason" value="OTHER">
                                <div class="card-content">
                                    <i class="fa-solid fa-question-circle"></i>
                                    <span>Autre</span>
                                </div>
                            </label>
                        </div>

                        <div class="form-group" id="other-description" style="display: none;">
                            <label>Description</label>
                            <textarea id="problem-description" class="form-input" rows="3" placeholder="Décrivez le problème..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeProblemModal()">Annuler</button>
                    <button class="btn-primary" onclick="submitProblemReport()">Signaler</button>
                </div>
            </div>
        </div>

        <!-- Modal de Détails Collection -->
        <div class="modal" id="collection-details-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Détails de la Collecte</h3>
                    <button class="modal-close" onclick="closeDetailsModal()">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" id="details-modal-body">
                    <!-- Content loaded dynamically -->
                </div>
            </div>
        </div>
    `;
}

export function initCollectesPage() {
    console.log('Initialisation de la page Collectes');

    window.collectesPageData = {
        currentPage: 1,
        itemsPerPage: 100, // Augmenté pour afficher toutes les collections
        currentView: 'cards',
        filters: {},
        collections: []
    };

    initFilters();
    loadCollectionsData();
    initEvents();
}

export const collectesPage = {
    render: renderCollectesPage,
    init: initCollectesPage,
};

function initFilters() {
    // Suppression de la date par défaut pour afficher toutes les données
    loadFilterOptions();

    ['filter-month', 'filter-year', 'filter-zone', 'filter-agent', 'filter-status', 'filter-passage']
        .forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', applyFilters);
            }
        });
}

async function loadFilterOptions() {
    try {
        const options = collecteService.getFilterOptions();

        const zoneSelect = document.getElementById('filter-zone');
        options.zones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone;
            option.textContent = zone;
            zoneSelect.appendChild(option);
        });

        const statusSelect = document.getElementById('filter-status');
        options.statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.value;
            option.textContent = status.label;
            statusSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des options de filtre:', error);
    }
}

async function loadCollectionsData() {
    try {
        showLoading(true);

        const filters = getCurrentFilters();
        const response = await collecteService.getCollections(filters);
        const data = response.data || response;

        window.collectesPageData.collections = data;

        updateStats(response.stats || {});
        renderCollections();
        updatePagination(response.pagination || {});

    } catch (error) {
        console.error('Erreur lors du chargement des collectes:', error);
        showErrorMessage('Erreur lors du chargement des collectes');
    } finally {
        showLoading(false);
    }
}

function updateStats(stats) {
    if (!stats) return;

    const scheduled = stats.scheduled || 0;
    const completed = stats.completed || 0;

    // Restant = Total prévu - Terminées
    // Les problèmes sont considérés comme non faites, donc elles restent dans "Restantes"
    const remaining = scheduled - completed;

    document.getElementById('stat-scheduled').textContent = scheduled;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-remaining').textContent = remaining;

    // On retire l'update de stat-problems car le card a été supprimé

    const total = scheduled || 1;
    const percentage = Math.round((completed / total) * 100);

    document.getElementById('progress-label').textContent = `${completed} / ${total}`;
    document.getElementById('progress-percentage').textContent = `${percentage}%`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

function renderPassageProgress(subscriptionId, collections, totalPassages) {
    let html = '<div class="passage-progress" style="display: flex; align-items: center; gap: 5px; margin: 10px 0; font-family: monospace;">';

    for (let i = 1; i <= totalPassages; i++) {
        const passage = collections.find(c => c.passageNumber === i);
        const isCompleted = passage && passage.status === 'COLLECTED';
        const isCurrent = passage && passage.status === 'SCHEDULED';
        const hasProblem = passage && passage.status !== 'COLLECTED' && passage.status !== 'SCHEDULED';

        let color, label;
        if (isCompleted) {
            color = '#28a745'; // Vert - complété
            label = '✓';
        } else if (isCurrent) {
            color = '#ffc107'; // Jaune - en cours
            label = i;
        } else if (hasProblem) {
            color = '#dc3545'; // Rouge - problème
            label = '✗';
        } else {
            color = '#dee2e6'; // Gris - pas encore commencé
            label = i;
        }

        html += `
            <div class="passage-circle" style="
                width: 30px; height: 30px;
                border-radius: 50%;
                background: ${color};
                color: white;
                display: flex; align-items: center; justify-content: center;
                font-size: 14px; font-weight: bold;
                transition: all 0.3s ease;
                ${isCurrent ? 'box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.4); animation: pulse 2s infinite;' : ''}
            ">
                ${label}
            </div>
        `;

        if (i < totalPassages) {
            const lineCompleted = isCompleted;
            html += `<div class="passage-line" style="flex: 1; height: 3px; background: ${lineCompleted ? '#28a745' : '#dee2e6'}; transition: all 0.3s ease;"></div>`;
        }
    }

    html += '</div>';
    
    // Ajouter l'animation pulse si elle n'existe pas
    if (!document.getElementById('passage-progress-styles')) {
        const style = document.createElement('style');
        style.id = 'passage-progress-styles';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    return html;
}

function renderCollections() {
    const container = document.getElementById('collections-container');
    const collections = window.collectesPageData.collections;

    if (!collections || collections.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-truck"></i>
                <h3>Aucune collecte trouvée</h3>
                <p>Aucune collecte ne correspond à vos critères de recherche.</p>
            </div>
        `;
        return;
    }

    if (window.collectesPageData.currentView === 'cards') {
        // Group collections by subscription to show one card per "Task"
        const grouped = {};
        collections.forEach(c => {
            const subId = c.subscriptionId;
            if (!subId) {
                console.warn('Collection sans subscriptionId:', c);
                return;
            }
            
            if (!grouped[subId]) {
                grouped[subId] = {
                    subscription: c.subscription,
                    client: c.client,
                    agent: c.agent,
                    passages: [],
                    currentCollection: null,
                    hasScheduledPassage: false
                };
            }
            grouped[subId].passages.push(c);
            // Le passage en cours est celui avec status SCHEDULED
            if (c.status === 'SCHEDULED') {
                grouped[subId].hasScheduledPassage = true;
                if (!grouped[subId].currentCollection) {
                    grouped[subId].currentCollection = c;
                }
            }
        });

        // Toutes les tâches (pas de filtre)
        const activeTasks = Object.values(grouped);
        
        // S'assurer que chaque groupe a un currentCollection pour l'affichage
        activeTasks.forEach(group => {
            if (!group.currentCollection && group.passages.length > 0) {
                // Trouver le premier passage SCHEDULED, sinon prendre le premier passage
                const scheduled = group.passages.find(p => p.status === 'SCHEDULED');
                group.currentCollection = scheduled || group.passages[0];
            }
        });

        console.log('DEBUG: Nombre de cards à afficher:', activeTasks.length);

        container.className = 'collections-grid';
        container.innerHTML = activeTasks.map(group => {
            const current = group.currentCollection;
            const formatted = collecteService.formatCollectionForDisplay(current);
            // Passages par semaine * 4 semaines = 8 passages par mois
            const passagesPerWeek = group.subscription?.service?.passages || 2;
            const totalPassages = passagesPerWeek * 4;

            return `
                <div class="collection-card ${formatted.statusBadge.class}">
                    <div class="collection-header">
                        <div class="client-info">
                            <h4>${formatted.clientName}</h4>
                            <p><i class="fa-solid fa-location-dot"></i> ${group.client?.zone || 'Zone inconnue'}</p>
                            <p><i class="fa-solid fa-phone"></i> ${group.client?.phone || 'Téléphone non renseigné'}</p>
                        </div>
                        <div class="collection-badge">
                            <span class="badge ${formatted.statusBadge.class}">${formatted.statusBadge.label}</span>
                        </div>
                    </div>

                    <div class="collection-details">
                        ${renderPassageProgress(group.subscription?.id, group.passages, totalPassages)}
                        <div class="detail-item">
                            <strong>${formatted.passageLabel}</strong>
                        </div>
                        <div class="detail-item">
                            <strong>${formatted.formattedDate}</strong>
                        </div>
                        ${group.agent ? `
                            <div class="detail-item">
                                <i class="fa-solid fa-user"></i> ${group.agent.name}
                            </div>
                        ` : ''}
                    </div>

                    <div class="collection-actions">
                        <button class="btn-view" data-action="view" data-id="${current.id}">
                            <i class="fa-solid fa-eye"></i> Voir
                        </button>
                        <button class="btn-itinerary" data-action="itinerary" data-lat="${group.client?.latitude}" data-lon="${group.client?.longitude}">
                            <i class="fa-solid fa-route"></i> Itinéraire
                        </button>
                        ${current.status !== 'COLLECTED' ? `
                            <button class="btn-success btn-lg" data-action="collect" data-id="${current.id}">
                                ✓
                            </button>
                            ${current.status === 'SCHEDULED' ? `
                            <button class="btn-danger btn-lg" data-action="problem" data-id="${current.id}">
                                ✗
                            </button>
                            ` : ''}
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        attachCollectionEvents(container);
    } else {
        renderCollectionsTable(container, collections);
    }
}

function attachCollectionEvents(container) {
    // Boutons Voir
    container.querySelectorAll('button[data-action="view"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const collectionId = btn.getAttribute('data-id');
            viewCollection(collectionId);
        });
    });
    
    // Boutons Itinéraire
    container.querySelectorAll('button[data-action="itinerary"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const lat = btn.getAttribute('data-lat');
            const lon = btn.getAttribute('data-lon');
            openItinerary(lat, lon);
        });
    });
    
    // Boutons Collecté
    container.querySelectorAll('button[data-action="collect"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const collectionId = btn.getAttribute('data-id');
            markAsCollected(collectionId);
        });
    });
    
    // Boutons Problème
    container.querySelectorAll('button[data-action="problem"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const collectionId = btn.getAttribute('data-id');
            reportProblem(collectionId);
        });
    });
}

function renderCollectionsTable(container, collections) {
    container.className = 'collections-table';
    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Zone</th>
                        <th>Passage</th>
                        <th>Date</th>
                        <th>Agent</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${collections.map(collection => {
                        const formatted = collecteService.formatCollectionForDisplay(collection);

                        return `
                            <tr>
                                <td>
                                    <div class="client-cell">
                                        <strong>${formatted.clientName}</strong>
                                        <small>${collection.client?.phone || ''}</small>
                                    </div>
                                </td>
                                <td>${collection.client?.zone || 'N/A'}</td>
                                <td>${formatted.passageLabel}</td>
                                <td>${formatted.formattedDate}</td>
                                <td>${collection.agent?.name || 'Non assigné'}</td>
                                <td>
                                    <span class="badge ${formatted.statusBadge.class}">${formatted.statusBadge.label}</span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-view btn-sm" data-action="view" data-id="${collection.id}" title="Voir">
                                            <i class="fa-solid fa-eye"></i> Voir
                                        </button>
                                        <button class="btn-itinerary btn-sm" data-action="itinerary" data-lat="${collection.client?.latitude}" data-lon="${collection.client?.longitude}" title="Itinéraire">
                                            <i class="fa-solid fa-route"></i> Itinéraire
                                        </button>
                                        ${collection.status !== 'COLLECTED' ? `
                                            <button class="btn-success btn-sm" data-action="collect" data-id="${collection.id}" title="Marquer comme collecté">
                                                ✓
                                            </button>
                                            ${collection.status === 'SCHEDULED' ? `
                                            <button class="btn-danger btn-sm" data-action="problem" data-id="${collection.id}" title="Signaler un problème">
                                                ✗
                                            </button>
                                            ` : ''}
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // Attacher les événements
    attachCollectionEvents(container);
}

window.viewCollection = async function(collectionId) {
    try {
        const modal = document.getElementById('collection-details-modal');
        const body = document.getElementById('details-modal-body');

        body.innerHTML = '<div class="text-center"><i class="fa-solid fa-spinner fa-spin"></i> Chargement...</div>';
        modal.classList.add('active');

        const response = await collecteService.getCollection(collectionId);
        const collection = response.data || response;
        const formatted = collecteService.formatCollectionForDisplay(collection);

        body.innerHTML = `
            <div class="collection-summary">
                <div class="summary-info">
                    <h4>${formatted.clientName}</h4>
                    <p><i class="fa-solid fa-location-dot"></i> ${collection.client?.zone || 'Zone inconnue'}</p>
                    <p><i class="fa-solid fa-phone"></i> ${collection.client?.phone || 'Non renseigné'}</p>
                    <p><i class="fa-solid fa-calendar"></i> ${formatted.formattedDate} - ${formatted.passageLabel}</p>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="openItinerary('${collection.client?.latitude}', '${collection.client?.longitude}')">
                    <i class="fa-solid fa-route"></i> Itinéraire
                </button>
                <button class="btn btn-outline" style="width: 100%; justify-content: center;" onclick="viewClient('${collection.clientId}')">
                    <i class="fa-solid fa-user"></i> Client
                </button>
            </div>
            <div class="status-section">
                <span class="stat-label">Statut actuel:</span>
                <span class="status-badge ${formatted.statusBadge.class}">${formatted.statusBadge.label}</span>
            </div>
        `;
    } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        document.getElementById('details-modal-body').innerHTML = '<p class="text-danger">Erreur lors du chargement des détails.</p>';
    }
};

window.closeDetailsModal = function() {
    document.getElementById('collection-details-modal').classList.remove('active');
};

window.viewClient = function(clientId) {
    window.location.hash = `client-details?id=${clientId}`;
};

window.markAsCollected = async function(collectionId) {
    try {
        let locationData = {};
        try {
            const position = await collecteService.getCurrentPosition();
            locationData = position;
        } catch (error) {
            console.log('Géolocalisation non disponible');
        }

        const result = await collecteService.markAsCollected(collectionId, locationData);
        
        // Afficher un message approprié selon la situation
        if (result.isComplete) {
            showSuccessMessage('✓ Tous les passages sont terminés !');
        } else {
            showSuccessMessage('✓ Passage validé ! Prochain passage activé.');
        }
        
        // Recharger les données pour afficher la progression
        await loadCollectionsData();

    } catch (error) {
        console.error('Erreur lors de la validation de la collecte:', error);
        showErrorMessage('Erreur lors de l\'enregistrement de la collecte');
    }
};

window.reportProblem = function(collectionId) {
    document.getElementById('problem-collection-id').value = collectionId;
    document.getElementById('problem-modal').classList.add('active');
};

window.closeProblemModal = function() {
    document.getElementById('problem-modal').classList.remove('active');
    document.getElementById('problem-form').reset();
    document.getElementById('other-description').style.display = 'none';
};

window.submitProblemReport = async function() {
    try {
        const form = document.getElementById('problem-form');
        const formData = new FormData(form);

        const problemData = {
            status: formData.get('reason'),
            reason: formData.get('reason'),
            description: formData.get('reason') === 'OTHER' ? document.getElementById('problem-description').value : null
        };

        const validation = collecteService.validateProblemReport(problemData);
        if (!validation.isValid) {
            showErrorMessage(validation.errors.join('<br>'));
            return;
        }

        const collectionId = document.getElementById('problem-collection-id').value;
        await collecteService.reportProblem(collectionId, problemData);

        showSuccessMessage('Problème signalé avec succès');
        closeProblemModal();
        loadCollectionsData();

    } catch (error) {
        console.error('Erreur lors du signalement du problème:', error);
        showErrorMessage('Erreur lors du signalement du problème');
    }
};

function getCurrentFilters() {
    return {
        search: document.getElementById('filter-search')?.value || '',
        month: document.getElementById('filter-month').value,
        year: document.getElementById('filter-year').value,
        zone: document.getElementById('filter-zone').value,
        agent: document.getElementById('filter-agent').value,
        status: document.getElementById('filter-status').value,
        passage: document.getElementById('filter-passage').value,
        page: window.collectesPageData.currentPage,
        limit: window.collectesPageData.itemsPerPage
    };
}

function getCurrentDateLabel() {
    const today = new Date();
    return today.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

window.resetFilters = function() {
    // Réinitialiser tous les filtres
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-month').value = new Date().getMonth() + 1;
    document.getElementById('filter-year').value = new Date().getFullYear();
    document.getElementById('filter-zone').value = '';
    document.getElementById('filter-agent').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-passage').value = '';
    
    // Réinitialiser la pagination
    window.collectesPageData.currentPage = 1;
    
    // Recharger les données
    loadCollectionsData();
};

function applyFilters() {
    window.collectesPageData.currentPage = 1;
    loadCollectionsData();
}

window.toggleFilters = function() {
    const content = document.getElementById('filters-content');
    const btn = document.querySelector('.filter-toggle i');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'grid';
        btn.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
        content.style.display = 'none';
        btn.classList.replace('fa-chevron-up', 'fa-chevron-down');
    }
};

function showLoading(show) {
    const container = document.getElementById('collections-container');
    if (show) {
        container.innerHTML = `
            <div class="loading-placeholder">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Chargement des collectes...</p>
            </div>
        `;
    }
}

window.refreshCollections = loadCollectionsData;
window.setCollectionsView = function(view) {
    window.collectesPageData.currentView = view;

    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    renderCollections();
};

function initEvents() {
    document.addEventListener('change', function(e) {
        if (e.target.name === 'reason') {
            const otherDescription = document.getElementById('other-description');
            if (e.target.value === 'OTHER') {
                otherDescription.style.display = 'block';
                document.getElementById('problem-description').required = true;
            } else {
                otherDescription.style.display = 'none';
                document.getElementById('problem-description').required = false;
            }
        }
    });
}

function showErrorMessage(msg) {
    alert(msg);
}

function showSuccessMessage(msg) {
    alert(msg);
}

function updatePagination(pagination) {
    const info = document.getElementById('pagination-info');
    const controls = document.getElementById('page-numbers');
    if (!info || !controls) return;

    info.textContent = `Page ${pagination.page || 1} sur ${pagination.totalPages || 1}`;
    controls.textContent = pagination.page || 1;
}

window.previousPage = function() {
    if (window.collectesPageData.currentPage > 1) {
        window.collectesPageData.currentPage--;
        loadCollectionsData();
    }
};

window.nextPage = function() {
    window.collectesPageData.currentPage++;
    loadCollectionsData();
};


// Fonction pour ouvrir l'itinéraire dans Google Maps
function openItinerary(latitude, longitude) {
    if (!latitude || !longitude || latitude === 'null' || longitude === 'null') {
        showErrorMessage('Géolocalisation non disponible pour ce client');
        return;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
}

// Fonction pour voir les détails du client
function viewClient(clientId) {
    window.location.hash = `client-details?id=${clientId}`;
}

// Export des fonctions globales pour onclick
window.openItinerary = openItinerary;
window.viewClient = viewClient;
