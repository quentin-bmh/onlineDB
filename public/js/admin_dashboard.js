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

// NOUVELLES CONSTANTES ADV
const tabAdv = document.getElementById('tabAdv');
const advSection = document.getElementById('adv-section');
const advTableBody = document.getElementById('advTableBody');
const advLoadingIndicator = document.getElementById('advLoadingIndicator');
const advContainer = document.getElementById('advContainer');
const advErrorMessage = document.getElementById('advErrorMessage');


const API_ENDPOINT = '/admin/users';
const API_PENDING_REQUESTS = '/admin/pending-requests'; 
const API_APPROVE_REQUEST = '/admin/approve-request'; 
const API_URL_LOGOUT = '/auth/logout';
const API_CREATE_USER = '/admin/create-user';
const API_DELETE_USER = '/admin/user';
const API_PERMISSIONS_BASE = '/api/permissions';
// NOUVEAUX ENDPOINTS ADV
const API_ADV_LIST = '/api/general_data'; // Route GET qui renvoie tous les ADVs si pas de query param
const API_ADV_DELETE = '/api/adv'; // Base URL pour DELETE /api/adv/:advName

let allUsersData = [];
let allPendingRequests = []; 
let allAdvData = [];
let allPlanFiles = [];
let sortState = { key: 'last_login', direction: 'desc' }; 
let currentSearchTerm = '';
let currentView = 'users';
let currentSelectedUserPermissions = []; 
let currentSelectedUserId = null; 
let isCurrentUserAdmin = false; 


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

async function fetchPlanFiles() {
    try {
        // Cette route existe déjà via votre downloadRoutes.js (/list -> documentController.listDocuments)
        const response = await fetch('/api/webdav/list');
        if (response.ok) {
            allPlanFiles = await response.json();
            console.log("Plans récupérés :", allPlanFiles.length);
        }
    } catch (e) {
        console.error("Erreur récupération liste des plans", e);
        allPlanFiles = []; // En cas d'erreur, on assume vide pour ne pas bloquer l'affichage
    }
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

async function handleDashboardUpload(file, advName, labelElement) {
    // Sauvegarde du contenu pour restauration en cas d'erreur
    const originalContent = labelElement.innerHTML;
    const originalClasses = labelElement.className; // Sauvegarde des classes (couleur originale)
    
    // Feedback visuel : Spinner
    labelElement.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`;
    labelElement.classList.add('cursor-not-allowed', 'opacity-50');

    const formData = new FormData();
    formData.append('plan', file);
    formData.append('advName', advName);

    try {
        const response = await fetch('/api/webdav/upload_plan', { 
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Erreur serveur lors de l'upload");

        // --- SUCCÈS ---

        // 1. Nettoyage de TOUTES les classes de couleur possibles
        labelElement.classList.remove(
            'bg-blue-600', 'hover:bg-blue-700', 
            'bg-orange-500', 'hover:bg-orange-600', 
            'bg-green-500', 'cursor-not-allowed', 'opacity-50'
        );
        
        // 2. Flash Vert de succès temporaire
        labelElement.classList.add('bg-green-500');
        labelElement.innerHTML = '✓';

        // 3. Mise à jour de la liste locale (IMPORTANT pour que le prochain render soit correct)
        const normalizedName = advName.trim().replace(/\s+/g, '_');
        if (!allPlanFiles.some(f => f.name.includes(normalizedName))) {
            allPlanFiles.push({ name: `${normalizedName}_PLAN` });
        }
        
        // 4. Transition vers l'état final : BLEU / DOCUMENT (Car maintenant le fichier existe)
        setTimeout(() => {
            labelElement.classList.remove('bg-green-500');
            // On applique le style "Plan Existant" (Bleu)
            labelElement.classList.add('bg-blue-600', 'hover:bg-blue-700');
            labelElement.innerHTML = '📄'; // Icône Document
            labelElement.title = 'Modifier le plan';
        }, 1500);

        console.log(`✅ Plan pour ${advName} uploadé.`);

    } catch (error) {
        console.error("Erreur upload:", error);
        alert(`Échec de l'upload : ${error.message}`);
        
        // En cas d'erreur, on remet l'état EXACT d'avant le clic (Orange ou Bleu selon ce c'était)
        labelElement.className = originalClasses;
        labelElement.innerHTML = originalContent;
    }
}

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

