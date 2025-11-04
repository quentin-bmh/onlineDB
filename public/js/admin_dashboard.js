// public/js/admin_dashboard.js


const usersTableBody = document.getElementById('usersTableBody');
const requestsTableBody = document.getElementById('requestsTableBody'); 
const loadingIndicator = document.getElementById('loadingIndicator');
const requestsLoadingIndicator = document.getElementById('requestsLoadingIndicator'); 
const usersContainer = document.getElementById('usersContainer');
const requestsContainer = document.getElementById('requestsContainer'); 
const errorMessage = document.getElementById('errorMessage');
const requestsErrorMessage = document.getElementById('requestsErrorMessage'); 
const searchBar = document.getElementById('searchBar');
const welcomeUser = document.getElementById('welcomeUser');
const goToAppButton = document.getElementById('goToAppButton');
const logoutButton = document.getElementById('logoutButton'); 
const tabUsers = document.getElementById('tabUsers'); 
const tabRequests = document.getElementById('tabRequests'); 
const pendingCount = document.getElementById('pendingCount'); 
const usersSection = document.getElementById('users-section'); 
const requestsSection = document.getElementById('requests-section'); 

const tabCreate = document.getElementById('tabCreate');
const createSection = document.getElementById('create-section');
const createUserForm = document.getElementById('createUserForm');
const createStatusMessage = document.getElementById('createStatusMessage');


const tabPermissions = document.getElementById('tabPermissions');
const permissionsSection = document.getElementById('permissions-section');
const permissionUserSelect = document.getElementById('permissionUserSelect');
const permissionsList = document.getElementById('permissionsList');
const selectedUserInfo = document.getElementById('selectedUserInfo');
const savePermissionsButton = document.getElementById('savePermissionsButton');
const permissionsStatusMessage = document.getElementById('permissionsStatusMessage');
const permissionsPlaceholder = document.getElementById('permissionsPlaceholder');


const API_ENDPOINT = '/admin/users';
const API_PENDING_REQUESTS = '/admin/pending-requests'; 
const API_APPROVE_REQUEST = '/admin/approve-request'; 
const API_URL_LOGOUT = '/auth/logout';
const API_CREATE_USER = '/admin/create-user';
const API_DELETE_USER = '/admin/user';
// NOUVEAUX ENDPOINTS POUR LA GESTION DES PERMISSIONS
const API_PERMISSIONS_BASE = '/api/permissions';

let allUsersData = [];
let allPendingRequests = []; 
let sortState = { key: 'last_login', direction: 'desc' }; 
let currentSearchTerm = '';
let currentView = 'users';
let currentSelectedUserPermissions = []; // Stocke l'état actuel des permissions de l'utilisateur sélectionné
let currentSelectedUserId = null; // Stocke l'ID de l'utilisateur actuellement sélectionné
let isCurrentUserAdmin = false; // Indicateur pour savoir si l'utilisateur sélectionné est admin


function displayConnectedUser() {
    const username = localStorage.getItem('username');
    if (username) {
        welcomeUser.textContent = `Bienvenue, ${username}`;
    } else {
        welcomeUser.textContent = `Bienvenue`;
    }
}

function handleSort(event) {
    const header = event.currentTarget;
    const newKey = header.getAttribute('data-sort-key');
    if (sortState.key === newKey) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.key = newKey;
        sortState.direction = 'asc'; 
    }
    document.querySelectorAll('.sortable-header').forEach(h => {
        h.classList.remove('sorted-asc', 'sorted-desc');
    });
    header.classList.add(`sorted-${sortState.direction}`);

    applyFiltersAndSort();
}

function mockToggleAdmin(userId, currentStatus) {
    console.log(`[MOCK] Bascule de statut Admin pour l'utilisateur ID: ${userId} de ${currentStatus} à ${!currentStatus}`);
    fetchUsersData(); 
}

async function handleLogout() {
    try {
        const response = await fetch(API_URL_LOGOUT, {
            method: 'POST', 
        });
        window.location.href = '/login'; 
    } catch (error) {
        console.error("Erreur réseau/inattendue lors de la déconnexion:", error);
        window.location.href = '/login'; 
    }
}

