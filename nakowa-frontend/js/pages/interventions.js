export const interventionsPage = {
    render() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>Interventions</h1>
                    <div class="page-subtitle">Suivi et planification des interventions techniques</div>
                </div>
                <button class="btn btn-primary" id="add-intervention-btn">
                    <i class="fa-solid fa-plus"></i> Nouvelle Intervention
                </button>
            </div>

            <div class="chart-card" style="min-height: auto;">
                <div style="display: flex; gap: 15px; margin-bottom: 25px;">
                    <div style="flex: 1; position: relative;">
                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 12px; color: var(--text-muted);"></i>
                        <input type="text" class="form-input" style="padding-left: 35px;" placeholder="Rechercher une intervention...">
                    </div>
                    <select class="form-input" style="width: 200px;">
                        <option>Tous les statuts</option>
                        <option>En Attente</option>
                        <option>En Cours</option>
                        <option>Terminée</option>
                        <option>Annulée</option>
                    </select>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Service</th>
                            <th>Agent</th>
                            <th>Date Prévue</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-weight: 600;">Amadou Ibrahim</td>
                            <td>Vidange</td>
                            <td>Samuel A.</td>
                            <td>25 Oct 2025</td>
                            <td><span class="status-badge status-pending">En Attente</span></td>
                            <td>
                                <button class="btn btn-outline" style="padding: 5px 10px;"><i class="fa-solid fa-eye"></i></button>
                                <button class="btn btn-outline" style="padding: 5px 10px;"><i class="fa-solid fa-pen"></i></button>
                            </td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">Moussa Abdou</td>
                            <td>Nettoyage</td>
                            <td>Jean P.</td>
                            <td>12 Oct 2025</td>
                            <td><span class="status-badge status-done">Terminée</span></td>
                            <td>
                                <button class="btn btn-outline" style="padding: 5px 10px;"><i class="fa-solid fa-eye"></i></button>
                                <button class="btn btn-outline" style="padding: 5px 10px;"><i class="fa-solid fa-pen"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    },
    afterRender() {
        document.getElementById('add-intervention-btn')?.addEventListener('click', () => {
            alert('Ouverture du formulaire d\'intervention');
        });
    }
};
