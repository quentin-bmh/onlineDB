// Définition des options pour les sélecteurs, regroupées par thème
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

// Configuration des 15 lignes du Demi-Aiguillage :
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
        croisement: [
            "N° Cœur de croisement",	"Épaisseur contre-rail Gauche",	"Épaisseur de calage Gauche",
            "Nombre de cales Gauche",	"Épaisseur contre-rail Droite",	"Épaisseur de calage Droite",
            "Nombre de cales Droite",	"État Cœur"
        ],
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
        croisement: [
            "Epaisseur contre-rail haut Gauche", "Epaisseur calage haut Gauche", "Nombre cales haut Gauche",
            "Protection de pointe Croisement haut Gauche", "Protection de pointe Croisement haut Droite",
            "Protection de pointe Traversée haut Gauche", "Protection de pointe Traversée haut Droite",
            "Epaisseur contre-rail haut Droite", "Epaisseur calage haut Droite", "Nombre cales haut Droite",
            "Epaisseur contre-rail bas Gauche", "Epaisseur calage bas Gauche", "Nombre cales bas Gauche",
            "Protection de pointe Croisement bas Gauche", "Protection de pointe Croisement bas Droite",
            "Protection de pointe Traversée bas Gauche", "Protection de pointe Traversée bas Droite",
            "Epaisseur contre-rail bas Droite", "Epaisseur calage bas Droite", "Nombre cales bas Droite",
            "Coeur de croisement haut n°", "Coeur de croisement bas n°", "Coeur de traversée gauche n°", "Coeur de traversée droite n°"
        ],
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
        croisement: [
            "Protection de pointe haut Gauche", "Protection de pointe haut Droite",
            "Protection de pointe haut Gauche", "Protection de pointe haut Droite",
            "Coeur de croisement haut n°", "Coeur de croisement bas n°", "Coeur de traversée gauche n°", "Coeur de traversée droite n°"
        ],
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
 * Génère un champ label + input à partir d'une liste de libellés.
 * @param {string} section - Nom de la section (ex: 'croisement').
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

        // ... (Reste de la boucle for pour les TD) ...
        // ...
        
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

    if (!advType) {
        advForm.classList.add('hidden');
        return;
    }

    advForm.classList.remove('hidden');

    const config = ADV_CONFIG[advType];

    // 1. Mise à jour des champs 'Croisement'
    const croisementFieldsContainer = document.getElementById('croisement-fields');
    let croisementHTML = '';
    config.croisement.forEach((label, index) => {
        croisementHTML += generateSpecificField('croisement', label, index + 1);
    });
    croisementFieldsContainer.innerHTML = croisementHTML;

    // 2. Mise à jour des champs 'Écartement'
    const ecartementFieldsContainer = document.getElementById('ecartement-fields');
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
            const sourceInput = cells[sourceColIndex].querySelector('.table-input');
            if (!sourceInput) return;
            const sourceValue = sourceInput.value;
            
            // 2. Appliquer cette valeur à toutes les colonnes suivantes de la même ligne
            cells.forEach((td, index) => {
                // Copie vers toutes les colonnes qui suivent la source
                if (index > sourceColIndex) { 
                    const targetInput = td.querySelector('.table-input');
                    if (targetInput) {
                        targetInput.value = sourceValue;
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
        
        // 3. Copie Colonne (Icône TH)
        if (target.classList.contains('copy-col-btn')) {
            const header = target.closest('th');
            const sourceColIndex = parseInt(header.getAttribute('data-col-index'));
            copyColumn(table, sourceColIndex);
            return; 
        }

        // 4. Clear Ligne (Icône TD Libellé)
        if (target.classList.contains('clear-row-btn')) {
            const row = target.closest('tr');
            if (!row) return;

            // Parcourir toutes les cellules de contenu (TD index > 0) de la ligne
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


    // --- Logique du Clic Droit (Maintenue uniquement pour Appliquer à la Ligne) ---
    
    applyRowBtn.addEventListener('click', () => {
        // Logique de copie de ligne depuis la TD cliquée (maintenue)
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
        
        // On n'affiche le menu que si on clique sur une cellule de contenu (TD index > 0)
        if (demiAiguillageContent && demiAiguillageContent.contains(e.target)) {
            if (e.target.closest('td') && e.target.closest('td').cellIndex > 0) {
                e.preventDefault();
                targetCell = e.target.closest('td');

                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.top = `${e.clientY}px`;
                contextMenu.style.display = 'block';

                applyRowBtn.classList.remove('hidden'); // Option Ligne affichée
                applyColBtn.classList.add('hidden'); // Option Colonne masquée
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