// NOUVELLES FONCTIONS ADV

/**
 * Récupère la liste de tous les ADVs.
 */
async function fetchAdvData() {
    advErrorMessage.classList.add('hidden');
    
    try {
        advLoadingIndicator.classList.remove('hidden');
        advContainer.classList.add('hidden');
        await fetchPlanFiles();
        // Utilisation de la route GET /api/general_data pour obtenir tous les ADV
        const response = await fetch(API_ADV_LIST, { method: 'GET' });
        advLoadingIndicator.classList.add('hidden');

        if (!response.ok) {
            const error = await response.json();
            advErrorMessage.textContent = `Échec de récupération des ADVs. Code ${response.status}: ${error.message}`;
            advErrorMessage.classList.remove('hidden');
            return;
        }

        allAdvData = await response.json();
        
        renderAdvTable(allAdvData); 
        advContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Erreur de récupération des données ADV:", error);
        advLoadingIndicator.classList.add('hidden');
        advErrorMessage.textContent = `Erreur de connexion serveur: ${error.message}`;
        advErrorMessage.classList.remove('hidden');
    }
}

/**
 * Gère le processus de téléchargement du rapport pour un ADV spécifique.
 * @param {string} advName Le nom de l'ADV (identifiant) à exporter.
 */
async function handleDownloadReport(advName) {
    const logoUrl = "/assets/logo_a2c.png";

    try {
        // 1. Récupération des données et du logo
        const [dataResponse, logoBase64] = await Promise.all([
            fetch(`/api/adv_snapshot_log/${advName}`),
            getBase64FromUrl(logoUrl)
        ]);

        if (!dataResponse.ok) throw new Error(`Erreur HTTP API: ${dataResponse.status}`);
        
        const data = await dataResponse.json();
        
        if (!data || data.length === 0) {
            alert(`Aucune modification n'a été faite sur l'ADV: ${advName}.`);
            return;
        }

        // 2. Génération du HTML avec l'image incrustée
        const htmlContent = generateReportHTML(data, advName, logoBase64);

        // 3. Téléchargement
        downloadFile(htmlContent, `Rapport_${advName}.html`);

    } catch (error) {
        console.error(`Erreur export pour ADV ${advName}:`, error);
        alert(`Impossible de générer le rapport pour ${advName} (Vérifiez que l\'image existe et que l\'API répond).`);
    }
}

/**
 * Télécharge une image et la convertit en chaîne Base64
 * Le code est conservé tel quel du fichier d'origine.
 */
async function getBase64FromUrl(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Image non trouvée');
        const blob = await res.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // Résultat: "data:image/png;base64,..."
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn("Erreur chargement logo, utilisation d'un placeholder vide", e);
        return ""; // Retourne vide si l'image plante pour ne pas bloquer le download
    }
}

/**
 * Génère le contenu HTML du rapport.
 * Le code est conservé tel quel du fichier d'origine.
 */