function applyFiltersAndSort() {
    let data = [...allUsersData]; 
    const term = currentSearchTerm.toLowerCase();
    
    if (term) {
        data = data.filter(user => 
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
    }
    data.sort((a, b) => {
        const key = sortState.key;
        let aVal = a[key];
        let bVal = b[key];
        if (key === 'last_login' || key === 'created_at') {
            aVal = aVal ? new Date(aVal) : new Date(0); 
            bVal = bVal ? new Date(bVal) : new Date(0);
        } else if (key === 'id') {
              aVal = parseInt(aVal, 10);
              bVal = parseInt(bVal, 10);
        } else if (key === 'is_admin') {
              aVal = aVal ? 1 : 0;
              bVal = bVal ? 1 : 0;
        }

        if (aVal < bVal) return sortState.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortState.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable(data);
}

async function fetchUsersData() {
    requestsErrorMessage.classList.add('hidden');
    
    try {
        loadingIndicator.classList.remove('hidden');
        usersContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');

        const response = await fetch(API_ENDPOINT, { method: 'GET' });
        loadingIndicator.classList.add('hidden');

        if (!response.ok) {
            const error = await response.json();
            errorMessage.textContent = `Accès refusé. Code ${response.status}: ${error.message}`;
            errorMessage.classList.remove('hidden');
            if (response.status === 401 || response.status === 403) {
                setTimeout(() => window.location.href = '/login', 3000); 
            }
            return;
        }

        const data = await response.json();
        allUsersData = data.users;
        
        applyFiltersAndSort(); 
        usersContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Erreur de récupération des données administrateur (users):", error);
        loadingIndicator.classList.add('hidden');
        errorMessage.textContent = `Erreur de connexion serveur: ${error.message}`;
        errorMessage.classList.remove('hidden');
    }
}

async function handleDeleteUser(userId, buttonElement) {
    if (!confirm(`ATTENTION: Êtes-vous sûr de vouloir SUPPRIMER l'utilisateur ID ${userId}? Cette action est irréversible.`)) {
        return;
    }
    buttonElement.disabled = true;
    buttonElement.textContent = 'Suppression...';
    buttonElement.classList.remove('bg-red-600', 'hover:bg-red-700');
    buttonElement.classList.add('bg-gray-500');

    try {
        const response = await fetch(API_DELETE_USER, {
            method: 'DELETE', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(data.message);
            fetchUsersData(); 
        } else {
            alert(`Échec de la suppression (ID: ${userId}): ${data.message || 'Erreur inconnue'}`);
        }

    } catch (error) {
        console.error("Erreur réseau lors de la suppression:", error);
        alert(`Erreur de connexion serveur lors de la suppression de l'utilisateur ID ${userId}.`);
    } 
}
function renderTable(users) {
    usersTableBody.innerHTML = '';
    users.forEach(user => {
        const row = usersTableBody.insertRow();
        row.className = 'hover:bg-gray-700 transition duration-150';

        const isAdmin = user.is_admin === true;
        const statusText = isAdmin ? 
            `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-500 text-white">ADMIN</span>` : 
            `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-gray-300">User</span>`;
        const managementButton = `
            <button class="manage-permissions-btn bg-purple-600 hover:bg-purple-700 px-3 py-1 text-sm rounded transition duration-150 shadow-md" 
                    data-user-id="${user.id}" 
                    data-username="${user.username}">
                Libertés
            </button>`;
        const deleteButton = `
            <button class="delete-user-btn bg-red-600 hover:bg-red-700 px-3 py-1 text-sm rounded transition duration-150 shadow-md" 
                    data-user-id="${user.id}">
                Supprimer
            </button>`;


        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">${user.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">${user.username}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap">${statusText}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">${managementButton}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${user.last_login || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${user.created_at}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">${deleteButton}</td> 
        `;
    });
    document.querySelectorAll('.manage-permissions-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = parseInt(e.target.dataset.userId, 10);
            loadPermissionsSection(userId); 
        });
    });
    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = parseInt(e.target.dataset.userId, 10);
            handleDeleteUser(userId, e.target);
        });
    });
}


async function fetchPendingRequests() {
    errorMessage.classList.add('hidden');
    try {
        requestsLoadingIndicator.classList.remove('hidden');
        requestsContainer.classList.add('hidden');
        requestsErrorMessage.classList.add('hidden');

        const response = await fetch(API_PENDING_REQUESTS, { method: 'GET' });
        requestsLoadingIndicator.classList.add('hidden');

        if (!response.ok) {
            const error = await response.json();
            requestsErrorMessage.textContent = `Échec de récupération des demandes. Code ${response.status}: ${error.message}`;
            requestsErrorMessage.classList.remove('hidden');
            if (response.status === 401 || response.status === 403) {
                setTimeout(() => window.location.href = '/login', 3000); 
            }
            return;
        }

        const data = await response.json();
        allPendingRequests = data.pendingRequests;
        
        renderRequestsTable(allPendingRequests); 
        requestsContainer.classList.remove('hidden');
        pendingCount.textContent = allPendingRequests.length;

    } catch (error) {
        console.error("Erreur de récupération des données administrateur (requests):", error);
        requestsLoadingIndicator.classList.add('hidden');
        requestsErrorMessage.textContent = `Erreur de connexion serveur: ${error.message}`;
        requestsErrorMessage.classList.remove('hidden');
    }
}

function renderRequestsTable(requests) {
    requestsTableBody.innerHTML = '';
    if (requests.length === 0) {
        requestsTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Aucune demande en attente.</td></tr>`;
        return;
    }

    requests.forEach(request => {
        const row = requestsTableBody.insertRow();
        row.className = 'hover:bg-gray-700 transition duration-150';
        
        const date = new Date(request.request_date).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">${request.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">${request.username}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">${request.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <button class="approve-request-btn bg-green-500 hover:bg-green-600 px-3 py-1 text-sm rounded transition duration-150 shadow-md" data-request-id="${request.id}">Approuver</button>
            </td>
        `;
    });
    
    document.querySelectorAll('.approve-request-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const requestId = parseInt(e.target.dataset.requestId, 10);
            handleApproveRequest(requestId, e.target);
        });
    });
}

async function handleApproveRequest(requestId, buttonElement) {
    if (!confirm(`Confirmer l'approbation de la demande ID ${requestId} ?`)) {
        return;
    }
    buttonElement.disabled = true;
    buttonElement.textContent = 'Traitement...';
    buttonElement.classList.remove('bg-green-500');
    buttonElement.classList.add('bg-gray-500');

    try {
        const response = await fetch(API_APPROVE_REQUEST, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: requestId })
        });

        if (!response.ok) {
             const error = await response.json();
             alert(`Échec de l'approbation (ID: ${requestId}): ${error.message || 'Erreur inconnue'}`);
        } else {
             const data = await response.json();
             console.log(`[SUCCESS] Approbation réussie. Nouvel utilisateur ID: ${data.user.id}`);
        }

        fetchPendingRequests(); 
        fetchUsersData();

    } catch (error) {
        console.error("Erreur réseau lors de l'approbation:", error);
        alert(`Erreur de connexion serveur lors de l'approbation de la demande ID ${requestId}.`);
    } 
}


createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const isAdmin = document.getElementById('isAdmin').checked;
    
    const submitButton = document.getElementById('createUserButton');
    submitButton.disabled = true;
    submitButton.textContent = 'Création en cours...';
    createStatusMessage.classList.add('hidden');

    try {
        const res = await fetch(API_CREATE_USER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, is_admin: isAdmin })
        });

        const data = await res.json();
        createStatusMessage.classList.remove('hidden');
        
        if (res.ok) {
            createStatusMessage.textContent = `Utilisateur ${data.user.username} (ID: ${data.user.id}) créé avec succès.`;
            createStatusMessage.style.color = 'lightgreen';
            createUserForm.reset(); 
            
            if (currentView === 'users') { 
                fetchUsersData(); 
            }

        } else {
            createStatusMessage.textContent = `Échec de la création: ${data.message || 'Erreur inconnue.'}`;
            createStatusMessage.style.color = 'red';
        }

    } catch (err) {
        console.error("Erreur réseau lors de la création d'utilisateur:", err);
        createStatusMessage.textContent = "Erreur réseau ou serveur.";
        createStatusMessage.style.color = 'red';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Créer l\'Utilisateur';
    }
});


