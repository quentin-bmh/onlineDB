// Définition des options pour les sélecteurs, regroupées par thème (Inchgées)
const SELECT_OPTIONS = {
    // Bavures
    bavures: [
        { value: 'aucune', label: 'Aucune bavure' },
        { value: 'eliminees', label: 'Bavures éliminées par meulage' },
        { value: 'presence', label: 'Présence de bavures' }
    ],
    // Ébréchure aiguille
    ebrechureAiguille: [
        { value: 'aucune', label: 'Aucune ébréchure' },
        { value: 'presence', label: 'Présence d\'ébréchure' }
    ],
    // Contact fente
    contactFente: [
        { value: 'dessous_repere', label: 'au dessous de la fente repère' },
        { value: 'dessus_repere', label: 'au dessus de la fente repère' }
    ],
    // Classement (Ebrechure / État Butée / Usure LA / Usure LCA)
    classement: [
        { value: 'bon', label: 'Bon' },
        { value: 'va', label: 'VA' },
        { value: 'vr', label: 'VR' },
        { value: 'vi', label: 'VI' }
    ],
    // Usure LCA (> 3mm, < 3mm, 0mm)
    usureLCA: [
        { value: 'sup_3mm', label: '> 3mm' },
        { value: 'inf_3mm', label: '< 3mm' },
        { value: '0mm', label: '0mm' }
    ],
    // Calibre/Pige (Passage après/avant meulage)
    calibrePige: [
        { value: 'ne_passe_pas', label: 'ne passe pas' },
        { value: 'passe_apres_meulage', label: 'passe après meulage' },
        { value: 'passe_avant_meulage', label: 'passe avant meulage' }
    ],
    // Usure LA Pente (Angle)
    usureLAPente: [
        { value: 'sup_60', label: '≥ 60°' },
        { value: 'inf_60', label: '≤ 60°' }
    ],
    // Usure LA Contact (Position du contact)
    usureLAContact: [
        { value: 'dessus_dessous', label: 'au dessus et au dessous' },
        { value: 'dessus', label: 'au dessus' },
        { value: 'dessous', label: 'en dessous' }
    ]
};

// Configuration des 15 lignes du Demi-Aiguillage : (Inchgées)
const DEMI_AIG_CONFIG = [
    { label: "Bavures", type: 'select', options: SELECT_OPTIONS.bavures },
    { label: "Ebrechure aiguille", type: 'select', options: SELECT_OPTIONS.ebrechureAiguille },
    { label: "Contact fente", type: 'select', options: SELECT_OPTIONS.contactFente },
    { label: "Longueur ébréchure sous fente repère", type: 'input_number' },
    { label: "Longueur totale de la zone ébréchée", type: 'input_number' },
    { label: "Ebrechure classement", type: 'select', options: SELECT_OPTIONS.classement },
    { label: "Demi-Aiguillage entrebaillement", type: 'input_number' },
    { label: "Demi-Aiguillage Etat butée", type: 'select', options: SELECT_OPTIONS.classement },
    { label: "Usure LCA", type: 'select', options: SELECT_OPTIONS.usureLCA },
    { label: "Usure LCA Calibre", type: 'select', options: SELECT_OPTIONS.calibrePige },
    { label: "Usure LCA Pige", type: 'select', options: SELECT_OPTIONS.calibrePige },
    { label: "Usure LCA Classement", type: 'select', options: SELECT_OPTIONS.classement },
    { label: "Usure LA Pente", type: 'select', options: SELECT_OPTIONS.usureLAPente },
    { label: "Usure LA Contact", type: 'select', options: SELECT_OPTIONS.usureLAContact },
    { label: "Usure LA Classement", type: 'select', options: SELECT_OPTIONS.classement }
];

