import { userApi } from '../services/user.service.js';

export const usersPage = {
    render() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>Gestion des Utilisateurs</h1>
                    <div class="page-subtitle">Contrôle des accès et des rôles internes</div>
                </div>
                <button class="btn btn-primary" id="add-user-btn">
                    <i class="fa-solid fa-plus"></i> Ajouter un Utilisateur
                </button>
            </div>

            <div class="chart-card" style="min-height: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
                        <!-- Dynamic content -->
                    </tbody>
                </table>
            </div>

            <!-- User Modal -->
            <div id="user-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="user-modal-title">Ajouter un Utilisateur</h2>
                        <button class="btn-close" id="close-user-modal-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="user-form">
                            <input type="hidden" id="user-id">
                            <div class="form-group">
                                <label>Nom Complet *</label>
                                <input type="text" id="user-name" required maxlength="100">
                            </div>
                            <div class="form-group">
                                <label>Email *</label>
                                <input type="email" id="user-email" required maxlength="100">
                            </div>
                            <div class="form-group">
                                <label>Mot de passe *</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="password" id="user-password" required maxlength="100" style="flex: 1;">
                                    <button type="button" class="btn btn-outline" id="toggle-password-btn" title="Afficher/Masquer le mot de passe" style="padding: 8px 12px; min-width: auto;">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Confirmer le mot de passe *</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="password" id="user-password-confirm" required maxlength="100" style="flex: 1;">
                                    <button type="button" class="btn btn-outline" id="toggle-password-confirm-btn" title="Afficher/Masquer le mot de passe" style="padding: 8px 12px; min-width: auto;">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Rôle *</label>
                                <select id="user-role" required>
                                    <option value="ADMIN">Administrateur</option>
                                    <option value="AGENT">Agent</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" id="cancel-user-modal-btn">Annuler</button>
                        <button type="submit" form="user-form" class="btn btn-primary">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
    },
    async afterRender() {
        console.log('afterRender called for usersPage');
        
        const userModal = document.getElementById('user-modal');
        const userForm = document.getElementById('user-form');
        const usersTableBody = document.getElementById('users-table-body');
        
        console.log('User Modal:', userModal);
        console.log('User Form:', userForm);
        console.log('Users Table Body:', usersTableBody);
        
        let allUsers = [];

        const loadUsers = async () => {
            try {
                allUsers = await userApi.getAll();
                renderTable();
            } catch (error) {
                console.error('Erreur lors du chargement des utilisateurs:', error.message);
                alert('Erreur: ' + error.message);
            }
        };

        const renderTable = () => {
            usersTableBody.innerHTML = allUsers.map(u => `
                <tr>
                    <td style="font-weight: 600;">${u.name}</td>
                    <td>${u.email}</td>
                    <td><span class="status-badge ${u.role === 'ADMIN' ? 'status-progress' : ''}" style="${u.role === 'AGENT' ? 'background: #e2e3e5; color: #383d41;' : ''}">${u.role}</span></td>
                    <td><span class="status-badge ${u.isActive ? 'status-done' : 'status-error'}">${u.isActive ? 'Actif' : 'Inactif'}</span></td>
                    <td style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-edit-user" data-id="${u.id}" style="padding: 5px 10px;"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger btn-delete-user" data-id="${u.id}" style="padding: 5px 10px;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');

            document.querySelectorAll('.btn-edit-user').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    const user = allUsers.find(u => u.id === id);
                    if (user) {
                        document.getElementById('user-modal-title').textContent = 'Modifier l\'Utilisateur';
                        document.getElementById('user-id').value = user.id;
                        document.getElementById('user-name').value = user.name;
                        document.getElementById('user-email').value = user.email;
                        document.getElementById('user-role').value = user.role;
                        document.getElementById('user-password').value = ''; // Ne pas afficher le mot de passe
                        if (userModal) userModal.classList.add('active');
                    }
                });
            });

            document.querySelectorAll('.btn-delete-user').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    const user = allUsers.find(u => u.id === id);
                    if (!user) return;
                    
                    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`)) {
                        try {
                            await userApi.delete(id);
                            alert('Utilisateur supprimé avec succès !');
                            await loadUsers();
                        } catch (error) {
                            alert('Erreur lors de la suppression: ' + error.message);
                        }
                    }
                });
            });
        };

        await loadUsers();

        document.getElementById('add-user-btn')?.addEventListener('click', () => {
            console.log('Add user button clicked');
            document.getElementById('user-modal-title').textContent = 'Ajouter un Utilisateur';
            userForm.reset();
            document.getElementById('user-id').value = '';
            // Réinitialiser les types de champs
            document.getElementById('user-password').type = 'password';
            document.getElementById('user-password-confirm').type = 'password';
            document.getElementById('toggle-password-btn').querySelector('i').className = 'fa-solid fa-eye';
            document.getElementById('toggle-password-confirm-btn').querySelector('i').className = 'fa-solid fa-eye';
            if (userModal) userModal.classList.add('active');
        });

        document.getElementById('close-user-modal-btn')?.addEventListener('click', () => {
            if (userModal) userModal.classList.remove('active');
        });

        document.getElementById('cancel-user-modal-btn')?.addEventListener('click', () => {
            if (userModal) userModal.classList.remove('active');
        });

        // Form submission
        if (userForm) {
            userForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('User form submitted');
                
                const password = document.getElementById('user-password').value.trim();
                const passwordConfirm = document.getElementById('user-password-confirm').value.trim();
                
                // Validation : les mots de passe doivent correspondre
                if (password !== passwordConfirm) {
                    alert('Les mots de passe ne correspondent pas !');
                    return;
                }
                
                if (!password) {
                    alert('Le mot de passe est requis !');
                    return;
                }
                
                const id = document.getElementById('user-id').value;
                const userData = {
                    name: document.getElementById('user-name').value.trim(),
                    email: document.getElementById('user-email').value.trim(),
                    role: document.getElementById('user-role').value,
                    password: password
                };

                try {
                    console.log('Données utilisateur:', userData);
                    if (id) {
                        console.log('Mise à jour de l\'utilisateur:', id);
                        await userApi.update(id, userData);
                        alert('Utilisateur mis à jour avec succès !');
                    } else {
                        console.log('Création d\'un nouvel utilisateur');
                        await userApi.create(userData);
                        alert('Utilisateur créé avec succès !');
                    }
                    if (userModal) userModal.classList.remove('active');
                    await loadUsers();
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de l\'enregistrement: ' + error.message);
                }
            });
        } else {
            console.error('User form not found!');
        }

        // Toggle password visibility
        document.getElementById('toggle-password-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const passwordInput = document.getElementById('user-password');
            const btn = e.currentTarget;
            const icon = btn.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });

        // Toggle password confirm visibility
        document.getElementById('toggle-password-confirm-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const passwordConfirmInput = document.getElementById('user-password-confirm');
            const btn = e.currentTarget;
            const icon = btn.querySelector('i');
            
            if (passwordConfirmInput.type === 'password') {
                passwordConfirmInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordConfirmInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
};