function populateUserSelect() {
    permissionUserSelect.innerHTML = '<option value="">-- Sélectionner un utilisateur --</option>';
    allUsersData.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.username}`;
        permissionUserSelect.appendChild(option);
    });
}

/**
 * Récupère les permissions actuelles de l'utilisateur via l'API.
 * @param {number} userId 
 * @returns {Promise<Object>} L'objet des permissions ou null en cas d'erreur.
 */
async function fetchUserPermissions(userId) {
    permissionsList.innerHTML = '';
    permissionsPlaceholder.classList.remove('hidden');
    selectedUserInfo.textContent = "Chargement des libertés...";
    savePermissionsButton.disabled = true;
    permissionsStatusMessage.classList.add('hidden');

    try {
        const response = await fetch(`${API_PERMISSIONS_BASE}/${userId}`, { method: 'GET' });
        const data = await response.json();
        
        if (!response.ok) {
            selectedUserInfo.textContent = `Erreur: ${data.message || 'Échec de la récupération des libertés.'}`;
            return null;
        }

        const user = allUsersData.find(u => parseInt(u.id) === userId) || data.user;
        
        // Mettre à jour l'état global
        currentSelectedUserId = userId;
        currentSelectedUserPermissions = data.permissions;
        isCurrentUserAdmin = data.user.is_admin;

        selectedUserInfo.textContent = `Gestion des libertés pour : ${user.username} (${user.email})`;
        
        return data.permissions;

    } catch (error) {
        console.error("Erreur réseau lors de la récupération des permissions:", error);
        selectedUserInfo.textContent = "Erreur réseau ou serveur.";
        return null;
    }
}

/**
 * Affiche la liste des permissions avec les états des checkbox.
 * @param {Array<Object>} permissions La liste des permissions et leur état `granted`.
 */
function renderPermissions(permissions) {
    permissionsList.innerHTML = '';
    permissionsPlaceholder.classList.add('hidden');

    // Si l'utilisateur est admin, on désactive les modifications
    if (isCurrentUserAdmin) {
        permissionsList.innerHTML = `<p class="text-red-400 text-center py-4 font-semibold">
            Impossible de modifier les libertés d'un administrateur (toutes sont accordées).
        </p>`;
        savePermissionsButton.disabled = true;
        return;
    }

    permissions.forEach(p => {
        const isChecked = p.granted ? 'checked' : '';
        const html = `
            <div class="flex justify-between items-center py-2 px-3 bg-gray-700 rounded-lg">
                <label for="perm-${p.id}" class="text-gray-300 font-medium">${p.label}</label>
                <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="perm-${p.id}" data-perm-code="${p.id}" id="perm-${p.id}" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer ${isChecked ? 'right-0 border-green-400 bg-green-400' : 'border-gray-500 bg-gray-500'}" ${isChecked} />
                    <label for="perm-${p.id}" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                </div>
            </div>
        `;
        permissionsList.innerHTML += html;
    });
    
    document.querySelectorAll('.toggle-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            e.target.classList.remove('right-0', 'border-green-400', 'bg-green-400', 'border-gray-500', 'bg-gray-500');
            if (isChecked) {
                e.target.classList.add('right-0', 'border-green-400', 'bg-green-400');
            } else {
                e.target.classList.add('border-gray-500', 'bg-gray-500');
            }
            savePermissionsButton.disabled = false; // Réactiver le bouton d'enregistrement
        });
    });

    savePermissionsButton.disabled = true; // Désactiver par défaut, il sera réactivé lors d'un changement
}


/**
 * Gère l'enregistrement des permissions mises à jour.
 */
async function handleSavePermissions() {
    if (!currentSelectedUserId || isCurrentUserAdmin) return;

    // 1. Collecter l'état actuel des permissions dans l'interface
    const newPermissionsState = [];
    document.querySelectorAll('.toggle-checkbox').forEach(checkbox => {
        const permCode = checkbox.getAttribute('data-perm-code');
        const granted = checkbox.checked;
        newPermissionsState.push({ code: permCode, granted: granted });
    });

    savePermissionsButton.disabled = true;
    savePermissionsButton.textContent = 'Enregistrement...';
    permissionsStatusMessage.classList.add('hidden');

    try {
        const response = await fetch(`${API_PERMISSIONS_BASE}/${currentSelectedUserId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions: newPermissionsState })
        });

        const data = await response.json();
        permissionsStatusMessage.classList.remove('hidden');

        if (response.ok) {
            permissionsStatusMessage.textContent = data.message;
            permissionsStatusMessage.style.color = 'lightgreen';
            // Recharger pour s'assurer que l'état local correspond à la BDD après un succès
            loadPermissionsSection(currentSelectedUserId, false); 
        } else {
            permissionsStatusMessage.textContent = `Échec de l'enregistrement: ${data.message || 'Erreur inconnue.'}`;
            permissionsStatusMessage.style.color = 'red';
            savePermissionsButton.disabled = false; // Réactiver si échec
        }

    } catch (error) {
        console.error("Erreur réseau lors de la sauvegarde des permissions:", error);
        permissionsStatusMessage.textContent = "Erreur réseau ou serveur lors de l'enregistrement.";
        permissionsStatusMessage.style.color = 'red';
        savePermissionsButton.disabled = false; // Réactiver si échec
    } finally {
        savePermissionsButton.textContent = 'Enregistrer les Modifications';
    }
}


