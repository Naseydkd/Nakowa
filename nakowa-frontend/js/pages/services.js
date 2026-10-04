import { serviceApi } from '../services/service.service.js';

export const servicesPage = {
    render() {
        return `
            <!-- SECTION 1: GESTION DES SERVICES -->
            <div class="page-header">
                <div class="page-title">
                    <h1>Gestion des Services</h1>
                    <div class="page-subtitle">Définissez les types d'interventions proposées</div>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="search-services" placeholder="Rechercher un service..." style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius); flex: 1; min-width: 200px;">
                    <button class="btn btn-primary" id="add-service-btn">
                        <i class="fa-solid fa-plus"></i> Ajouter un Service
                    </button>
                </div>
            </div>

            <div class="chart-card" style="min-height: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nom du Service</th>
                            <th>Type</th>
                            <th>Passages</th>
                            <th>Prix Unitaire</th>
                            <th>Unité</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="services-table-body">
                        <!-- Dynamic content -->
                    </tbody>
                </table>
            </div>

            <!-- SECTION 2: IMPORT CLIENTS -->
            <div style="margin-top: 40px;">
                <div class="page-header">
                    <div class="page-title">
                        <h2 style="margin: 0;">Importer des Clients</h2>
                        <div class="page-subtitle" style="margin-top: 5px;">Importez vos clients en masse depuis un fichier Excel</div>
                    </div>
                </div>

                <div class="chart-card" style="min-height: auto;">
                    <div style="padding: 20px;">
                        <h3 style="margin-top: 0; margin-bottom: 15px;">Format du Fichier</h3>
                        <div style="background: var(--bg-color); padding: 15px; border-radius: var(--radius); margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
                            <strong>Colonnes requises:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li><strong>Nom</strong> (obligatoire) - Prénom et Nom du client</li>
                                <li><strong>Téléphone</strong> (optionnel) - Numéro de téléphone (min 7 caractères)</li>
                                <li><strong>Zone</strong> (optionnel) - Zone géographique du client</li>
                                <li><strong>Email</strong> (optionnel) - Adresse email du client</li>
                            </ul>
                            <strong>✨ Conseil:</strong> Les colonnes sont détectées automatiquement. Vos colonnes peuvent s'appeler "Nom", "Telephone", "Zone" ou autre - le système trouvera ce qu'il faut !
                        </div>

                        <div id="drop-zone" style="border: 2px dashed var(--border-color); padding: 40px; border-radius: var(--radius); cursor: pointer; text-align: center; transition: all 0.2s; margin-bottom: 20px;">
                            <i class="fa-solid fa-file-excel" style="font-size: 40px; color: var(--primary-color); margin-bottom: 15px; display: block;"></i>
                            <h4 style="margin: 15px 0;">Déposez votre fichier Excel ici</h4>
                            <p style="color: var(--text-muted); margin: 10px 0;">Formats acceptés: .xlsx, .xls, .csv</p>
                            <input type="file" id="excel-file-input" style="display: none;" accept=".xlsx, .xls, .csv">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('excel-file-input').click();" style="margin-top: 10px;">
                                <i class="fa-solid fa-folder-open"></i> Choisir un fichier
                            </button>
                        </div>

                        <div id="preview-section" style="display: none;">
                            <h4>Aperçu de l'importation</h4>
                            <div id="import-stats" style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                                <span class="status-badge status-done" id="valid-count">0 valides</span>
                                <span class="status-badge status-cancelled" id="invalid-count">0 erreurs</span>
                            </div>
                            <div style="overflow-x: auto; max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius);">
                                <table class="data-table" id="preview-table">
                                    <thead>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Téléphone</th>
                                            <th>Activité</th>
                                            <th>Nº</th>
                                            <th>Montant (XOF)</th>
                                            <th>Adresse</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                                <button type="button" class="btn btn-outline" id="cancel-import-btn">Annuler</button>
                                <button type="button" class="btn btn-primary" id="confirm-import-btn">
                                    <i class="fa-solid fa-check"></i> Importer les données
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Service Modal -->
            <div id="service-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modal-title">Ajouter un Service</h2>
                        <button class="btn-close" id="close-modal-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="service-form">
                            <input type="hidden" id="service-id">
                            <div class="form-group">
                                <label>Nom du Service *</label>
                                <input type="text" id="service-nom" required maxlength="100">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Type de Service *</label>
                                    <select id="service-type" required>
                                        <option value="VIDANGE">Vidange</option>
                                        <option value="NETTOYAGE">Nettoyage</option>
                                        <option value="ASSAINISSEMENT">Assainissement</option>
                                        <option value="CURAGE">Curage</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Nombre de Passages *</label>
                                    <input type="number" id="service-passages" min="1" value="2" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Prix Unitaire *</label>
                                    <input type="number" id="service-prix" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label>Unité *</label>
                                    <input type="text" id="service-unite" placeholder="ex: par fosse" required maxlength="20">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="service-description" maxlength="500"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Durée Estimée (min)</label>
                                <input type="number" id="service-duree" min="0">
                            </div>
                            <div class="form-group">
                                <label>Matériels Nécessaires</label>
                                <textarea id="service-materiels" maxlength="500"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Précautions</label>
                                <textarea id="service-precautions" maxlength="500"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" id="cancel-modal-btn">Annuler</button>
                        <button type="submit" form="service-form" class="btn btn-primary">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
    },
    async afterRender() {
        console.log('afterRender called for servicesPage');
        
        const modal = document.getElementById('service-modal');
        const form = document.getElementById('service-form');
        const tableBody = document.getElementById('services-table-body');
        
        console.log('Modal:', modal);
        console.log('Form:', form);
        console.log('TableBody:', tableBody);
        
        let allServices = [];
        let filteredServices = [];

        const loadServices = async () => {
            try {
                allServices = await serviceApi.getAll();
                filteredServices = [...allServices];
                renderTable();
            } catch (error) {
                alert('Erreur lors du chargement des services: ' + error.message);
            }
        };

        const renderTable = () => {
            tableBody.innerHTML = filteredServices.map(s => `
                <tr>
                    <td style="font-weight: 600;">${s.nom}</td>
                    <td>${s.type}</td>
                    <td>${s.passages || 2}</td>
                    <td>${s.prixUnitaire} FCFA</td>
                    <td>${s.unite}</td>
                    <td><span class="status-badge ${s.isActive ? 'status-done' : 'status-error'}">${s.isActive ? 'Actif' : 'Inactif'}</span></td>
                    <td style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-edit" data-id="${s.id}" title="Modifier" style="padding: 5px 10px;"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-toggle-status" data-id="${s.id}" title="${s.isActive ? 'Désactiver' : 'Activer'}" style="padding: 5px 10px; background: ${s.isActive ? '#fff5f5' : '#f5fff5'}; border-color: ${s.isActive ? '#ff6b6b' : '#51cf66'};"><i class="fa-solid ${s.isActive ? 'fa-pause' : 'fa-play'}"></i></button>
                        <button class="btn btn-danger btn-delete" data-id="${s.id}" title="Supprimer" style="padding: 5px 10px;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');

            attachRowEventListeners();
        };

        const attachRowEventListeners = () => {
            // Éditer
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    const s = await serviceApi.getById(id);
                    const modal = document.getElementById('service-modal');
                    
                    document.getElementById('modal-title').textContent = 'Modifier le Service';
                    document.getElementById('service-id').value = s.id;
                    document.getElementById('service-nom').value = s.nom;
                    document.getElementById('service-type').value = s.type;
                    document.getElementById('service-passages').value = s.passages || 2;
                    document.getElementById('service-prix').value = s.prixUnitaire;
                    document.getElementById('service-unite').value = s.unite;
                    document.getElementById('service-description').value = s.description || '';
                    document.getElementById('service-duree').value = s.dureeEstimee || '';
                    document.getElementById('service-materiels').value = s.materielsNecessaires || '';
                    document.getElementById('service-precautions').value = s.precautions || '';
                    
                    if (modal) modal.classList.add('active');
                });
            });

            // Activer/Désactiver
            document.querySelectorAll('.btn-toggle-status').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    const service = allServices.find(s => s.id === id);
                    if (service) {
                        try {
                            await serviceApi.update(id, { ...service, isActive: !service.isActive });
                            await loadServices();
                        } catch (error) {
                            alert('Erreur lors de la mise à jour du statut: ' + error.message);
                        }
                    }
                });
            });

            // Supprimer
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
                        try {
                            await serviceApi.delete(id);
                            await loadServices();
                        } catch (error) {
                            alert('Erreur lors de la suppression: ' + error.message);
                        }
                    }
                });
            });
        };

        await loadServices();

        // Recherche
        document.getElementById('search-services')?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filteredServices = allServices.filter(s => 
                s.nom.toLowerCase().includes(query) ||
                s.type.toLowerCase().includes(query) ||
                s.unite.toLowerCase().includes(query)
            );
            renderTable();
        });

        document.getElementById('add-service-btn')?.addEventListener('click', () => {
            const modal = document.getElementById('service-modal');
            const form = document.getElementById('service-form');
            console.log('Add button clicked. Modal:', modal, 'Form:', form);
            
            if (!modal || !form) {
                console.error('Modal or form not found!');
                alert('Erreur: éléments HTML manquants');
                return;
            }
            
            document.getElementById('modal-title').textContent = 'Ajouter un Service';
            form.reset();
            document.getElementById('service-id').value = '';
            modal.classList.add('active');
        });

        document.getElementById('close-modal-btn')?.addEventListener('click', () => {
            const modal = document.getElementById('service-modal');
            if (modal) modal.classList.remove('active');
        });

        document.getElementById('cancel-modal-btn')?.addEventListener('click', () => {
            const modal = document.getElementById('service-modal');
            if (modal) modal.classList.remove('active');
        });

        // Form listener - attach à n'importe quel formulaire trouvé
        const attachFormListener = () => {
            const form = document.getElementById('service-form');
            if (!form) {
                console.error('Form element not found - retrying in 100ms');
                setTimeout(attachFormListener, 100);
                return;
            }
            
            console.log('Form listener attached successfully');
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Form submitted');
                
                const modal = document.getElementById('service-modal');
                const id = document.getElementById('service-id').value;
                
                // Parser les données avec gestion correcte des nombres
                const dureeValue = document.getElementById('service-duree').value;
                const dureeEstimee = dureeValue ? parseInt(dureeValue, 10) : undefined;
                
                const data = {
                    nom: document.getElementById('service-nom').value.trim(),
                    type: document.getElementById('service-type').value,
                    passages: parseInt(document.getElementById('service-passages').value, 10),
                    prixUnitaire: parseFloat(document.getElementById('service-prix').value),
                    unite: document.getElementById('service-unite').value.trim(),
                };
                
                // Ajouter les champs optionnels seulement s'ils ont une valeur
                const description = document.getElementById('service-description').value.trim();
                if (description) data.description = description;
                
                if (dureeEstimee) data.dureeEstimee = dureeEstimee;
                
                const materiels = document.getElementById('service-materiels').value.trim();
                if (materiels) data.materielsNecessaires = materiels;
                
                const precautions = document.getElementById('service-precautions').value.trim();
                if (precautions) data.precautions = precautions;

                try {
                    console.log('Données envoyées:', data);
                    if (id) {
                        console.log('Mise à jour du service:', id);
                        await serviceApi.update(id, data);
                    } else {
                        console.log('Création d\'un nouveau service');
                        await serviceApi.create(data);
                    }
                    const modal = document.getElementById('service-modal');
                    if (modal) modal.classList.remove('active');
                    await loadServices();
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de l\'enregistrement: ' + error.message);
                }
            });
        };
        
        attachFormListener();

        // ========== IMPORT EXCEL ==========
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('excel-file-input');
        const previewSection = document.getElementById('preview-section');
        let importedData = [];

        // Vérification que les éléments existent
        if (!dropZone || !fileInput || !previewSection) {
            console.error('Import Excel elements not found:', { dropZone, fileInput, previewSection });
            return;
        }
        
        console.log('✅ Import Excel initialized successfully');

        const parseExcelFile = async (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const { read, utils } = await import('xlsx');
                        const data = new Uint8Array(e.target.result);
                        const workbook = read(data, { type: 'array' });
                        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                        const rows = utils.sheet_to_json(firstSheet, { header: 1 });
                        
                        // Traiter les données
                        const headerRow = rows[0];
                        const dataRows = rows.slice(1);
                        
                        console.log('Headers found:', headerRow);
                        
                        // Mapper les colonnes (case-insensitive)
                        const nameIndex = headerRow.findIndex(h => 
                            h && String(h).toLowerCase().includes('nom')
                        );
                        const phoneIndex = headerRow.findIndex(h => 
                            h && (String(h).toLowerCase().includes('téléphone') || String(h).toLowerCase().includes('phone'))
                        );
                        const activityIndex = headerRow.findIndex(h => 
                            h && (String(h).toLowerCase().includes('activité') || String(h).toLowerCase().includes('activity'))
                        );
                        const numberIndex = headerRow.findIndex(h => 
                            h && (String(h).toLowerCase().includes('nº') || String(h).toLowerCase().includes('numero'))
                        );
                        const amountIndex = headerRow.findIndex(h => 
                            h && (String(h).toLowerCase().includes('montant') || String(h).toLowerCase().includes('amount'))
                        );
                        const addressIndex = headerRow.findIndex(h => 
                            h && (String(h).toLowerCase().includes('adresse') || String(h).toLowerCase().includes('address'))
                        );
                        
                        console.log('Column indices:', { nameIndex, phoneIndex, activityIndex, numberIndex, amountIndex, addressIndex });
                        
                        const parsed = dataRows
                            .filter(row => row && row[nameIndex])
                            .map((row, idx) => ({
                                id: idx,
                                name: String(row[nameIndex] || '').trim(),
                                phone: String(row[phoneIndex] || '').trim(),
                                activity: String(row[activityIndex] || '').trim(),
                                number: String(row[numberIndex] || '').trim(),
                                defaultAmount: row[amountIndex] ? parseFloat(row[amountIndex]) || 2000 : 2000,
                                address: String(row[addressIndex] || '').trim(),
                                status: validateRow(row, nameIndex, phoneIndex)
                            }));
                        
                        console.log('✅ Fichier Excel parsé:', parsed);
                        resolve(parsed);
                    } catch (err) {
                        console.error('❌ Erreur parsing:', err);
                        reject(new Error('Erreur lors de la lecture du fichier: ' + err.message));
                    }
                };
                reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
                reader.readAsArrayBuffer(file);
            });
        };

        const validateRow = (row, nameIdx, phoneIdx) => {
            if (!row[nameIdx]) return 'ERROR';
            if (row[phoneIdx] && row[phoneIdx].toString().length < 7) return 'ERROR';
            return 'OK';
        };

        const displayPreview = (data) => {
            const validCount = data.filter(d => d.status === 'OK').length;
            const invalidCount = data.filter(d => d.status === 'ERROR').length;

            const tbody = document.querySelector('#preview-table tbody');
            tbody.innerHTML = data.map(row => `
                <tr style="${row.status === 'ERROR' ? 'background: #fff5f5;' : ''}">
                    <td>${row.name}</td>
                    <td>${row.phone}</td>
                    <td>${row.activity || '-'}</td>
                    <td>${row.number || '-'}</td>
                    <td style="text-align: right;">${row.defaultAmount.toLocaleString('fr-FR')} XOF</td>
                    <td>${row.address || '-'}</td>
                    <td><span class="status-badge ${row.status === 'OK' ? 'status-done' : 'status-cancelled'}">${row.status === 'OK' ? 'OK' : 'ERREUR'}</span></td>
                </tr>
            `).join('');

            document.getElementById('valid-count').textContent = `${validCount} valides`;
            document.getElementById('invalid-count').textContent = `${invalidCount} erreurs`;
        };

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--primary-color)';
            dropZone.style.background = 'rgba(66, 135, 245, 0.05)';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'var(--border-color)';
            dropZone.style.background = 'transparent';
        });
        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-color)';
            dropZone.style.background = 'transparent';
            const file = e.dataTransfer.files[0];
            if (file) {
                try {
                    importedData = await parseExcelFile(file);
                    dropZone.style.display = 'none';
                    previewSection.style.display = 'block';
                    displayPreview(importedData);
                } catch (error) {
                    alert('Erreur: ' + error.message);
                }
            }
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    importedData = await parseExcelFile(file);
                    dropZone.style.display = 'none';
                    previewSection.style.display = 'block';
                    displayPreview(importedData);
                } catch (error) {
                    alert('Erreur: ' + error.message);
                }
            }
        });

        document.getElementById('cancel-import-btn')?.addEventListener('click', () => {
            dropZone.style.display = 'block';
            dropZone.style.borderColor = 'var(--border-color)';
            dropZone.style.background = 'transparent';
            previewSection.style.display = 'none';
            fileInput.value = '';
            importedData = [];
        });

        document.getElementById('confirm-import-btn')?.addEventListener('click', async () => {
            const validData = importedData.filter(d => d.status === 'OK');
            if (validData.length === 0) {
                alert('Aucune donnée valide à importer');
                return;
            }

            try {
                console.log('📤 Envoi des données:', validData);
                const response = await fetch('http://localhost:3000/api/clients/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('nakowa_token')}`
                    },
                    body: JSON.stringify({ clients: validData })
                });

                console.log('📥 Status réponse:', response.status, response.statusText);
                
                // Lire le texte en premier
                const responseText = await response.text();
                console.log('📥 Texte réponse:', responseText);
                
                let responseData;
                try {
                    responseData = responseText ? JSON.parse(responseText) : {};
                } catch (e) {
                    console.error('❌ Erreur parsing JSON:', e);
                    responseData = {};
                }

                if (!response.ok) {
                    throw new Error(responseData.message || `Erreur HTTP ${response.status}`);
                }

                alert(`${responseData.success || validData.length} client(s) importé(s) avec succès !`);
                if (responseData.failed && responseData.failed > 0) {
                    console.warn(`⚠️ ${responseData.failed} client(s) en erreur:`, responseData.errors);
                }
                
                dropZone.style.display = 'block';
                previewSection.style.display = 'none';
                fileInput.value = '';
                importedData = [];
            } catch (error) {
                console.error('❌ Erreur import:', error);
                alert('Erreur lors de l\'importation: ' + error.message);
            }
        });
    }
};