// Les listes d'écartement/croisement sont conservées de votre code précédent
const ADV_CONFIG = {
    BS: {
        ecartement: [
            "Ecartement 1", "Ecartement 2", "Ecartement 3",
            "Ecartement 4", "Ecartement 5", "Ecartement 7",
            "Attaches efficaces 1", "Attaches inneficaces 1",
            "Attaches efficaces 2", "Attaches inneficaces 2",
            "Attaches efficaces 3", "Attaches inneficaces 3",
            "Attaches efficaces 4", "Attaches inneficaces 4",
            "Attaches efficaces 5", "Attaches inneficaces 5",
            "Attaches efficaces 6", "Attaches inneficaces 6",
            "Attaches efficaces 7", "Attaches inneficaces 7",
            "Attaches efficaces 8", "Attaches inneficaces 8",
            "Attaches efficaces 9", "Attaches inneficaces 9"
        ].filter((_, i) => i < 24), 
        demiAiguillageCols: 2
    },

    TJD: {
        ecartement: [
            "Ecartement 1", "Ecartement 2", "Ecartement 3",
            "Ecartement 4", "Ecartement 5", "Ecartement 6",
            "Ecartement 7", "Ecartement 8",
            "Attaches efficaces 1", "Attaches inneficaces 1",
            "Attaches efficaces 1'", "Attaches inneficaces 1'",
            "Attaches efficaces 2", "Attaches inneficaces 2",
            "Attaches efficaces 2'", "Attaches inneficaces 2'",
            "Attaches efficaces 3", "Attaches inneficaces 3",
            "Attaches efficaces 3'", "Attaches inneficaces 3'",
            "Attaches efficaces 4", "Attaches inneficaces 4",
            "Attaches efficaces 4'", "Attaches inneficaces 4'",
            "Attaches efficaces 5", "Attaches inneficaces 5",
            "Attaches efficaces 6", "Attaches inneficaces 6",
            "Attaches efficaces 7", "Attaches inneficaces 7",
            "Attaches efficaces 8", "Attaches inneficaces 8"

        ].filter((_, i) => i < 32), 
        demiAiguillageCols: 8
    },

    TO: {
        ecartement: [
            "Ecartement 1", "Ecartement 2", "Ecartement 3",
            "Ecartement 4", "Ecartement 5", "Ecartement 6",
            "Ecartement 7", "Ecartement 8",
            "Attaches efficaces 1", "Attaches inneficaces 1",
            "Attaches efficaces 1'", "Attaches inneficaces 1'",
            "Attaches efficaces 2", "Attaches inneficaces 2",
            "Attaches efficaces 2'", "Attaches inneficaces 2'",
            "Attaches efficaces 3", "Attaches inneficaces 3",
            "Attaches efficaces 3'", "Attaches inneficaces 3'",
            "Attaches efficaces 4", "Attaches inneficaces 4",
            "Attaches efficaces 4'", "Attaches inneficaces 4'",
            "Attaches efficaces 5", "Attaches inneficaces 5",
            "Attaches efficaces 6", "Attaches inneficaces 6",
            "Attaches efficaces 7", "Attaches inneficaces 7",
            "Attaches efficaces 8", "Attaches inneficaces 8"
        ].filter((_, i) => i < 32), 
        demiAiguillageCols: 0
    }
};

/**
 * Génère un champ label + input à partir d'une liste de libellés (pour l'onglet Écartement).
 * @param {string} section - Nom de la section (ex: 'ecartement').
 * @param {string} labelText - Le texte exact du label.
 * @param {number} index - L'index pour créer l'ID/Name unique.
 * @returns {string} Le HTML du div contenant le label et l'input.
 */
function generateSpecificField(section, labelText, index) {
    const baseName = labelText.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const id = `${section}_${baseName}_${index}`;
    const name = `${section}_${index}`;

    return `
        <div>
            <label for="${id}">${labelText}:</label>
            <input type="text" id="${id}" name="${name}">
        </div>
    `;
}

/**
 * Génère le contenu d'une cellule de tableau (input ou select) pour le Demi-Aiguillage.
 * @param {Object} rowConfig - Configuration de la ligne (label, type, options).
 * @param {string} fieldName - Nom du champ (ex: demiAig_1_gauche).
 * @param {string} fieldId - ID unique du champ.
 * @returns {string} Le HTML de l'élément de formulaire.
 */