/**
 * Charge la section de gestion des permissions.
 * @param {number|null} userId L'ID utilisateur à présélectionner.
 * @param {boolean} fetchData Vrai si la liste des utilisateurs doit être rechargée.
 */
function loadPermissionsSection(userId = null, fetchData = true) {
    switchTab('permissions-section'); 
    
    if (allUsersData.length === 0 || fetchData) {
        fetchUsersData().then(() => {
            populateUserSelect();
            handleSelection(userId);
        });
    } else {
        populateUserSelect();
        handleSelection(userId);
    }
}


/**
 * Gère la sélection d'un utilisateur et charge ses permissions.
 * @param {number|null} id L'ID utilisateur sélectionné.
 */
async function handleSelection(id) {
    // Réinitialiser les états
    currentSelectedUserId = null;
    isCurrentUserAdmin = false;
    currentSelectedUserPermissions = [];

    if (id) {
        permissionUserSelect.value = id;
        const permissions = await fetchUserPermissions(id);
        if (permissions) {
            renderPermissions(permissions);
        } else {
             // Afficher le placeholder et désactiver le bouton en cas d'échec
            permissionsPlaceholder.classList.remove('hidden');
            permissionsList.innerHTML = '';
            savePermissionsButton.disabled = true;
        }

    } else {
        selectedUserInfo.textContent = "";
        permissionsList.innerHTML = '';
        permissionsPlaceholder.classList.remove('hidden');
        savePermissionsButton.disabled = true;
    }
}