function generateReportHTML(logs, advName, logoBase64) {
    const dateGeneration = new Date().toLocaleString();

    const rowsHtml = logs.map(log => {
        // La gestion de 'changes_json' nécessite de vérifier si c'est une chaîne
        const changes = typeof log.changes_json === 'string' 
            ? JSON.parse(log.changes_json) 
            : log.changes_json;

        const changesRows = changes.map(c => `
            <tr>
                <td>${c.label}</td>
                <td class="old-val">${c.oldValue}</td>
                <td class="new-val">${c.newValue}</td>
            </tr>
        `).join('');

        return `
        <div class="card">
            <div class="card-header">
                <span class="date">${new Date(log.snapshot_date).toLocaleString()}</span>
                <span class="user">Utilisateur : <strong>${log.user_id}</strong></span>
            </div>
            <div class="card-body">
                <div class="observation">
                    <strong>Observation :</strong> ${log.observation}
                </div>
                <table class="changes-table">
                    <thead>
                        <tr>
                            <th>Élément modifié</th>
                            <th>Ancienne valeur</th>
                            <th>Nouvelle valeur</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${changesRows}
                    </tbody>
                </table>
            </div>
        </div>`;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport - ${advName}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #f4f4f4; padding: 40px; }
        .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        
        header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; }
        header img { height: 90px; max-width: 200px; } 
        header .title-block { text-align: right; }
        h1 { margin: 0; font-size: 24px; color: #0056b3; }
        .subtitle { font-size: 14px; color: #666; }

        .card { border: 1px solid #ddd; border-radius: 5px; margin-bottom: 25px; overflow: hidden; background: #fff; }
        .card-header { background: #e9ecef; padding: 10px 15px; display: flex; justify-content: space-between; font-size: 0.9em; border-bottom: 1px solid #ddd; }
        .card-body { padding: 15px; }
        .observation { margin-bottom: 15px; font-style: italic; color: #555; }

        .changes-table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
        .changes-table th, .changes-table td { border: 1px solid #eee; padding: 8px; text-align: left; }
        .changes-table th { background-color: #f8f9fa; font-weight: 600; }
        .old-val { color: #dc3545; text-decoration: line-through; font-size: 0.85em; }
        .new-val { color: #28a745; font-weight: bold; }

        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <img src="${logoBase64}" alt="Logo A2C">
            <div class="title-block">
                <h1>Rapport d'Intervention</h1>
                <div class="subtitle">ADV : ${advName}</div>
                <div class="subtitle">Généré le : ${dateGeneration}</div>
            </div>
        </header>
        
        <div class="content">
            ${rowsHtml}
        </div>
    </div>
</body>
</html>`;
}

/**
 * Lance le téléchargement en créant un Blob et un lien temporaire.
 * Le code est conservé tel quel du fichier d'origine.
 */
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
function renderAdvTable(advs) {
    advTableBody.innerHTML = '';

    // --- DIAGNOSTIC START (Demandé par l'utilisateur) ---
    console.group("🔍 DIAGNOSTIC PLANS ADV");
    console.log(`📊 Nombre d'ADVs : ${advs.length}`);
    console.log(`📂 Nombre de fichiers sur le Cloud : ${allPlanFiles.length}`);

    const advsWithDoc = [];
    const advsWithoutDoc = [];

    // Pré-calcul pour le diagnostic
    advs.forEach(adv => {
        const targetName = adv.adv.trim().toLowerCase();
        
        // Recherche stricte : le nom du fichier (sans extension) doit correspondre au nom de l'ADV
        const found = allPlanFiles.find(f => {
            // On enlève l'extension du fichier cloud pour comparer (.png, .pdf, etc.)
            const fileNameNoExt = f.name.substring(0, f.name.lastIndexOf('.')).toLowerCase();
            return fileNameNoExt === targetName;
        });

        if (found) {
            advsWithDoc.push(`${adv.adv} (Trouvé: ${found.name})`);
        } else {
            advsWithoutDoc.push(adv.adv);
        }
    });

    console.log("%c✅ ADVs avec document :", "color: green; font-weight: bold", advsWithDoc);
    console.log("%c❌ ADVs sans document :", "color: orange; font-weight: bold", advsWithoutDoc);
    console.groupEnd();
    // --- DIAGNOSTIC END ---

    if (advs.length === 0) {
        advTableBody.innerHTML = `<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">Aucun ADV enregistré.</td></tr>`;
        return;
    }

    advs.forEach(adv => {
        const advName = adv.adv; 
        const row = advTableBody.insertRow();
        row.className = 'hover:bg-gray-700 transition duration-150';
        
        // --- LOGIQUE DE DÉTECTION CORRIGÉE ---
        const cleanName = advName.trim().toLowerCase();
        
        const hasPlan = allPlanFiles.some(f => {
            // Extraction du nom sans extension pour comparaison exacte "BS 10a" === "BS 10a"
            const fNameNoExt = f.name.substring(0, f.name.lastIndexOf('.')).toLowerCase();
            return fNameNoExt === cleanName;
        });

        let btnColorClass, btnIcon, btnTitle;

        if (hasPlan) {
            // CAS 1 : Plan présent -> BLEU
            btnColorClass = 'bg-blue-600 hover:bg-blue-700';
            btnIcon = '📄'; 
            btnTitle = 'Plan existant (Modifier)';
        } else {
            // CAS 2 : Pas de plan -> ORANGE
            btnColorClass = 'bg-orange-500 hover:bg-orange-600';
            btnIcon = '📂'; 
            btnTitle = 'Aucun plan (Ajouter)';
        }

        const deleteButton = `
            <button class="delete-adv-btn bg-red-600 hover:bg-red-700 px-3 py-1 text-sm rounded transition duration-150 shadow-md" 
                    data-adv-name="${advName}">
                <span class="text-sm">🗑️</span>
            </button>`;
            
        const downloadButton = `
            <button class="download-adv-btn bg-orange-500 hover:bg-orange-600 px-3 py-1 text-sm rounded transition duration-150 shadow-md"
                    data-adv-name="${advName}">
                Interventions
            </button>`;

        const uploadButton = `
            <div class="relative flex justify-center items-center group">
                <input type="file" id="upload-plan-${advName}" 
                       class="hidden dashboard-plan-input" 
                       data-adv-name="${advName}"
                       accept=".pdf, .png, .jpg, .jpeg">
                
                <label for="upload-plan-${advName}" 
                       class="cursor-pointer ${btnColorClass} px-3 py-1 text-lg rounded transition duration-150 shadow-md flex items-center justify-center text-white w-10 h-8"
                       title="${btnTitle}">
                    ${btnIcon}
                </label>
            </div>`;

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-400">${advName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">${adv.type || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">${adv.modele || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">${adv.lat || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">${adv.long || 'N/A'}</td> 
            <td class="px-6 py-4 whitespace-nowrap text-center text-center">${downloadButton}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-center">${uploadButton}</td> 
            <td class="px-6 py-4 whitespace-nowrap text-center text-center">${deleteButton}</td> 
        `;
    });

    // Re-attach listeners
    document.querySelectorAll('.delete-adv-btn').forEach(button => {
        button.addEventListener('click', (e) => handleDeleteAdv(e.currentTarget.dataset.advName, e.currentTarget));
    });

    document.querySelectorAll('.download-adv-btn').forEach(button => {
        button.addEventListener('click', (e) => handleDownloadReport(e.currentTarget.dataset.advName));
    });

    document.querySelectorAll('.dashboard-plan-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const advName = e.target.dataset.advName;
            
            if (file) {
                const label = e.target.nextElementSibling;
                const isReplacing = label.classList.contains('bg-blue-600');
                const confirmMsg = isReplacing 
                    ? `Voulez-vous REMPLACER le plan existant pour "${advName}" par "${file.name}" ?`
                    : `Voulez-vous AJOUTER le plan "${file.name}" pour "${advName}" ?`;

                if (confirm(confirmMsg)) {
                    handleDashboardUpload(file, advName, label);
                }
                e.target.value = ''; 
            }
        });
    });
}

/**
 * Gère la suppression d'un ADV.
 * @param {string} advName Le nom de l'ADV à supprimer.
 * @param {HTMLButtonElement} buttonElement L'élément bouton pour la gestion de l'UI.
 */
async function handleDeleteAdv(advName, buttonElement) {
    if (!confirm(`ATTENTION: Êtes-vous sûr de vouloir SUPPRIMER l'ADV "${advName}" ainsi que toutes ses données associées (spécifiques, demi-aiguillage) ? Cette action est irréversible.`)) {
        return;
    }
    buttonElement.disabled = true;
    buttonElement.innerHTML = '...';
    buttonElement.classList.remove('bg-red-600', 'hover:bg-red-700');
    buttonElement.classList.add('bg-gray-500');

    try {
        // DELETE /api/adv/:advName
        const response = await fetch(`${API_ADV_DELETE}/${advName}`, {
            method: 'DELETE', 
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(`Succès : ${data.message}`);
            fetchAdvData(); // Recharger la liste
        } else {
            alert(`Échec de la suppression de l'ADV "${advName}": ${data.error || data.message || 'Erreur inconnue'}`);
        }

    } catch (error) {
        console.error("Erreur réseau lors de la suppression de l'ADV:", error);
        alert(`Erreur de connexion serveur lors de la suppression de l'ADV "${advName}".`);
    } finally {
        buttonElement.disabled = false;
        buttonElement.innerHTML = '🗑️';
        buttonElement.classList.remove('bg-gray-500');
        buttonElement.classList.add('bg-red-600', 'hover:bg-red-700');
    }
}


function switchTab(targetSection) {
    currentView = targetSection === 'users-section' ? 'users' : 
                  targetSection === 'requests-section' ? 'requests' : 
                  targetSection === 'create-section' ? 'create' :
                  targetSection === 'permissions-section' ? 'permissions' :
                  'adv'; // Nouveau cas
    
    usersSection.classList.add('hidden');
    requestsSection.classList.add('hidden');
    createSection.classList.add('hidden'); 
    permissionsSection.classList.add('hidden');
    advSection.classList.add('hidden'); // Masquer la nouvelle section
    
    document.getElementById(targetSection).classList.remove('hidden');

    tabUsers.classList.remove('active');
    tabRequests.classList.remove('active');
    tabCreate.classList.remove('active');
    tabPermissions.classList.remove('active');
    tabAdv.classList.remove('active'); // Nouvelle désactivation
    
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
        
        if (allUsersData.length === 0) {
            fetchUsersData().then(() => {
                populateUserSelect();
            });
        } else {
             populateUserSelect();
        }
    } else if (targetSection === 'adv-section') { 
        tabAdv.classList.add('active'); 
        searchBar.classList.add('hidden'); 
        
        // On lance le chargement
        advLoadingIndicator.classList.remove('hidden');
        advContainer.classList.add('hidden');

        // On récupère les ADVs ET la liste des fichiers avant d'afficher
        Promise.all([fetchAdvData(false), fetchPlanFiles()]).then(() => {
            renderAdvTable(allAdvData); // On rafraîchit le tableau avec les deux infos
            advLoadingIndicator.classList.add('hidden');
            advContainer.classList.remove('hidden');
        });
    }
    
    errorMessage.classList.add('hidden');
    requestsErrorMessage.classList.add('hidden');
    createStatusMessage.classList.add('hidden');
    permissionsStatusMessage.classList.add('hidden');
    advErrorMessage.classList.add('hidden'); // Nouveau masquage d'erreur
}

document.addEventListener('DOMContentLoaded', () => {
    displayConnectedUser();
    switchTab('users-section'); 
    fetchPendingRequests(); 
    tabUsers.addEventListener('click', () => switchTab('users-section'));
    tabRequests.addEventListener('click', () => switchTab('requests-section'));
    tabCreate.addEventListener('click', () => switchTab('create-section'));
    
    tabPermissions.addEventListener('click', () => loadPermissionsSection()); 
    // NOUVEL ÉCOUTEUR ADV
    tabAdv.addEventListener('click', () => switchTab('adv-section'));
    
    permissionUserSelect.addEventListener('change', (e) => {
        const userId = parseInt(e.target.value, 10);
        handleSelection(userId);
    });
    
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
    
    document.querySelector(`th[data-sort-key="${sortState.key}"]`).classList.add(`sorted-${sortState.direction}`);
});