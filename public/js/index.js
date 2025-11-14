// public/js/index.js

const API_URL_PROFILE = '/auth/profile'; 
const API_URL_LOGOUT = '/auth/logout';
const API_URL_DOC_LIST = '/api/webdav/list';


/**
 * Détermine le rôle lisible à partir du statut is_admin.
 * @param {boolean} isAdmin 
 */
function getDisplayRole(isAdmin) {
    return isAdmin ? 'Administrateur' : 'Technicien';
}


async function handleLogout(event) {
    event.preventDefault();
    try {
        await fetch(API_URL_LOGOUT, { method: 'POST' });
        window.location.href = '/login'; 
    } catch (error) {
        window.location.href = '/login'; 
    }
}

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
            titleElement.textContent = `Bienvenue, ${user.username || 'Utilisateur'} !`;
            roleElement.textContent = `Statut: ${role}`;

            // 🆕 LOGIQUE DU DASHBOARD
            if (user.is_admin) {
                const dashboardLink = document.getElementById('dashboard-link');
                if (dashboardLink) {
                    // Rend le bouton visible si l'utilisateur est admin
                    dashboardLink.style.display = 'inline-block'; 
                }
            }
        }
    } catch (error) {
        // Redirection en cas d'erreur
        console.error("Erreur dans fetchUserProfile:", error);
        window.location.href = '/login'; 
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
document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
    // loadFiles(); 
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
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