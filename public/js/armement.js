const voies = [];
let voieActive = null;

async function loadVoies() {
    try {
        const res = await fetch('/api/voiesBoulogne');
        const data = await res.json();
        // Extraction des noms de voies
        data.forEach(row => voies.push(row.voie));
        
        if (voies.length > 0) {
            voieActive = voies[0];
            createTableVoies(voies);
            updateDisplay(); // Affichage initial
        }
    } catch (err) {
        console.error('Erreur lors du chargement des voies :', err);
    }
}

function createTableVoies(voies) {
    const container = document.getElementById("container");
    container.innerHTML = '';

    voies.forEach((voie) => {
        const row = document.createElement("tr");
        row.setAttribute('data-voie', voie); // Facilite la sélection via querySelector
        const cell = document.createElement("td");
        cell.textContent = voie;
        cell.style.cursor = 'pointer';
        row.appendChild(cell);
        container.appendChild(row);

        row.addEventListener('click', () => {
            voieActive = voie;
            updateDisplay();
        });
    });
}

function updateDisplay() {
    // Mise à jour visuelle de la liste
    document.querySelectorAll('#container tr').forEach(tr => {
        tr.classList.remove('active-voie');
        if (tr.getAttribute('data-voie') === voieActive) {
            tr.classList.add('active-voie');
        }
    });

    // Mise à jour du titre
    const titre = document.getElementById('voie-titre');
    titre.textContent = `Schéma d'armement de ${voieActive}`;

    // L'image reste statique selon l'énoncé
    const img = document.getElementById('schema-img');
    img.src = '/assets/schema_armement_ex.png';

    scrollToActiveVoie();
}

function navigateVoie(direction) {
    const currentIndex = voies.indexOf(voieActive);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < voies.length) {
        voieActive = voies[newIndex];
        updateDisplay();
    }
}

function scrollToActiveVoie() {
    const activeRow = document.querySelector('.active-voie');
    if (activeRow) {
        activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Event Listeners
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        event.preventDefault(); // Empêche le scroll natif
        navigateVoie(-1);
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        navigateVoie(1);
    }
});

loadVoies();