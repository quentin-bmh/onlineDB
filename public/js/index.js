// public/js/index.js

// --- Configuration API ---
const API_URL_PROFILE = '/auth/profile'; 
const API_URL_LOGOUT = '/auth/logout';
const API_URL_DOC_LIST = '/api/webdav/list';

// --- Fonctions d'Utilitaires ---

/**
 * Détermine le rôle lisible à partir du statut is_admin.
 * @param {boolean} isAdmin 
 */
function getDisplayRole(isAdmin) {
    return isAdmin ? 'Administrateur' : 'Technicien';
}

// ----------------------------------------------------------------------
// 1. GESTION DE LA DÉCONNEXION
// ----------------------------------------------------------------------

async function handleLogout(event) {
    event.preventDefault();
    try {
        await fetch(API_URL_LOGOUT, { method: 'POST' });
        window.location.href = '/login'; 
    } catch (error) {
        window.location.href = '/login'; 
    }
}

// ----------------------------------------------------------------------
// 2. RÉCUPÉRATION ET AFFICHAGE DU PROFIL UTILISATEUR
// ----------------------------------------------------------------------

async function fetchUserProfile() {
    const titleElement = document.getElementById('welcome-title');
    const roleElement = document.getElementById('user-role-display');
    
    try {
        const response = await fetch(API_URL_PROFILE);
        
        if (!response.ok) {
            throw new Error(`Échec du chargement du profil: ${response.status}`);
        }
        
        const data = await response.json();
        const user = data.user; 

        if (user) {
            const role = getDisplayRole(user.is_admin);
            
            // Affichage des données
            titleElement.innerHTML = `Bienvenue, ${user.username} !`;
            roleElement.innerHTML = `Votre rôle : <span class="${user.is_admin ? 'text-orange-500' : 'text-green-500'} font-bold">${role}</span>`;
        }

    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        titleElement.textContent = 'Erreur de profil';
        roleElement.textContent = 'Veuillez vous reconnecter.';
    }
}


async function loadFiles() {
      const res = await fetch("/api/webdav/list");
      if (!res.ok) { document.getElementById("document-buttons").textContent = "Erreur serveur"; return; }
      const files = await res.json();
      const container = document.getElementById("document-buttons");
      container.innerHTML = "";

        files.forEach(file => {
            const btn = document.createElement("button");
            btn.textContent = file.name;

            btn.onclick = () => {
                if (!file.path) {
                console.warn("⚠️ fichier sans path détecté", file);
                return;
                }
                const url = `/api/webdav/open/${encodeURIComponent(file.path)}`;
                

                // Crée un lien temporaire et force l'ouverture dans un nouvel onglet
                const a = document.createElement("a");
                a.href = url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            container.appendChild(btn);
        });


    }
// ----------------------------------------------------------------------
// 4. INITIALISATION AU CHARGEMENT DU DOM
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Lancer la récupération du profil et des documents
    fetchUserProfile();
    loadFiles(); 
    
    // Lier la déconnexion
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
    
    // Logique d'animation (conservée)
    const modal = document.getElementById('choiceModal');
    const backgroundOverlay = document.querySelector('.background-filter-overlay');
    const header = document.querySelector('.minimal-header');
    const initialDelayMs = 200;
    const headerOffsetMs = 450;
    setTimeout(() => {
        backgroundOverlay.style.opacity = '1';
        modal.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
    }, initialDelayMs); 
    setTimeout(() => {
        header.classList.add('is-visible'); 
    }, initialDelayMs + headerOffsetMs); 
});