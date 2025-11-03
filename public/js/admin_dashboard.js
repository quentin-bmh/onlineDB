// public/js/admin_dashboard.js

// ----------------------------------------------------------------------
// ÉLÉMENTS DU DOM 
// ----------------------------------------------------------------------
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


const API_ENDPOINT = '/admin/users';
const API_PENDING_REQUESTS = '/admin/pending-requests'; 
const API_APPROVE_REQUEST = '/admin/approve-request'; 
const API_URL_LOGOUT = '/auth/logout';

let allUsersData = [];
let allPendingRequests = []; 
let sortState = { key: 'last_login', direction: 'desc' }; 
let currentSearchTerm = '';
let currentView = 'users'; // 'users' ou 'requests'

// ----------------------------------------------------------------------
// FONCTIONS UTILITAIRES (AJOUTÉES pour complétude)
// ----------------------------------------------------------------------

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
    // En environnement réel, ceci serait un appel API.
    fetchUsersData(); // Recharge les données pour mettre à jour l'affichage
}

// ----------------------------------------------------------------------
// LOGIQUE DE DÉCONNEXION (INCHANGÉE)
// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------
// FONCTIONS D'AFFICHAGE ET DE GESTION DES UTILISATEURS (INCHANGÉES)
// ----------------------------------------------------------------------

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

function renderTable(users) {
    usersTableBody.innerHTML = ''; 
    // ... (Logique de rendu de la table des utilisateurs inchangée) ...
    if (users.length === 0) {
        usersTableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">Aucun utilisateur trouvé.</td></tr>`;
        return;
    }

    users.forEach(user => {
        const row = usersTableBody.insertRow();
        row.className = 'hover:bg-gray-700 transition duration-150';

        const isAdmin = user.is_admin === true;
        const statusText = isAdmin ? 
            `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-500 text-white">ADMIN</span>` : 
            `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-gray-300">User</span>`;
        const managementButton = isAdmin 
            ? `<button class="permissions-toggle bg-yellow-500 hover:bg-yellow-600 px-3 py-1 text-sm rounded transition duration-150" data-user-id="${user.id}" data-is-admin="${isAdmin}">Rétrograder</button>`
            : `<button class="permissions-toggle bg-blue-500 hover:bg-blue-600 px-3 py-1 text-sm rounded transition duration-150" data-user-id="${user.id}" data-is-admin="${isAdmin}">Promouvoir Admin</button>`;


        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">${user.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">${user.username}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap">${statusText}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">${managementButton}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${user.last_login || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${user.created_at}</td>
        `;
    });
    
    document.querySelectorAll('.permissions-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = parseInt(e.target.dataset.userId, 10);
            const currentStatus = e.target.dataset.isAdmin === 'true'; 
            mockToggleAdmin(userId, currentStatus); 
        });
    });
}

// ----------------------------------------------------------------------
// FONCTIONS DE GESTION DES DEMANDES EN ATTENTE (INCHANGÉES)
// ----------------------------------------------------------------------

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
        fetchUsersData(); // Recharger les utilisateurs pour inclure le nouvel utilisateur

    } catch (error) {
        console.error("Erreur réseau lors de l'approbation:", error);
        alert(`Erreur de connexion serveur lors de l'approbation de la demande ID ${requestId}.`);
    } 
}


// ----------------------------------------------------------------------
// LOGIQUE DE BASCULE D'ONGLET (INCHANGÉE)
// ----------------------------------------------------------------------

function switchTab(targetSection) {
    currentView = targetSection === 'users-section' ? 'users' : 'requests';
    
    // Gérer l'affichage des sections (cache tout sauf la cible)
    usersSection.classList.add('hidden');
    requestsSection.classList.add('hidden');
    document.getElementById(targetSection).classList.remove('hidden');

    // Gérer l'état actif des boutons
    tabUsers.classList.remove('active');
    tabRequests.classList.remove('active');
    
    if (targetSection === 'users-section') {
        tabUsers.classList.add('active');
        searchBar.classList.remove('hidden');
        // Rechargement des utilisateurs
        fetchUsersData(); 
    } else {
        tabRequests.classList.add('active');
        searchBar.classList.add('hidden'); 
        // Rechargement des demandes
        fetchPendingRequests(); 
    }
}


// ----------------------------------------------------------------------
// ÉCOUTEURS D'ÉVÉNEMENTS (CORRECTION DE L'INITIALISATION)
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    displayConnectedUser();
    
    // CORRECTION : Initialiser la vue en appelant switchTab pour l'onglet par défaut.
    // Cela affiche la section 'users-section' et déclenche fetchUsersData().
    switchTab('users-section'); 
    
    // Récupérer les demandes séparément pour s'assurer que le compteur (pendingCount) 
    // est mis à jour même si la section est initialement cachée.
    fetchPendingRequests();

    // Événements de bascule d'onglet
    tabUsers.addEventListener('click', () => switchTab('users-section'));
    tabRequests.addEventListener('click', () => switchTab('requests-section'));
    
    // Événements existants
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
});