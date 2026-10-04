export const importPage = {
    render() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>Importation des Données</h1>
                    <div class="page-subtitle">Migration depuis Excel vers le système Nakowa</div>
                </div>
            </div>

            <div class="chart-card" style="max-width: 800px; margin: 0 auto; text-align: center;">
                <div id="drop-zone" style="border: 2px dashed var(--border-color); padding: 50px; border-radius: var(--radius); cursor: pointer; transition: all 0.2s; background: var(--bg-color);">
                    <i class="fa-solid fa-file-excel" style="font-size: 50px; color: var(--primary-color); margin-bottom: 20px;"></i>
                    <h3>Déposez votre fichier Excel ici</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Formats acceptés : .xlsx, .xls, .csv</p>
                    <input type="file" id="file-input" style="display: none;" accept=".xlsx, .xls, .csv">
                    <button class="btn btn-primary">Choisir un fichier</button>
                </div>

                <div id="preview-section" style="display: none; margin-top: 30px; text-align: left;">
                    <h3 style="margin-bottom: 15px;">Aperçu de l'importation</h3>
                    <div id="import-stats" style="display: flex; gap: 15px; margin-bottom: 20px;">
                        <div class="stat-badge badge-success" id="valid-count">0 valides</div>
                        <div class="stat-badge badge-danger" id="invalid-count">0 erreurs</div>
                    </div>
                    
                    <div style="overflow-x: auto; margin-bottom: 20px;">
                        <table class="data-table" id="preview-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Téléphone</th>
                                    <th>Zone</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button class="btn btn-outline" id="cancel-import">Annuler</button>
                        <button class="btn btn-primary" id="confirm-import">Importer les données valides</button>
                    </div>
                </div>
            </div>
        `;
    },
    afterRender() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        dropZone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFileUpload(file);
        });

        document.getElementById('cancel-import')?.addEventListener('click', () => {
            document.getElementById('preview-section').style.display = 'none';
            dropZone.style.display = 'block';
        });

        document.getElementById('confirm-import')?.addEventListener('click', async () => {
            alert('L\'importation a été lancée. Vous recevrez une notification une fois terminée.');
            window.location.hash = 'dashboard';
        });
    },
    async handleFileUpload(file) {
        // Simulation de l'analyse du fichier
        document.getElementById('drop-zone').style.display = 'none';
        document.getElementById('preview-section').style.display = 'block';

        const mockData = [
            { name: 'Amina Abdou', phone: '90000000', zone: 'Yantala', status: 'OK' },
            { name: 'Moussa Diallo', phone: 'invalid', zone: 'Plateau', status: 'ERROR' },
            { name: 'Jean Pierre', phone: '91111111', zone: 'Sora', status: 'OK' },
        ];

        const tbody = document.querySelector('#preview-table tbody');
        tbody.innerHTML = mockData.map(row => `
            <tr style="${row.status === 'ERROR' ? 'background: #fff5f5;' : ''}">
                <td>${row.name}</td>
                <td>${row.phone}</td>
                <td>${row.zone}</td>
                <td><span class="status-badge ${row.status === 'OK' ? 'status-done' : 'status-pending'}">${row.status}</span></td>
            </tr>
        `).join('');

        document.getElementById('valid-count').textContent = `2 valides`;
        document.getElementById('invalid-count').textContent = `1 erreur`;
    }
};
