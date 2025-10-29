// public/js/admin_dashboard.js

const usersTableBody = document.getElementById('usersTableBody');
const loadingIndicator = document.getElementById('loadingIndicator');
const usersContainer = document.getElementById('usersContainer');
const errorMessage = document.getElementById('errorMessage');
const searchBar = document.getElementById('searchBar');
const welcomeUser = document.getElementById('welcomeUser');
const goToAppButton = document.getElementById('goToAppButton');
const logoutButton = document.getElementById('logoutButton'); // Récupération du bouton déconnexion

const API_ENDPOINT = '/admin/users';
const API_URL_LOGOUT = '/auth/logout';

let allUsersData = [];
let sortState = { key: 'last_login', direction: 'desc' }; 
let currentSearchTerm = '';

// ----------------------------------------------------------------------
// 1. LOGIQUE DE DÉCONNEXION (SOLUTION DU PROBLÈME HTTPONLY)
// ----------------------------------------------------------------------

async function handleLogout() {
    try {
        const response = await fetch(API_URL_LOGOUT, {
            method: 'POST', // L'instruction de suppression doit être envoyée au serveur
        });

        // Même si l'API échoue (ex: token déjà expiré), on force la redirection
        window.location.href = '/login'; 
        
    } catch (error) {
        console.error("Erreur réseau/inattendue lors de la déconnexion:", error);
        window.location.href = '/login'; 
    }
}

// ----------------------------------------------------------------------
// 2. FONCTIONS DE RENDU ET DE FILTRAGE
// ----------------------------------------------------------------------

function displayConnectedUser() {
    // Récupérer le nom de l'utilisateur stocké lors du login
    const username = localStorage.getItem('username');
    if (username) {
        welcomeUser.textContent = `Bienvenue, ${username}`;
    } else {
        welcomeUser.textContent = `Bienvenue`;
    }
}
function mockToggleAdmin(userId, currentStatus) {
    // Logique de simulation de modification de rôle (côté client uniquement)
    const newStatus = !currentStatus;
    const userIndex = allUsersData.findIndex(u => parseInt(u.id) === userId);
    if (userIndex !== -1) {
        allUsersData[userIndex].is_admin = newStatus; 
        applyFiltersAndSort(); 
        console.log(`[MOCK SUCCESS] Utilisateur ID ${userId} basculé à Admin:${newStatus}.`);
        // ⚠️ En production, un appel API POST/PUT serait fait ici pour mettre à jour la BDD
    } else {
        console.error(`[MOCK ERROR] Utilisateur ID ${userId} non trouvé pour la bascule.`);
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
    // Logique de tri (omise pour la concision, mais fonctionnelle)
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

async function fetchUsersData() {
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
                setTimeout(() => window.location.href = '/login', 3000); // Redirection après échec d'authentification
            }
            return;
        }

        const data = await response.json();
        allUsersData = data.users;
        
        applyFiltersAndSort(); 
        usersContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Erreur de récupération des données administrateur:", error);
        loadingIndicator.classList.add('hidden');
        errorMessage.textContent = `Erreur de connexion serveur: ${error.message}`;
        errorMessage.classList.remove('hidden');
    }
}

function renderTable(users) {
    usersTableBody.innerHTML = ''; 

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

document.addEventListener('DOMContentLoaded', () => {
    displayConnectedUser();
    fetchUsersData();
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
    
    // CORRECTION : Lier le bouton Déconnexion à la fonction API
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});