// admin_dashboard.js (Extraction de la partie corrigée)

function switchTab(targetSection) {
    currentView = targetSection === 'users-section' ? 'users' : 
                  targetSection === 'requests-section' ? 'requests' : 
                  targetSection === 'create-section' ? 'create' :
                  'permissions';
    usersSection.classList.add('hidden');
    requestsSection.classList.add('hidden');
    createSection.classList.add('hidden'); 
    permissionsSection.classList.add('hidden');
    document.getElementById(targetSection).classList.remove('hidden');

    tabUsers.classList.remove('active');
    tabRequests.classList.remove('active');
    tabCreate.classList.remove('active');
    tabPermissions.classList.remove('active');
    if (targetSection === 'users-section') {
        tabUsers.classList.add('active'); 
        searchBar.classList.remove('hidden');
        fetchUsersData(); 
    } else if (targetSection === 'requests-section') {
        tabRequests.classList.add('active'); 
        searchBar.classList.add('hidden'); 
        fetchPendingRequests(); 
    } else if (targetSection === 'create-section') { 
        tabCreate.classList.add('active'); 
        searchBar.classList.add('hidden'); 
    } else if (targetSection === 'permissions-section') { 
        tabPermissions.classList.add('active');
        searchBar.classList.add('hidden'); 
        
        // CORRECTION 1 : Retirer l'appel récursif à loadPermissionsSection.
        // On assure uniquement que la liste des utilisateurs pour le SELECT est chargée.
        if (allUsersData.length === 0) {
            fetchUsersData().then(() => {
                populateUserSelect();
            });
        } else {
             populateUserSelect();
        }
    }
    errorMessage.classList.add('hidden');
    requestsErrorMessage.classList.add('hidden');
    createStatusMessage.classList.add('hidden');
    permissionsStatusMessage.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    displayConnectedUser();
    switchTab('users-section'); 
    fetchPendingRequests(); 
    tabUsers.addEventListener('click', () => switchTab('users-section'));
    tabRequests.addEventListener('click', () => switchTab('requests-section'));
    tabCreate.addEventListener('click', () => switchTab('create-section'));
    
    // CORRECTION 2 : Lors du clic sur l'onglet, on appelle loadPermissionsSection() 
    // qui va d'abord appeler switchTab, puis charger les données (une seule boucle).
    tabPermissions.addEventListener('click', () => loadPermissionsSection()); 
    
    permissionUserSelect.addEventListener('change', (e) => {
        const userId = parseInt(e.target.value, 10);
        handleSelection(userId);
    });
    
    // NOUVEAU: Écouteur pour la sauvegarde
    savePermissionsButton.addEventListener('click', handleSavePermissions);

    searchBar.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        applyFiltersAndSort();
    });

    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', handleSort);
    });

    goToAppButton.addEventListener('click', () => {
        window.location.href = '/'; 
    });
    
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Initialiser les icônes de tri
    document.querySelector(`th[data-sort-key="${sortState.key}"]`).classList.add(`sorted-${sortState.direction}`);
});