function generateTableField(rowConfig, fieldName, fieldId) {
    if (rowConfig.type === 'select' && rowConfig.options) {
        let optionsHTML = rowConfig.options.map(opt =>
            `<option value="${opt.value}">${opt.label}</option>`
        ).join('');
        
        return `
            <select class="table-input" name="${fieldName}" id="${fieldId}">
                <option value="" disabled selected>-- Choisir --</option>
                ${optionsHTML}
            </select>
        `;
    } else if (rowConfig.type === 'input_number') {
        return `<input type="number" class="table-input" name="${fieldName}" id="${fieldId}" step="0.01" placeholder="0">`;
    } else {
        return `<input type="text" class="table-input" name="${fieldName}" id="${fieldId}">`;
    }
}


/**
 * Génère le tableau de Demi-Aiguillage (BS ou TJD) en utilisant les libellés définis.
 * @param {string} advType - Le type d'ADV ('BS' ou 'TJD').
 * @returns {string} Le HTML du tableau.
 */
function generateDemiAiguillageTable(advType) {
    const config = ADV_CONFIG[advType];
    const labels = DEMI_AIG_CONFIG; // Utilise la configuration par objet
    const cols = config.demiAiguillageCols;

    if (cols === 0) return '';

    let tableHTML = `
        <table>
            <thead>
                <tr class="table-header-row">
                    <th>
                        <button type="button" id="reset-table-btn" title="Réinitialiser tout le tableau">
                            ${String.fromCodePoint(0x21BB)} Tout Réinitialiser
                        </button>
                    </th>
    `;

    // Génération des en-têtes de colonnes
    const colNames = (advType === 'BS')
        ? ['Aiguillage Gauche', 'Aiguillage Droite']
        : Array.from({ length: 8 }, (_, i) => `Aig ${i + 1}`);

    colNames.forEach((name, index) => {
        const colIndex = index + 1;
        
        // Icônes Copier et Effacer pour chaque TH de contenu
        const icons = `
            <span class="header-icons" data-col-index="${colIndex}">
                <span class="copy-col-btn" title="Copier la colonne ${name} vers les autres">${String.fromCodePoint(0x1F4CB)}</span>
                <span class="clear-col-btn" title="Effacer la colonne ${name}">${String.fromCodePoint(0x1F5D1)}</span>
            </span>
        `;
        
        tableHTML += `<th data-col-index="${colIndex}">
                        ${name}
                        ${icons}
                      </th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // Génération des lignes du tableau (15 lignes)
    labels.forEach((rowConfig, i) => { 
        const rowIndex = i + 1; // 1-based index pour le name
        let separatorClass = '';
        if (i === 0 || i === 1 || i === 6 || i === 8 || i === 12) {
            separatorClass = ' separator-row';
        }
        tableHTML += `<tr data-row-index="${rowIndex}" class="row-${rowIndex}${separatorClass}">
                        <td class="row-label">
                            ${rowConfig.label}
                        </td>`;
        
        for (let j = 1; j <= cols; j++) {
            const colIndexName = (advType === 'BS') ? (j === 1 ? 'gauche' : 'droite') : `aig_${j}`;
            const fieldName = `demiAig_${rowIndex}_${colIndexName}`;
            const cleanLibelle = rowConfig.label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); 
            const fieldId = `demiAig_${rowIndex}_${colIndexName}_${cleanLibelle}`; 

            const fieldContent = generateTableField(rowConfig, fieldName, fieldId);

            tableHTML += `
                <td data-col-index="${j}">
                    ${fieldContent}
                </td>
            `;
        }
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    return tableHTML;
}

/**
 * Met à jour le formulaire (champs variables et onglets) en fonction du type d'ADV sélectionné.
 */
function updateForm() {
    const advType = document.getElementById('advType').value;
    const advForm = document.getElementById('advForm');
    const demiAiguillageTabBtn = document.querySelector('.tab-btn[data-tab="demiAiguillage"]');
    const demiAiguillageContent = document.getElementById('demi-aiguillage-content');
    const demiAiguillageTabPane = document.getElementById('tab-demiAiguillage');
    const ecartementFieldsContainer = document.getElementById('ecartement-fields');
    
    // Nouveaux éléments
    const croisementContainer = document.querySelector('#tab-croisement .voie-type-container');
    // Sélecteur mis à jour pour data-type
    const specificCroisementSections = document.querySelectorAll('.croisement-type-content[data-type]');

    if (!advType) {
        advForm.classList.add('hidden');
        return;
    }

    advForm.classList.remove('hidden');

    const config = ADV_CONFIG[advType];
    const advTypeLower = advType.toLowerCase();

    // 1. Mise à jour de l'onglet 'Croisement' (Affichage/Masquage HTML statique)
    
    // Masquer tous les contenus spécifiques
    specificCroisementSections.forEach(section => section.classList.add('hidden-adv-type'));
    
    // Afficher le contenu correspondant
    // Sélecteur mis à jour pour data-type
    const targetCroisement = document.querySelector(`.croisement-type-content[data-type="${advTypeLower}"]`);
    if (targetCroisement) {
        targetCroisement.classList.remove('hidden-adv-type');
    }
    
    // Mettre à jour la classe du conteneur parent pour les styles de layout
    croisementContainer.setAttribute('data-type', advTypeLower);


    // 2. Mise à jour des champs 'Écartement'
    let ecartementHTML = '';
    config.ecartement.forEach((label, index) => {
        ecartementHTML += generateSpecificField('ecartement', label, index + 1);
    });
    ecartementFieldsContainer.innerHTML = ecartementHTML;

    // 3. Mise à jour de l'onglet 'Demi-Aiguillage'
    if (advType === 'BS' || advType === 'TJD') {
        demiAiguillageTabBtn.classList.remove('hidden');
        demiAiguillageTabPane.classList.remove('hidden');
        demiAiguillageContent.innerHTML = generateDemiAiguillageTable(advType);
    } else { // TO
        demiAiguillageTabBtn.classList.add('hidden');
        demiAiguillageTabPane.classList.add('hidden');
        // Si l'onglet actif est 'Demi-Aiguillage' et qu'il est masqué, basculer sur 'Général'
        if (demiAiguillageTabBtn.classList.contains('active')) {
             switchTab('general');
        }
    }
}

/**
 * Gère le changement d'onglet (navigation).
 * @param {string} tabId - L'ID de l'onglet cible (ex: 'general').
 */
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const targetPane = document.getElementById(`tab-${tabId}`);

    if (targetBtn && targetPane) {
        targetBtn.classList.add('active');
        targetPane.classList.add('active');
    }
}

// --- Logique du Clic Droit (TD -> Ligne) ---

const contextMenu = document.getElementById('custom-context-menu');
const applyRowBtn = document.getElementById('apply-row');
const applyColBtn = document.getElementById('apply-col'); // Maintenu mais masqué pour cette fonctionnalité
let targetCell = null; 

/**
 * Masque le menu contextuel.
 */
function hideContextMenu() {
    contextMenu.style.display = 'none';
    targetCell = null;
    applyRowBtn.classList.remove('hidden');
    applyColBtn.classList.remove('hidden');
}

/**
 * Réinitialise la valeur d'un élément de formulaire à la valeur par défaut ("").
 * @param {HTMLInputElement|HTMLSelectElement} inputElement - L'élément à effacer.
 */
function resetInputValue(inputElement) {
    // Réinitialise la valeur pour input (text/number) et select
    inputElement.value = '';
    
    // Pour les select, si la première option est vide et selected (ce qui est le cas dans generateTableField), 
    // l'affectation de '' la sélectionnera.
    
    inputElement.dispatchEvent(new Event('change'));
}

/**
 * Fonction de réinitialisation principale du tableau.
 * @param {HTMLElement} table - L'élément <table> ciblé.
 */
function resetAllTableInputs(table) {
    if (!table) return;
    table.querySelectorAll('.table-input').forEach(input => {
        resetInputValue(input);
    });
}

/**
 * Fonction de copie de colonne (Aig 1/Gauche vers les autres).
 * @param {HTMLElement} table - L'élément <table> ciblé.
 * @param {number} sourceColIndex - L'index de la colonne source à copier (ex: 1 pour Aig 1/Gauche).
 */
function copyColumn(table, sourceColIndex) {
    table.querySelectorAll('tbody tr').forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length > sourceColIndex) {
            // 1. Récupérer la valeur de la cellule source
            // L'index réel dans `cells` est `sourceColIndex` (car cells[0] est la colonne Libellé)
            const sourceInput = cells[sourceColIndex].querySelector('.table-input');
            if (!sourceInput) return;
            const sourceValue = sourceInput.value;
            
            // 2. Parcourir toutes les colonnes de contenu (index 1 à max)
            cells.forEach((td, index) => {
                // On s'assure d'être dans une colonne de contenu (index > 0)
                // ET que ce n'est PAS la colonne source
                if (index > 0 && index !== sourceColIndex) { 
                    const targetInput = td.querySelector('.table-input');
                    if (targetInput) {
                        targetInput.value = sourceValue;
                        // Déclencher un événement change pour mettre à jour l'état visuel/logique si nécessaire
                        targetInput.dispatchEvent(new Event('change'));
                    }
                }
            });
        }
    });
}
// --- Gestion des Événements ---

document.addEventListener('DOMContentLoaded', () => {
    // Écouteurs pour la navigation et soumission... (conservés)

    document.querySelectorAll('.tabs-nav').forEach(nav => {
        nav.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-btn')) {
                const tab = event.target.getAttribute('data-tab');
                switchTab(tab);
            }
        });
    });

    document.getElementById('advForm').addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Récupération des données du formulaire...');
        alert('Soumission du formulaire ADV : Données prêtes à être traitées.');
    });

    // Écouteur global pour les actions dynamiques du tableau (copie, clear)
    document.getElementById('advForm').addEventListener('click', (e) => {
        const target = e.target;
        const table = target.closest('table');
        if (!table) return;

        // 1. Reset Total (Case 0,0)
        if (target.id === 'reset-table-btn') {
            resetAllTableInputs(table);
            return;
        }

        // 2. Clear Colonne (Icône TH)
        if (target.classList.contains('clear-col-btn')) {
            const header = target.closest('th');
            const columnIndex = parseInt(header.getAttribute('data-col-index'));
            
            // L'index de la TD correspond à columnIndex
            table.querySelectorAll('tbody tr').forEach((row) => {
                const cells = row.querySelectorAll('td');
                if (cells[columnIndex]) { 
                    const input = cells[columnIndex].querySelector('.table-input');
                    if (input) {
                        resetInputValue(input);
                    }
                }
            });
            return;
        }
        
        if (target.classList.contains('copy-col-btn')) {
            const header = target.closest('th');
            const sourceColIndex = parseInt(header.getAttribute('data-col-index'));
            copyColumn(table, sourceColIndex);
            return; 
        }
        if (target.classList.contains('clear-row-btn')) {
            const row = target.closest('tr');
            if (!row) return;
            row.querySelectorAll('td').forEach((td, index) => {
                 if (index > 0) {
                     const input = td.querySelector('.table-input');
                     if (input) {
                         resetInputValue(input);
                     }
                 }
            });
            return;
        }
    });

    
    applyRowBtn.addEventListener('click', () => {
        if (!targetCell || targetCell.tagName !== 'TD' || targetCell.cellIndex === 0) {
            hideContextMenu();
            return;
        }

        const sourceElement = targetCell.querySelector('.table-input');
        if (!sourceElement) return;

        const sourceValue = sourceElement.value;
        const row = targetCell.closest('tr');
        
        if (row) {
            row.querySelectorAll('td').forEach((td, index) => {
                if (index > 0) {
                    const targetInput = td.querySelector('.table-input');
                    if (targetInput) {
                        targetInput.value = sourceValue;
                        targetInput.dispatchEvent(new Event('change')); 
                    }
                }
            });
        }
        hideContextMenu();
    });

    document.addEventListener('contextmenu', (e) => {
        const demiAiguillageContent = document.getElementById('tab-demiAiguillage');        
        if (demiAiguillageContent && demiAiguillageContent.contains(e.target)) {
            const clickedTD = e.target.closest('td');

            if (clickedTD && clickedTD.cellIndex > 0) {
                e.preventDefault();
                targetCell = clickedTD;
                const rect = clickedTD.getBoundingClientRect();
                const posX = rect.left;
                const posY = rect.top; 


                contextMenu.style.left = `${posX}px`;
                contextMenu.style.display = 'block'; 
                const menuHeight = contextMenu.offsetHeight;
                contextMenu.style.top = `${rect.top - menuHeight}px`;

                applyRowBtn.classList.remove('hidden');
                applyColBtn.classList.add('hidden');
            } else {
                hideContextMenu();
            }
        } else {
            hideContextMenu();
        }
    });

    document.addEventListener('click', () => {
        hideContextMenu();
    });
});


// Définition des variables globales pour stocker les instances de Chart
let traversesChartInstance = null;
let jointsChartInstance = null;

/**
 * Initialise le graphique des traverses (Diagramme en Donut).
 * @returns {Chart} Instance du graphique.
 */
function initTraversesChart() {
    const ctx = document.getElementById('traversesChart').getContext('2d');
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Bois en bon état', 'Bois à remplacer'],
            datasets: [{
                data: [0, 0], // Données initiales
                backgroundColor: ['#28a745', '#dc3545'], // Vert / Rouge
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: false
                }
            }
        }
    });
}

/**
 * Initialise le graphique des joints (Diagramme à Barres).
 * @returns {Chart} Instance du graphique.
 */
function initJointsChart() {
    const ctx = document.getElementById('jointsChart').getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Joints en bon état', 'Joints à remplacer', 'Joints à graisser'],
            datasets: [{
                label: 'Nombre de joints',
                data: [0, 0, 0],
                backgroundColor: ['#e2df13ff', '#eb7d16ff', '#e93f15ff'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false
                }
            }
        }
    });
}

/**
 * Met à jour les graphiques avec les données saisies par l'utilisateur.
 */
function updateCharts() {
    // 1. Récupération des données du Bois/Traverses
    const bonBois = parseFloat(document.getElementById('bois_1').value) || 0;
    const aRemplacerBois = parseFloat(document.getElementById('bois_2').value) || 0;
    // L'état des rails (bois_6) est une donnée qualitative, non utilisée dans ce graphique de quantité.

    // 2. Récupération des données des Joints
    const bonJoints = parseFloat(document.getElementById('bois_3').value) || 0;
    const aRemplacerJoints = parseFloat(document.getElementById('bois_4').value) || 0;
    const aGraisserJoints = parseFloat(document.getElementById('bois_5').value) || 0;

    // Mise à jour du graphique des traverses (Donut)
    if (traversesChartInstance) {
        traversesChartInstance.data.datasets[0].data = [bonBois, aRemplacerBois];
        traversesChartInstance.update();
    }

    // Mise à jour du graphique des joints (Barres)
    if (jointsChartInstance) {
        jointsChartInstance.data.datasets[0].data = [bonJoints, aRemplacerJoints, aGraisserJoints];
        jointsChartInstance.update();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // ... (Logique existante du DOMContentLoaded) ...

    // --- NOUVELLE LOGIQUE CHART.JS ---
    const tabBois = document.getElementById('tab-bois');

    if (tabBois) {
        // 1. Initialisation des graphiques
        traversesChartInstance = initTraversesChart();
        jointsChartInstance = initJointsChart();

        // 2. Ajout des écouteurs d'événements sur les inputs de la section "Bois"
        const inputsToListen = [
            document.getElementById('bois_1'),
            document.getElementById('bois_2'),
            document.getElementById('bois_3'),
            document.getElementById('bois_4'),
            document.getElementById('bois_5')
            // 'bois_6' est qualitatif et n'affecte pas les graphiques de quantité
        ];

        inputsToListen.forEach(input => {
            if (input) {
                // Écoute des événements 'input' (temps réel) et 'change'
                input.addEventListener('input', updateCharts);
                input.addEventListener('change', updateCharts);
            }
        });
    }
});