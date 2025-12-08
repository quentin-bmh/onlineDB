const SELECT_OPTIONS = {
    bavures: [
        { value: 'aucune', label: 'Aucune bavure' },
        { value: 'eliminees', label: 'Bavures éliminées par meulage' },
        { value: 'presence', label: 'Présence de bavures' }
    ],
    ebrechureAiguille: [
        { value: 'aucune', label: 'Aucune ébréchure' },
        { value: 'presence', label: 'Présence d\'ébréchure' }
    ],
    contactFente: [
        { value: 'dessous', label: 'en dessous' },
        { value: 'dessus', label: 'au dessus' }
    ],
    classement: [
        { value: 'bon', label: 'Bon' },
        { value: 'va', label: 'VA' },
        { value: 'vr', label: 'VR' },
        { value: 'vi', label: 'VI' }
    ],
    usureLCA: [
        { value: 'sup_3mm', label: '(j > 3mm)' },
        { value: 'inf_3mm', label: '(j < 3mm)' },
        { value: '0mm', label: '(j = 0)' }
    ],
    calibrePige: [
        { value: 'ne_passe_pas', label: 'ne passe pas' },
        { value: 'apres_meulage', label: 'après meulage' },
        { value: 'sans_meulage', label: 'sans meulage' }   
    ],
    usureLAPente: [
        { value: 'sup_60', label: '≥ 60°' },
        { value: 'inf_60', label: '≤ 60°' }
    ],
    usureLAContact: [
        { value: 'dessus_dessous', label: 'au dessus et en dessous' },
        { value: 'dessus', label: 'au dessus' },
        { value: 'dessous', label: 'en dessous' }
    ]
};
const DEMI_AIG_CONFIG = [
    { label: "Bavures", type: 'select', options: SELECT_OPTIONS.bavures }, // 1
    { label: "Ebrechure aiguille", type: 'select', options: SELECT_OPTIONS.ebrechureAiguille }, // 2
    { label: "Contact fente", type: 'select', options: SELECT_OPTIONS.contactFente }, // 3
    { label: "Longueur ébréchure sous fente repère", type: 'input_number' }, // 4
    { label: "Longueur totale de la zone ébréchée", type: 'input_number' }, // 5
    { label: "Ebrechure classement", type: 'select', options: SELECT_OPTIONS.classement }, // 6
    { label: "Demi-Aiguillage entrebaillement", type: 'input_number' }, // 7
    { label: "Demi-Aiguillage Etat butée", type: 'select', options: SELECT_OPTIONS.classement }, // 8
    { label: "Usure LCA", type: 'select', options: SELECT_OPTIONS.usureLCA }, // 9
    { label: "Usure LCA Calibre", type: 'select', options: SELECT_OPTIONS.calibrePige }, // 10
    { label: "Usure LCA Pige", type: 'select', options: SELECT_OPTIONS.calibrePige }, // 11
    { label: "Usure LCA Classement", type: 'select', options: SELECT_OPTIONS.classement }, // 12
    { label: "Usure LA Pente", type: 'select', options: SELECT_OPTIONS.usureLAPente }, // 13
    { label: "Usure LA Contact", type: 'select', options: SELECT_OPTIONS.usureLAContact }, // 14
    { label: "Usure LA Classement", type: 'select', options: SELECT_OPTIONS.classement } // 15
];
const DEMI_AIG_FIELD_MAPPING = {
    1: 'bavure',
    2: 'ebrechure_a',
    3: 'ctc_fente',
    4: 'taille_ebrechure_fente',
    5: 'taille_tot_ebrechure',
    6: 'ebrechure_a_classement',
    7: 'application_da_entrebaillement',
    8: 'application_da_etat_bute',
    9: 'usure_lca',
    10: 'usure_lca_calibre',
    11: 'usure_lca_pige',
    12: 'usure_lca_classement',
    14: 'usure_la_contact',
    13: 'usure_la_pente',
    15: 'usure_la_classement'
};
const DEMI_AIG_OUTPUT_ORDER = [
    'adv',
    'adv_type',
    'bavure',
    'usure_lca',
    'usure_lca_classement',
    'usure_lca_calibre',
    'usure_lca_pige',
    'usure_la_contact',
    'usure_la_pente',
    'usure_la_classement',
    'ebrechure_a',
    'application_da_etat_bute',
    'application_da_entrebaillement',
    'ebrechure_a_classement',
    'ctc_fente',
    'taille_ebrechure_fente',
    'taille_tot_ebrechure'
];
const DEMI_AIG_SELECT_VALUE_MAPPING = {
    'eliminees': 'bavures éliminées par meulage',
    'presence': 'Présence de bavures',
    'dessus': 'au dessus',
    'dessous': 'en dessous',
    'bon': 'Bon',
    'va': 'VA',
    'vr': 'VR',
    'vi': 'VI',
    'sup_3mm': '(j > 3mm)',
    'inf_3mm': '(j < 3mm)',
    '0mm': '(j = 0)',
    'ne_passe_pas': 'ne passe pas',
    'apres_meulage': 'après meulage',
    'sans_meulage': 'sans meulage',
    'sup_60': '>=60°',
    'inf_60': '<=60°',
    'dessus_dessous': 'au dessus et au dessous',
    'dessus': 'au dessus',
    'dessous': 'en dessous'
};
const ADV_CONFIG = {
    BS: {
        ecartement: [
            "Ecartement 1", "Ecartement 2", "Ecartement 3",
            "Ecartement 4", "Ecartement 5","Ecartement 6", "Ecartement 7",
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
    TJ: {
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
let ADV_CONFIG_NORMALIZED = {
    BS: ADV_CONFIG.BS,
    TJ: ADV_CONFIG.TJ,
    TO: ADV_CONFIG.TO
};
let map;
let marker = null;
let advMarkers;
const latInputId = 'general_3';
const lngInputId = 'general_4';
const initialLat = 48.8566;
const initialLng = 2.3522;
let traversesChartInstance = null;
let jointsChartInstance = null;

// État initial des données techniques pour la détection de modifications (version JSON stringifiée, SANS OBS)
let initialTechnicalState = null;

// Snapshot des données initiales (General + Specific + DA aplati) pour l'affichage du diff
let initialDataSnapshotObject = {};


/**
 * @param {string} labelText
 * @param {number} index
 * @returns {string}
 */
function generateEcartementInput(labelText, index) {
    const name = labelText.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const id = `ecartement_input_${index}`;
    return `<input type="number" 
                   class="ecartement-input"
                   id="${id}" 
                   name="ecart_${index}" 
                   title="${labelText}"
                   step="1" 
                   placeholder="${index}">`;
}
/**
 * @param {string} advType
 * @returns {string}
 */
function generateAttachesTableRows(advType) {
    const config = ADV_CONFIG_NORMALIZED[advType];
    let rowsHTML = '';
    const zoneLabels = config.ecartement.filter(label => 
        label.startsWith('Attaches efficaces')
    ).map(label => {
        const match = label.match(/\s(\w+'?)$/);
        return match ? match[1] : '';
    }).filter(zone => zone !== '');
    zoneLabels.forEach((zone, index) => {
        const zoneKey = zone.replace(/'/g, 'p'); 
        const nameEfficaces = `att_e_${zoneKey}`;
        const nameInefficaces = `att_i_${zoneKey}`;
        rowsHTML += `
            <tr>
                <td class="zone-label">${zone}</td>
                <td>
                    <input type="number" 
                           class="attaches-input efficaces"
                           name="${nameEfficaces}"
                           data-zone="${zoneKey}"
                           step="1"
                           min="0"
                           placeholder="0">
                </td>
                <td>
                    <input type="number" 
                           class="attaches-input inefficaces"
                           name="${nameInefficaces}"
                           data-zone="${zoneKey}"
                           step="1"
                           min="0"
                           placeholder="0">
                </td>
            </tr>
        `;
    });    
    return rowsHTML;
}
/**
 * @param {Object} rowConfig
 * @param {string} fieldName
 * @param {string} fieldId
 * @returns {string}
 */
function generateTableField(rowConfig, fieldName, fieldId) {
    if (rowConfig.type === 'select' && rowConfig.options) {
        let optionsHTML = rowConfig.options.map(opt =>
            `<option value="${opt.value}">${opt.label}</option>`
        ).join('');
        
        return `
            <select class="table-input" name="${fieldName}" id="${fieldId}">
                <option value="" selected>-- Choisir --</option>
                ${optionsHTML}
            </select>
        `;
    } else if (rowConfig.type === 'input_number') {
        return `<input type="number" class="table-input" name="${fieldName}" id="${fieldId}" step="1" placeholder="0">`;
    } else {
        return `<input type="text" class="table-input" name="${fieldName}" id="${fieldId}">`;
    }
}
/**
 * @param {string} advType
 * @returns {string}
 */
function generateDemiAiguillageTable(advType) {
    const config = ADV_CONFIG_NORMALIZED[advType];
    const labels = DEMI_AIG_CONFIG;
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
    const colNames = (advType === 'BS')
        ? ['Aiguillage Gauche (G)', 'Aiguillage Droite (D)']
        : Array.from({ length: 8 }, (_, i) => `Aig ${i + 1}`);
    colNames.forEach((name, index) => {
        const colIndex = index + 1;
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
    labels.forEach((rowConfig, i) => { 
        const rowIndex = i + 1; 
        let separatorClass = '';
        if (i === 0 || i === 1 || i === 6 || i === 8 || i === 12) {
            separatorClass = ' separator-row';
        }
        tableHTML += `<tr data-row-index="${rowIndex}" class="row-${rowIndex}${separatorClass}">
                        <td class="row-label">
                            ${rowConfig.label}
                        </td>`;        
        const colCodes = (advType === 'BS') ? ['g', 'd'] : Array.from({ length: 8 }, (_, i) => `${i + 1}`);
        for (let j = 1; j <= cols; j++) {
            const colIndexCode = colCodes[j - 1]; // g, d, 1, 2, ...
            const fieldName = `demiAig_${rowIndex}_${colIndexCode}`;
            const cleanLibelle = rowConfig.label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); 
            const fieldId = `demiAig_${rowIndex}_${colIndexCode}_${cleanLibelle}`; 

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
function updateForm() {
    const advType = document.getElementById('advType').value;
    const advForm = document.getElementById('advForm');
    const generalTypeInput = document.getElementById('general_2');
    if (generalTypeInput) {
        generalTypeInput.value = advType; 
    }
    const demiAiguillageTabBtn = document.querySelector('.tab-btn[data-tab="demiAiguillage"]');
    const demiAiguillageContent = document.getElementById('demi-aiguillage-content');
    const ecartementMainContainer = document.getElementById('ecartement-main-container');
    const attachesMainContainer = document.getElementById('attaches-main-container');
    const specificEcartementSections = document.querySelectorAll('#tab-ecartement .ecartement-type-content');
    const specificAttachesSections = document.querySelectorAll('#tab-attaches .attaches-type-content');    
    const croisementContainer = document.querySelector('#tab-croisement .voie-type-container');
    const specificCroisementSections = document.querySelectorAll('.croisement-type-content[data-type]');
    if (!advType) {
        advForm.classList.add('hidden');
        return;
    }
    advForm.classList.remove('hidden');
    const config = ADV_CONFIG_NORMALIZED[advType];
    const advTypeLower = advType.toLowerCase();
    specificCroisementSections.forEach(section => section.classList.add('hidden-adv-type'));
    const targetCroisement = document.querySelector(`.croisement-type-content[data-type="${advTypeLower}"]`);
    if (targetCroisement) {
        targetCroisement.classList.remove('hidden-adv-type');
    }
    croisementContainer.setAttribute('data-type', advTypeLower);
    specificEcartementSections.forEach(section => section.classList.add('hidden-adv-type'));
    const targetEcartement = document.querySelector(`#tab-ecartement .ecartement-type-content[data-type="${advTypeLower}"]`);    
    specificAttachesSections.forEach(section => section.classList.add('hidden-adv-type'));
    const targetAttaches = document.querySelector(`#tab-attaches .attaches-type-content[data-type="${advTypeLower}"]`);    
    if (targetEcartement && targetAttaches) {
        targetEcartement.classList.remove('hidden-adv-type');
        ecartementMainContainer.setAttribute('data-type', advTypeLower);
        const ecartementInputsDiv = targetEcartement.querySelector(`.ecartement-img-${advTypeLower}`);
        let ecartementInputsHTML = `
            <div class="ecartement-visual">
                ${ecartementInputsDiv.querySelector('img').outerHTML}
            </div>
            <div class="ecartement-inputs-list">
        `;        
        const ecartementLabels = config.ecartement.filter(label => label.startsWith('Ecartement'));        
        ecartementLabels.forEach((label, index) => {
            ecartementInputsHTML += `<div><label>${label}:</label>${generateEcartementInput(label, index + 1)}</div>`;
        });        
        ecartementInputsHTML += `</div>`;
        ecartementInputsDiv.innerHTML = ecartementInputsHTML;         
        targetAttaches.classList.remove('hidden-adv-type');
        attachesMainContainer.setAttribute('data-type', advTypeLower);
        const attachesTableBody = targetAttaches.querySelector(`.attaches-table[data-type="${advTypeLower}"] tbody`);
        attachesTableBody.innerHTML = generateAttachesTableRows(advType);
    } 
    if (config.demiAiguillageCols > 0) {
        demiAiguillageTabBtn.classList.remove('hidden');
        demiAiguillageContent.innerHTML = generateDemiAiguillageTable(advType);
    } else {
        demiAiguillageTabBtn.classList.add('hidden');
        const currentActiveTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        if (currentActiveTab === 'demiAiguillage') {
             switchTab('general');
        }
    }
    if (config.demiAiguillageCols > 0) {
        const table = document.querySelector('#demi-aiguillage-content table');
        if (table) {
            attachTableListeners(table);
        }
    }
}
/**
 * @returns {Chart}
 */
function initTraversesChart() {
    const ctx = document.getElementById('traversesChart').getContext('2d');
    if (!ctx) return null;
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Bois en bon état', 'Bois à remplacer'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#28a745', '#dc3545'],
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
 * @returns {Chart}
 */
function initJointsChart() {
    const ctx = document.getElementById('jointsChart').getContext('2d');
    if (!ctx) return null;
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Joints en bon état', 'Joints à remplacer', 'Joints à graisser'],
            datasets: [{
                label: 'Nombre de joints',
                data: [0, 0, 0],
                backgroundColor: ['#259116ff', '#eb1616ff', '#f3ef1dff'],
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
function updateCharts() {
    const bonBois = parseFloat(document.getElementById('bois_1').value) || 0;
    const aRemplacerBois = parseFloat(document.getElementById('bois_2').value) || 0;
    const bonJoints = parseFloat(document.getElementById('bois_3').value) || 0;
    const aRemplacerJoints = parseFloat(document.getElementById('bois_4').value) || 0;
    const aGraisserJoints = parseFloat(document.getElementById('bois_5').value) || 0;
    if (window.traversesChartInstance) {
        window.traversesChartInstance.data.datasets[0].data = [bonBois, aRemplacerBois];
        window.traversesChartInstance.update();
    }
    if (window.jointsChartInstance) {
        window.jointsChartInstance.data.datasets[0].data = [bonJoints, aRemplacerJoints, aGraisserJoints];
        window.jointsChartInstance.update();
    }
}
/**
 * @param {string} tabId
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
const contextMenu = document.getElementById('custom-context-menu');
const applyRowBtn = document.getElementById('apply-row');
const applyColBtn = document.getElementById('apply-col');
let targetCell = null; 

function hideContextMenu() {
    contextMenu.style.display = 'none';
    targetCell = null;
    applyRowBtn.classList.remove('hidden');
    applyColBtn.classList.remove('hidden');
}
/**
 * @param {HTMLInputElement|HTMLSelectElement} inputElement
 */
function resetInputValue(inputElement) {
    inputElement.value = '';
    inputElement.dispatchEvent(new Event('change'));
}
/**
 * @param {HTMLElement} table
 */
function resetAllTableInputs(table) {
    if (!table) return;
    table.querySelectorAll('.table-input').forEach(input => {
        resetInputValue(input);
    });
    table.querySelectorAll('.attaches-input').forEach(input => {
        resetInputValue(input);
    });
    table.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
        cell.innerText = '';
        cell.dispatchEvent(new Event('change'));
    });
}
/**
 * @param {HTMLElement} table
 * @param {number} sourceColIndex 
 */
function copyColumn(table, sourceColIndex) {
    table.querySelectorAll('tbody tr').forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length > sourceColIndex) {
            const sourceCell = cells[sourceColIndex];
            const sourceInput = sourceCell.querySelector('.table-input');
            let sourceValue;

            if (sourceInput) {
                sourceValue = sourceInput.value;
            } else if (sourceCell.getAttribute('contenteditable') === 'true') {
                sourceValue = sourceCell.innerText;
            } else {
                return;
            }
            cells.forEach((td, index) => {
                if (index > 0 && index !== sourceColIndex) { 
                    const targetInput = td.querySelector('.table-input');
                    
                    if (targetInput) {
                        targetInput.value = sourceValue;
                        targetInput.dispatchEvent(new Event('change'));
                    } else if (td.getAttribute('contenteditable') === 'true') {
                        td.innerText = sourceValue;
                        td.dispatchEvent(new Event('change'));
                    }
                }
            });
        }
    });
}
/**
 * @param {HTMLElement} table
 */
function attachTableListeners(table) {
    const tableContainer = table.closest('#demi-aiguillage-content') || table.closest('#attaches-main-container');
    if (!tableContainer) return;
    tableContainer.addEventListener('click', (e) => {
        const target = e.target;        
        if (target.id === 'reset-table-btn') {
            resetAllTableInputs(table);
            return;
        }        
        if (target.classList.contains('clear-col-btn')) {
            const header = target.closest('th');
            const columnIndex = parseInt(header.getAttribute('data-col-index'));            
            table.querySelectorAll('tbody tr').forEach((row) => {
                const cells = row.querySelectorAll('td');
                const effectiveIndex = columnIndex;                 
                if (cells[effectiveIndex]) { 
                    const input = cells[effectiveIndex].querySelector('.table-input') || cells[effectiveIndex].querySelector('.attaches-input');
                    const editable = cells[effectiveIndex].getAttribute('contenteditable') === 'true';
                    if (input) {
                        resetInputValue(input);
                    } else if (editable) {
                        cells[effectiveIndex].innerText = '';
                        cells[effectiveIndex].dispatchEvent(new Event('change'));
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
    });
    applyRowBtn.addEventListener('click', () => {
        if (!targetCell || targetCell.tagName !== 'TD' || targetCell.cellIndex === 0) {
            hideContextMenu();
            return;
        }
        const sourceInput = targetCell.querySelector('.table-input') || targetCell.querySelector('.attaches-input');
        let sourceValue;
        if (sourceInput) {
            sourceValue = sourceInput.value;
        } else if (targetCell.getAttribute('contenteditable') === 'true') {
            sourceValue = targetCell.innerText;
        } else {
            hideContextMenu();
            return;
        }        
        const row = targetCell.closest('tr');        
        if (row) {
            row.querySelectorAll('td').forEach((td, index) => {
                if (index > 0) {
                    const targetInput = td.querySelector('.table-input') || td.querySelector('.attaches-input');
                    
                    if (targetInput) {
                        targetInput.value = sourceValue;
                        targetInput.dispatchEvent(new Event('change')); 
                    } else if (td.getAttribute('contenteditable') === 'true') {
                        td.innerText = sourceValue;
                        td.dispatchEvent(new Event('change'));
                    }
                }
            });
        }
        hideContextMenu();
    });
}
/**
 * @param {Object} data
 * @param {string} advType
 */
function fillCroisementData(data, advType) {
    if (!data || Object.keys(data).length === 0) return;    
    const container = document.querySelector(`.croisement-type-content[data-type="${advType.toLowerCase()}"]`);
    if (!container) return;
    let reverseMapping = {};
    if (advType === 'BS') {
        reverseMapping = {
            'p2p_g': 'croisement_1', 
            'p2p_d': 'croisement_2', 
            'ep_cr_g': 'croisement_3',
            'ep_cr_d': 'croisement_4',
            'ep_cal_g': 'croisement_5',
            'ep_cal_d': 'croisement_6',
            'nb_cales_g': 'croisement_7', 
            'nb_cales_d': 'croisement_8',
            'coeur_num': 'croisement_9', 
            'coeur_etat': 'croisement_10' 
        };
    } else if (advType === 'TJ') {
        reverseMapping = {
            'ep_cr_g_h': 'croisement_h_1', 'ep_cal_g_h': 'croisement_h_2', 'nb_cal_g_h': 'croisement_h_3',
            'p2p_g_h': 'croisement_h_4', 'p2p_d_h': 'croisement_h_5', 'ep_cr_d_h': 'croisement_h_6',
            'ep_cal_d_h': 'croisement_h_7', 'nb_cal_d_h': 'croisement_h_8', 'coeur2c_num_h': 'croisement_h_9',
            'ep_cr_g_b': 'croisement_b_1', 'ep_cal_g_b': 'croisement_b_2', 'nb_cal_g_b': 'croisement_b_3',
            'p2p_g_b': 'croisement_b_4', 'p2p_d_b': 'croisement_b_5', 'ep_cr_d_b': 'croisement_b_6',
            'ep_cal_d_b': 'croisement_b_7', 'nb_cal_d_b': 'croisement_b_8', 'coeur2c_num_b': 'croisement_b_9',
            'p2pt_h_g': 'croisement_t_h_g', 'p2pt_h_d': 'croisement_t_h_d', 'libre_passage_g': 'croisement_l_p_g',
            'libre_passage_d': 'croisement_l_p_d', 'p2pt_b_g': 'croisement_t_b_g', 'p2pt_b_d': 'croisement_t_b_d',
            'coeur2t_num_g': 'croisement_c_t_g', 'coeur2t_num_d': 'croisement_c_t_d'
        };
    } else if (advType === 'TO') {
         reverseMapping = {
            'p2p_g_h': 'croisement_h_t_1', 'p2p_d_h': 'croisement_h_t_2', 'coeur2c_num_h': 'croisement_h_t_3',
            'p2p_g_b': 'croisement_b_t_1', 'p2p_d_b': 'croisement_b_t_2', 'coeur2c_num_b': 'croisement_b_t_3',
            'p2pt_h_g': 'croisement_t_t_h_g', 'p2pt_h_d': 'croisement_t_t_h_d', 'libre_passage_g': 'croisement_t_l_p_g',
            'libre_passage_d': 'croisement_t_l_p_d', 'p2pt_b_g': 'croisement_t_t_b_g', 'p2pt_b_d': 'croisement_t_t_b_d', 
            'coeur2t_num_g': 'croisement_t_c_t_g', 'coeur2t_num_d': 'croisement_t_c_t_d'
        };
    }
    Object.keys(reverseMapping).forEach(dbKey => {
        const inputName = reverseMapping[dbKey];
        if (data[dbKey] !== undefined && data[dbKey] !== null) {
            const inputElement = container.querySelector(`input[name="${inputName}"]`);
            if (inputElement) {
                inputElement.value = data[dbKey];
            }
        }
    });
}
/**
 * @param {string} advType
 * @returns {Object}
 */
function collectCroisementData(advType) {
    const data = {};
    const croisementContainer = document.querySelector(`.croisement-type-content[data-type="${advType.toLowerCase()}"]`);
    if (!croisementContainer) return data;
    const inputs = croisementContainer.querySelectorAll('input[name]');
    const mappingBS = {
        'croisement_1': 'p2p_g', 'croisement_2': 'p2p_d', 'croisement_3': 'ep_cr_g',
        'croisement_4': 'ep_cr_d', 'croisement_5': 'ep_cal_g', 'croisement_6': 'ep_cal_d',
        'croisement_7': 'nb_cales_g', 'croisement_8': 'nb_cales_d',
        'croisement_9': 'coeur_num', 'croisement_10': 'coeur_etat' 
    };
    const mappingTJ = {
        'croisement_h_1': 'ep_cr_g_h', 'croisement_h_2': 'ep_cal_g_h', 'croisement_h_3': 'nb_cal_g_h',
        'croisement_h_4': 'p2p_g_h', 'croisement_h_5': 'p2p_d_h', 'croisement_h_6': 'ep_cr_d_h',
        'croisement_h_7': 'ep_cal_d_h', 'croisement_h_8': 'nb_cal_d_h', 'croisement_h_9': 'coeur2c_num_h',
        'croisement_b_1': 'ep_cr_g_b', 'croisement_b_2': 'ep_cal_g_b', 'croisement_b_3': 'nb_cal_g_b',
        'croisement_b_4': 'p2p_g_b', 'croisement_b_5': 'p2p_d_b', 'croisement_b_6': 'ep_cr_d_b',
        'croisement_b_7': 'ep_cal_d_b', 'croisement_b_8': 'nb_cal_d_b', 'croisement_b_9': 'coeur2c_num_b',
        'croisement_t_h_g': 'p2pt_h_g', 'croisement_t_h_d': 'p2pt_h_d', 'croisement_l_p_g': 'libre_passage_g',
        'croisement_l_p_d': 'libre_passage_d', 'croisement_t_b_g': 'p2pt_b_g', 'croisement_t_b_d': 'p2pt_b_d',
        'croisement_c_t_g': 'coeur2t_num_g', 'croisement_c_t_d': 'coeur2t_num_d'
    };
    const mappingTO = {
        'croisement_h_t_1': 'p2p_g_h', 'croisement_h_t_2': 'p2p_d_h', 'croisement_h_t_3': 'coeur2c_num_h',
        'croisement_b_t_1': 'p2p_g_b', 'croisement_b_t_2': 'p2p_d_b', 'croisement_b_t_3': 'coeur2c_num_b',
        'croisement_t_t_h_g': 'p2pt_h_g', 'croisement_t_t_h_d': 'p2pt_h_d', 'croisement_t_l_p_g': 'libre_passage_g',
        'croisement_t_l_p_d': 'libre_passage_d', 'croisement_t_t_b_g': 'p2pt_b_g', 'croisement_t_t_b_d': 'p2pt_b_d', 
        'croisement_t_c_t_g': 'coeur2t_num_g', 'croisement_t_c_t_d': 'coeur2t_num_d'
    };
    let currentMapping;
    if (advType === 'BS') {
        currentMapping = mappingBS;
    } else if (advType === 'TJ') {
        currentMapping = mappingTJ;
    } else if (advType === 'TO') {
        currentMapping = mappingTO;
    } else {
        return data;
    }
    inputs.forEach(input => {
        const dbKey = currentMapping[input.name];
        if (dbKey) {
            let value = input.value.trim();            
            if (dbKey !== 'coeur_etat' && value !== '') {
                let parsedValue = parseInt(value, 10);
                if (isNaN(parsedValue)) {
                    parsedValue = parseFloat(value);
                }                
                if (!isNaN(parsedValue)) {
                    value = parsedValue;
                } else {
                    value = null;
                }
            } else if (value === '') {
                 if (dbKey !== 'coeur_etat') {
                     value = null;
                 } else {
                     value = ''; 
                 }
            }            
            data[dbKey] = value;
        }
    });
    return data;
}
/**
 * @returns {Object}
 */
function collectEcartementData() {
    const data = {};
    const inputs = document.querySelectorAll('#tab-ecartement input[name^="ecart_"]'); 
    inputs.forEach(input => {
        const indexMatch = input.name.match(/ecart_(\d+)$/);
        if (indexMatch) {
            const index = indexMatch[1];
            const dbKey = `ecart_${index}`;
            let value = input.value.trim();
            if (value !== '') {
                let parsedValue = parseInt(value);
                value = isNaN(parsedValue) ? null : parsedValue; 
            } else {
                value = null;
            }            
            data[dbKey] = value;
        }
    });
    Object.keys(data).forEach(key => (data[key] === null) && delete data[key]);    
    return data;
}
/**
 * @returns {Object}
 */
function collectAttachesData() {
    const data = {};
    const inputs = document.querySelectorAll('#tab-attaches input[type="number"]'); 
    const advType = document.getElementById('advType')?.value; 
    let validZoneRegex;
    if (advType === 'BS') {
        validZoneRegex = /^[1-9]$/; 
    } else if (advType === 'TJ' || advType === 'TO') {
        validZoneRegex = /^[1-8]p?$/; 
    } else {
        validZoneRegex = /^[1-9]p?$/; 
    }    
    inputs.forEach(input => {
        const name = input.name; 
        let value = input.value.trim();
        if (name && value !== '') {
            const parts = name.split('_'); 
            const zone = parts.pop();            
            const safeZone = zone; 
            const dbKey = name;
            if (!validZoneRegex.test(safeZone)) {
                return;
            }
            let parsedValue = parseInt(value, 10);
            
            if (!isNaN(parsedValue)) {
                value = Math.max(0, parsedValue); 
                data[dbKey] = value;
            }
        }
    });
    return data;
}
/**
 * @returns {Object}
 */
function collectBoisJointsData() {
    const boisBon = parseFloat(document.getElementById('bois_1')?.value) || null;
    const boisRemp = parseFloat(document.getElementById('bois_2')?.value) || null;
    const jointsBon = parseFloat(document.getElementById('bois_3')?.value) || null;
    const jointsRemp = parseFloat(document.getElementById('bois_4')?.value) || null;
    const jointsGraisser = parseFloat(document.getElementById('bois_5')?.value) || null;
    const etatRails = document.getElementById('bois_6')?.value || null;
    const data = {
        bois_bon: boisBon, 
        bois_a_remp: boisRemp,
        joints_bon: jointsBon,
        joints_a_repr: jointsRemp,
        joints_a_graisser: jointsGraisser,
        etat_rails: etatRails 
    };    
    Object.keys(data).forEach(key => (data[key] === null || data[key] === '') && delete data[key]);
    return data;
}
/**
 * @param {number} value
 * @returns {string}
 */
const formatPercentage = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return "0.00";
    return value.toFixed(2);
}
/**
 * @param {Object} data
 */
function calculateSpecificDataPercentages(data) {
    const attachZones = new Set();
    Object.keys(data).forEach(key => {
        const match = key.match(/^att_[ei]_(.+)$/); 
        if (match) attachZones.add(match[1]);
    });
    attachZones.forEach(zone => {
        const keyE = `att_e_${zone}`;
        const keyI = `att_i_${zone}`;        
        const countE = data[keyE] || 0;
        const countI = data[keyI] || 0;
        const total = countE + countI;
        if (total > 0) {
            data[`att_e_pct_${zone}`] = parseFloat(formatPercentage(countE / total)); 
            data[`att_i_pct_${zone}`] = parseFloat(formatPercentage(countI / total));
        } else {
            data[`att_e_pct_${zone}`] = 0.00; 
            data[`att_i_pct_${zone}`] = 0.00;
        }
    });    
    const boisBon = data.bois_bon || 0;
    const boisRemp = data.bois_a_remp || 0;
    const totalBois = boisBon + boisRemp;
    if (totalBois > 0) {
        data.bois_pct_remp = parseFloat(formatPercentage(boisRemp / totalBois));
    } else {
        data.bois_pct_remp = 0.00;
    }
    const jointsBon = data.joints_bon || 0;
    const jointsRemp = data.joints_a_repr || 0;
    const totalJoints = jointsBon + jointsRemp; 
    if (totalJoints > 0) {
        data.joints_pct_remp = parseFloat(formatPercentage(jointsRemp / totalJoints));
    } else {
        data.joints_pct_remp = 0.00;
    }
}
/**
 * @param {string} advType
 * @returns {Object}
 */
function collectSpecificTechnicalData(advType) {
    let specificData = {};
    const croisementData = collectCroisementData(advType);
    specificData = { ...specificData, ...croisementData };    
    const ecartementData = collectEcartementData();
    specificData = { ...specificData, ...ecartementData };    
    const attachesData = collectAttachesData();
    specificData = { ...specificData, ...attachesData };    
    const boisJointsData = collectBoisJointsData();
    specificData = { ...specificData, ...boisJointsData };
    calculateSpecificDataPercentages(specificData);
    specificData.type = advType;
    specificData.adv = document.getElementById('general_1').value;
    const obsInput = document.getElementById('obs_text');
    specificData.obs = obsInput ? obsInput.value.trim() : null;
    return specificData;
}
/**
 * @param {string} advType 
 * @returns {Array<Object>}
 */
function collectDemiAiguillageData(advType) {
    const advName = document.getElementById('general_1').value || null;
    const demiAigTable = document.querySelector('#tab-demiAiguillage table');
    const demiAigRaw = [];
    if (!demiAigTable || ADV_CONFIG_NORMALIZED[advType]?.demiAiguillageCols === 0) {
        return [];
    }
    const colCount = ADV_CONFIG_NORMALIZED[advType].demiAiguillageCols;
    const colLabels = (advType === 'BS') ? ['D', 'G'] : Array.from({ length: 8 }, (_, i) => String(i + 1));
    const isBS = advType === 'BS';
    for (let j = 1; j <= colCount; j++) {
        let aiguillageData = {
            adv: advName,
            adv_type: colLabels[j - 1],
        };
        let hasData = false;
        for (let i = 1; i <= 15; i++) {
            const row = demiAigTable.querySelector(`tr[data-row-index="${i}"]`);
            if (!row) continue;
            const cell = row.querySelector(`td[data-col-index="${j}"]`);
            if (!cell) continue;
            const fieldName = DEMI_AIG_FIELD_MAPPING[i];
            let value = null;
            const input = cell.querySelector('.table-input');
            if (input) {
                if (input.tagName === 'SELECT') {
                    const selectedOptionValue = input.value.trim();
                    if (selectedOptionValue !== '') {
                        if (i === 1) {
                             value = (selectedOptionValue === 'aucune') ? 'aucune bavure' : DEMI_AIG_SELECT_VALUE_MAPPING[selectedOptionValue] || selectedOptionValue;
                        } else if (i === 2) {
                             value = (selectedOptionValue === 'aucune') ? 'aucune ebrechure' : 'présence ébrechure';
                        } else if (i === 3) {
                            value = (selectedOptionValue === 'dessous') ? 'dessous' : 'dessus';
                        } else {
                            value = DEMI_AIG_SELECT_VALUE_MAPPING[selectedOptionValue] || selectedOptionValue;
                        }
                    }
                } else if (input.type === 'number' || input.type === 'text') {
                    const inputValue = input.value.trim();
                    if (inputValue !== '') {
                        let parsedValue = parseFloat(inputValue);
                        value = isNaN(parsedValue) ? inputValue : parsedValue;
                    }
                }
            }
            aiguillageData[fieldName] = (value === '' || value === 'NaN') ? null : value;
            if (aiguillageData[fieldName] !== null && fieldName !== 'adv' && fieldName !== 'adv_type') {
                hasData = true;
            }
        }
        if (hasData) {
             const orderedItem = {};
             DEMI_AIG_OUTPUT_ORDER.forEach(key => {
                 orderedItem[key] = aiguillageData[key] !== undefined ? aiguillageData[key] : null;
             });
             demiAigRaw.push(orderedItem);
        }
    }
    return demiAigRaw;
}

/**
 * Collecte toutes les données modifiables (Général, Spécifique, Demi-Aiguillage)
 * dans un seul objet plat pour la comparaison d'état (Diffing).
 * @returns {Object}
 */
function collectAllModifiableData() {
    const { generalData, specificData, demiAiguillageData } = splitFormData();
    
    let unifiedData = { ...generalData, ...specificData };
    
    // 1. Aplatir les données du Demi-Aiguillage pour la comparaison granulaire
    if (demiAiguillageData.length > 0) {
        demiAiguillageData.forEach(daItem => {
            const colLabel = daItem.adv_type; // 'D', 'G', '1', '2', etc.
            
            Object.keys(daItem).forEach(key => {
                if (key !== 'adv' && key !== 'adv_type') {
                    // Créer une clé unique : [fieldName]_DA_[colLabel]
                    const uniqueKey = `${key}_DA_${colLabel}`;
                    unifiedData[uniqueKey] = daItem[key];
                }
            });
        });
    }

    // 2. Nettoyage des clés (retrait des clés non nécessaires au diff)
    // delete unifiedData.adv;
    // delete unifiedData.type;
    delete unifiedData.obs;

    // Suppression des clés null/undefined/vides
    Object.keys(unifiedData).forEach(key => {
        if (unifiedData[key] === null || unifiedData[key] === undefined || unifiedData[key] === '') {
            delete unifiedData[key];
        }
    });

    return unifiedData;
}


/**
 * @returns {{generalData: Object, specificData: Object, demiAiguillageData: Array<Object>}}
 */
function splitFormData() {
    const advType = document.getElementById('advType').value;
    const advName = document.getElementById('general_1').value || null;
    if (!advType) {
        console.warn("Aucun type d'ADV n'est chargé.");
        return { generalData: null, specificData: null, demiAiguillageData: [] };
    }
    // Données Générales : Collecte directe des inputs
    const generalData = {
        adv: advName, 
        type: advType, 
        lat: parseFloat(document.getElementById('general_3').value) || null,
        long: parseFloat(document.getElementById('general_4').value) || null,
        tangente: parseFloat(document.getElementById('general_5').value) || null,
        modele: document.getElementById('general_6').value || null,
        plancher: document.getElementById('general_7').value || null,
        pose: document.getElementById('general_8').value || null,
        rails: document.getElementById('general_9').value || null,
        type_attaches: document.getElementById('general_10').value || null,
        sens_deviation: document.getElementById('general_11').value || null
    };
    // console.log("Données Générales collectées :", generalData);    
    Object.keys(generalData).forEach(key => (generalData[key] === null || generalData[key] === '') && delete generalData[key]);

    const specificData = collectSpecificTechnicalData(advType);
    const demiAiguillageData = collectDemiAiguillageData(advType);
    return { generalData, specificData, demiAiguillageData };
}
/**
 * @param {string} url
 * @param {Object|Array} data
 * @returns {Promise<Object>}
 */
async function postData(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP ${response.status} sur ${url}: ${errorText}`);
        }
        return response.json();
    } catch (error) {
        console.error('Erreur lors de la soumission des données à ' + url + ':', error);
        throw error; 
    }
}
/**
 * @param {string} url
 * @param {Object|Array} data
 * @param {string} method
 * @returns {Promise<Object>}
 */
async function putData(url, data, method = 'PUT') {
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP ${response.status} sur ${url}: ${errorText}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Erreur lors de la mise à jour (${method}) sur ${url}:`, error);
        throw error; 
    }
}
function initMap() {
    if (typeof L === 'undefined' || !document.getElementById('map')) {
        console.error("Leaflet ou l'élément 'map' n'est pas prêt.");
        return;
    }
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([initialLat, initialLng], 18);
    advMarkers = L.layerGroup();     
    const normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    });
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    });
    satelliteLayer.addTo(map);
    L.control.layers({
        "Plan Standard": normalLayer,
        "Satellite": satelliteLayer
    }).addTo(map);
    advMarkers.addTo(map);     
    const latInput = document.getElementById(latInputId);
    const lngInput = document.getElementById(lngInputId);
    
    if (latInput && lngInput) {
        latInput.addEventListener('input', handleCoordinateChange);
        lngInput.addEventListener('input', handleCoordinateChange);
        handleCoordinateChange(); 
    }
}
function handleCoordinateChange() {
    const lat = parseFloat(document.getElementById(latInputId).value);
    const lng = parseFloat(document.getElementById(lngInputId).value);
    if (map && !isNaN(lat) && lat >= -90 && lat <= 90 && !isNaN(lng) && lng >= -180 && lng <= 180) {
        const advName = document.getElementById('general_1').value || 'Point de visualisation';
        updateMapMarker(lat, lng, advName);
    } else if (map) {
         if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
    }
}
/**
 * @param {number} lat
 * @param {number} lng
 * @param {string} popupText
 */
function updateMapMarker(lat, lng, popupText = 'Point de visualisation') {
    if (!map) return; 
    advMarkers.clearLayers();
    if (marker) {
        map.removeLayer(marker);
    }
    const newLatLng = L.latLng(lat, lng);
    marker = L.marker(newLatLng)
        .bindPopup(`<b>${popupText}</b>`)
        .openPopup();        
    advMarkers.addLayer(marker);
    map.setView(newLatLng, map.getZoom() < 13 ? 13 : map.getZoom());     
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}
/**
 * @param {string} url 
 * @returns {Promise<Object|Array>}
 */
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (response.status === 404) return {}; 
        if (!response.ok) throw new Error(`Erreur de chargement des données: ${response.status} sur ${url}`);        
        const jsonResponse = await response.json();
        if (Array.isArray(jsonResponse) && jsonResponse.length === 1 && !url.includes('/b2v_da/')) {
            return jsonResponse[0];
        }
        return jsonResponse;
    } catch (e) {
        console.error("Erreur lors de la récupération des données de l'API:", e);
        throw e;
    }
}
async function loadAdvList() {
    const advSelect = document.getElementById('advSelect');
    advSelect.innerHTML = '<option value="">-- Charger un ADV --</option>';

    try {
        const advList = await fetchData('/api/adv_list');
        if (Array.isArray(advList)) {
             advList.forEach(adv => {
                const option = document.createElement('option');
                option.value = adv.adv;
                option.textContent = `${adv.adv}`;
                option.setAttribute('data-type', adv.type);
                advSelect.appendChild(option);
            });
        }
    } catch (e) {
        console.error("Échec du chargement de la liste des ADV.", e);
    }
}
async function loadAdvData() {
    const advSelect = document.getElementById('advSelect');
    const advName = advSelect.value;
    const advTypeDisplay = document.getElementById('advTypeDisplay');
    const advForm = document.getElementById('advForm');
    
    if (!advName) {
        advForm.classList.add('hidden');
        advTypeDisplay.textContent = 'Type: N/A';
        document.getElementById('advType').value = '';
        initialTechnicalState = null;
        initialDataSnapshotObject = {}; 
        return;
    }    
    const advType = advSelect.options[advSelect.selectedIndex].getAttribute('data-type');
    advTypeDisplay.textContent = `Type: ${advType}`;    
    document.getElementById('advType').value = advType; 
    document.getElementById('general_2').value = advType; 
    document.getElementById('general_1').value = advName; 
    advForm.classList.remove('hidden');
    updateForm(); 
    const encodedAdvName = encodeURIComponent(advName);
    try {
        const generalData = await fetchData(`/api/general_data?adv=${encodedAdvName}`);
        const advTypeLower = advType.toLowerCase();
        const specificData = await fetchData(`/api/${advTypeLower}/${encodedAdvName}`);        
        let demiAiguillageData = [];
        if (advType === 'BS' || advType === 'TJ') {
            demiAiguillageData = await fetchData(`/api/b2v_da/${encodedAdvName}`);
        }        
        fillGeneralData(generalData);
        fillSpecificData(specificData, advType);
        if (demiAiguillageData.length > 0) {
            fillDemiAiguillageData(demiAiguillageData, advType);
        }        
        handleCoordinateChange();
        updateCharts(); 

        // --- Décalage et capture de l'état initial ---
        setTimeout(() => {
            const obsInput = document.getElementById('obs_text');
            if(obsInput) {
                obsInput.value = ''; 
                obsInput.classList.remove('required-missing');
            }
            
            // Collecte de TOUTES les données modifiables pour l'initialisation
            const currentData = collectAllModifiableData();
            
            // Stockage de la version objet (pour l'affichage du diff) et de la version chaîne (pour le hasChanges)
            initialDataSnapshotObject = currentData;
            console.log("Données initiales chargées pour le diff :", initialDataSnapshotObject);
            initialTechnicalState = JSON.stringify(currentData);

            displayChangesList(); 
            updateUpdateButtonState();
        }, 200);
        
    } catch (e) {
        console.error("Échec du chargement des données de l'ADV", advName, e);
    }
}
/**
 * @param {Object} data
 */
function fillGeneralData(data) {
    if (!data || Object.keys(data).length === 0) return;
    document.getElementById('general_1').value = data.adv || '';
    document.getElementById('general_2').value = data.type || '';
    document.getElementById('general_3').value = data.lat || '';
    document.getElementById('general_4').value = data.long || '';
    document.getElementById('general_5').value = data.tangente || '';
    document.getElementById('general_6').value = data.modele || '';
    document.getElementById('general_7').value = data.plancher || '';
    document.getElementById('general_8').value = data.pose || '';
    document.getElementById('general_9').value = data.rails || '';
    document.getElementById('general_10').value = data.type_attaches || '';
    document.getElementById('general_11').value = data.sens_deviation || '';
}
/**
 * @param {Object} data
 * @param {string} advType
 */
function fillSpecificData(data, advType) {
    if (!data || Object.keys(data).length === 0) return;
    fillCroisementData(data, advType);
    document.querySelectorAll('#tab-ecartement input[name^="ecart_"]').forEach(input => {
        const dbKey = input.name;
        if (data[dbKey] !== undefined) {
            input.value = data[dbKey];
        }
    });
    document.querySelectorAll(`#tab-attaches input.attaches-input`).forEach(input => {
        const dbKey = input.name;
        
        if (data[dbKey] !== undefined && data[dbKey] !== null) {
             input.value = data[dbKey];
        }
    });
    if (data.bois_bon !== undefined) document.getElementById('bois_1').value = data.bois_bon;
    if (data.bois_a_remp !== undefined) document.getElementById('bois_2').value = data.bois_a_remp;
    if (data.joints_bon !== undefined) document.getElementById('bois_3').value = data.joints_bon;
    if (data.joints_a_repr !== undefined) document.getElementById('bois_4').value = data.joints_a_repr;
    if (data.joints_a_graisser !== undefined) document.getElementById('bois_5').value = data.joints_a_graisser;
    if (data.etat_rails !== undefined) document.getElementById('bois_6').value = data.etat_rails || 'bon'; 
}
/**
 * @param {Array<Object>} data
 * @param {string} advType
 */
function fillDemiAiguillageData(data, advType) {
    if (data.length === 0) return;
    const fieldMappingInverse = Object.keys(DEMI_AIG_FIELD_MAPPING).reduce((acc, key) => {
        acc[DEMI_AIG_FIELD_MAPPING[key]] = parseInt(key, 10);
        return acc;
    }, {});
    const reverseSelectMapping = {};
    Object.keys(DEMI_AIG_SELECT_VALUE_MAPPING).forEach(key => {
         const dbValue = DEMI_AIG_SELECT_VALUE_MAPPING[key];
         if (!reverseSelectMapping[dbValue]) {
             reverseSelectMapping[dbValue] = key;
         }
    });
    data.forEach(aiguillageData => {
        const colLabel = aiguillageData.adv_type;
        let columnIndex = -1;
        if (advType === 'BS') {
            columnIndex = colLabel === 'G' ? 2 : (colLabel === 'D' ? 1 : -1);
        } else {
            columnIndex = parseInt(colLabel, 10);
        }
        if (columnIndex === -1) return;
        Object.keys(aiguillageData).forEach(dbKey => {
            if (fieldMappingInverse[dbKey]) {
                const rowIndex = fieldMappingInverse[dbKey];
                const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
                if (!row) return;
                const cell = row.querySelector(`td[data-col-index="${columnIndex}"]`);
                if (!cell) return;
                const input = cell.querySelector('.table-input');
                let valueToSet = aiguillageData[dbKey];
                if (input && valueToSet !== null) {
                    if (input.tagName === 'SELECT') {
                        let finalValue = valueToSet;
                        if (dbKey === 'ctc_fente') {
                            finalValue = valueToSet;
                        } else if (dbKey === 'bavure' && valueToSet === 'aucune bavure') {
                            finalValue = 'aucune';
                        } else if (dbKey === 'ebrechure_a' && valueToSet === 'aucune ebrechure') {
                            finalValue = 'aucune';
                        } else if (dbKey === 'ebrechure_a' && valueToSet === 'présence ébrechure') {
                            finalValue = 'presence';
                        } else if (reverseSelectMapping[valueToSet]) {
                            finalValue = reverseSelectMapping[valueToSet];
                        }
                        input.value = finalValue;
                    } else {
                        input.value = valueToSet;
                    }
                }
            }
        });
    });
}
let userProfile = null;
async function fetchUserProfile() {
    try {
        const response = await fetch('/auth/profile');
        if (!response.ok) {
            console.error("Échec de la récupération du profil utilisateur.");
            return null;
        }
        const data = await response.json();
        if (data.success && data.user) {
            console.log("Profil utilisateur chargé:", data.user.username);
            return data.user;
        }
        return null;
    } catch (e) {
        console.error("Erreur réseau lors de la récupération du profil:", e);
        return null;
    }
}
async function sendUpdateFormData() {
    const { generalData: newGeneralData, specificData: newSpecificData, demiAiguillageData: newDemiAiguillageData } = splitFormData();    
    const advName = newGeneralData?.adv;
    const advType = newGeneralData?.type?.toUpperCase(); 
    const advTypeLower = advType?.toLowerCase();
    console.log(advName, advType, advTypeLower);

    if (!advName || !advType) {
        console.error("Impossible de soumettre : ADV ou type ADV manquant.");
        return;
    }

    const updateBtn = document.getElementById('updateAdvBtn');
    updateBtn.disabled = true;
    console.log('--- Démarrage de la mise à jour de l\'ADV ---');

    const timestamp = new Date().toISOString();
    const encodedAdvName = encodeURIComponent(advName);
    let historicSuccess = true;

    const changesList = getChangesList();
    // Utilise le username du profil chargé, ou un fallback
    const USER_ID = userProfile ? userProfile.username : 'utilisateur_anonyme'; 

    // --- Prétraitement pour l'Historisation (adv_X_historic) ---
    
    // oldSpecificData contient les données de l'état précédent (chargé dans initialDataSnapshotObject)
    let oldSpecificData = JSON.parse(JSON.stringify(initialDataSnapshotObject)); 
    const generalKeys = ['lat', 'long', 'tangente', 'modele', 'plancher', 'pose', 'rails', 'type_attaches', 'sens_deviation'];
    const daAppliedKeys = Object.keys(oldSpecificData).filter(key => key.includes('_DA_'));
    const keysToRemove = [...generalKeys, ...daAppliedKeys];

    keysToRemove.forEach(key => {
        delete oldSpecificData[key];
    });

    // --- ÉTAPE 1: Insertion dans adv_X_historic ---
    if (Object.keys(oldSpecificData).length > 2) {
        // Le nom de l'ADV est utilisé pour la référence
        oldSpecificData.snapshot_adv = advName; 
        oldSpecificData.snapshot_date = timestamp;

        // CORRECTION 1: Ajout du champ 'type'
        // Utilise le type ADV connu pour marquer la snapshot.
        oldSpecificData.type = advType; 
        
        // CORRECTION 2: Assure la présence du champ 'obs' (Observation)
        // Si 'obs' n'était pas chargé dans initialDataSnapshotObject, il est ajouté comme null.
        if (oldSpecificData.obs === undefined) {
             oldSpecificData.obs = null; 
        }

        try {
            const historicSpecificUrl = `/api/adv_historic/${advTypeLower}`; 
            await postData(historicSpecificUrl, oldSpecificData);
            console.log(`✅ Soumission Historique (ADV_${advType}) réussie.`);
        } catch (e) {
            console.error('❌ Échec de la soumission des données spécifiques historiques. Arrêt de la mise à jour.');
            historicSuccess = false; 
        }
    }
    
    // --- ÉTAPE 2: Insertion dans b2v_da_historic (si applicable) ---
    let oldDemiAiguillageData = [];
    if (historicSuccess && (advType === 'BS' || advType === 'TJ')) {
        try {
             oldDemiAiguillageData = await fetchData(`/api/b2v_da/${encodedAdvName}`); 
             oldDemiAiguillageData = oldDemiAiguillageData.map(item => ({
                 ...item,
                 snapshot_adv: advName,
                 snapshot_date: timestamp,
             }));

            const historicDaUrl = '/api/b2v_da_historic';
            await postData(historicDaUrl, oldDemiAiguillageData); 
            console.log('✅ Soumission Historique Demi-Aiguillage réussie.');
        } catch (e) {
            console.error('❌ Échec de la soumission des données DA historiques. Arrêt de la mise à jour.');
            historicSuccess = false; 
        }
    } else {
        oldDemiAiguillageData = [];
    }

    // --- ÉTAPE 3: Insertion du Log d'Audit (NOUVEAU) ---
    if (historicSuccess) {
        try {
            const logData = {
                adv_name: advName,
                user_id: USER_ID,
                // Utilise la nouvelle observation pour le log d'audit
                observation: newSpecificData.obs || 'Aucune observation fournie.', 
                changes_json: changesList,
                snapshot_date: timestamp
            };
            // L'URL utilisée dans le client est celle qui évite le conflit de routage côté serveur.
            await postData('/api/adv-audit-log', logData);
            console.log('✅ Soumission du Log d\'Audit réussie.');
        } catch (e) {
            console.error('❌ Échec de la soumission du Log d\'Audit.');
        }
    }
    
    if (!historicSuccess) {
        console.error("🛑 Mise à jour annulée car l'historique de données n'a pas pu être créé.");
        updateBtn.disabled = false;
        return; 
    }
    
    // --- ÉTAPE 4: Mise à jour réelle (PUT transactionnelle des données actives) ---
    try {
        const updateUrl = `/api/adv_update_transaction/${encodedAdvName}`;
        
        const payload = {
            generalData: newGeneralData,
            specificData: newSpecificData,
            demiAiguillageData: newDemiAiguillageData,
            advType: advType
        };

        await putData(updateUrl, payload, 'PUT'); 
        
        console.log("🎉 Mise à jour de l'ADV complétée avec succès (Transaction atomique) !");
        alert("Mise à jour effectuée avec succès.");
        const obsInput = document.getElementById('obs_text');
        if (obsInput) obsInput.value = '';
        
        const newData = collectAllModifiableData();
        initialDataSnapshotObject = newData;
        initialTechnicalState = JSON.stringify(newData);

        displayChangesList(); 

    } catch (e) {
        console.error("🛑 La mise à jour de l'ADV a échoué. Toutes les modifications de l'étape 2 ont été annulées (ROLLBACK).");
        console.log(`Détails: ${e.message}`);
        alert("Erreur lors de la mise à jour : " + e.message);
    } finally {
        updateBtn.disabled = false;
        updateUpdateButtonState(); 
    }
}

const DA_FIELDS_LABELS = {
    bavure: 'Bavures', ebrechure_a: 'Ébréchure aiguille', ctc_fente: 'Contact fente',
    taille_ebrechure_fente: 'Long. ébréchure sous fente repère', taille_tot_ebrechure: 'Long. totale ébréchée',
    ebrechure_a_classement: 'Ébréchure classement', application_da_entrebaillement: 'Entrebaillement',
    application_da_etat_bute: 'État butée', usure_lca: 'Usure LCA', usure_lca_calibre: 'Usure LCA Calibre',
    usure_lca_pige: 'Usure LCA Pige', usure_lca_classement: 'Usure LCA Classement', usure_la_pente: 'Usure LA Pente',
    usure_la_contact: 'Usure LA Contact', usure_la_classement: 'Usure LA Classement'
};

const FIELD_LABELS = {
    // Infos Générales (generalData)
    lat: 'Latitude', long: 'Longitude', tangente: 'Tangente', modele: 'Modèle ADV',
    plancher: 'Plancher', pose: 'Pose', rails: 'Rails', type_attaches: 'Type d\'attaches', sens_deviation: 'Sens de déviation',
    
    // Données Spécifiques (Croisement)
    p2p_g: 'Croisement - P2P Gauche', p2p_d: 'Croisement - P2P Droite', ep_cr_g: 'Croisement - Épaisseur CR Gauche', 
    ep_cr_d: 'Croisement - Épaisseur CR Droite', ep_cal_g: 'Croisement - Épaisseur Calage Gauche', ep_cal_d: 'Croisement - Épaisseur Calage Droite',
    nb_cales_g: 'Croisement - Nombre de Cales Gauche', nb_cales_d: 'Croisement - Nombre de Cales Droite', coeur_num: 'Croisement - N° Cœur de Croisement', 
    coeur_etat: 'Croisement - État Cœur',
    ep_cr_g_h: 'Croisement TJ - Épaisseur CR Haut G', ep_cal_g_h: 'Croisement TJ - Épaisseur Calage Haut G', nb_cal_g_h: 'Croisement TJ - Nbre Cales Haut G',
    p2p_g_h: 'Croisement TJ - P2P Haut G', p2p_d_h: 'Croisement TJ - P2P Haut D',
    ep_cr_d_h: 'Croisement TJ - Épaisseur CR Haut D', ep_cal_d_h: 'Croisement TJ - Épaisseur Calage Haut D', nb_cal_d_h: 'Croisement TJ - Nbre Cales Haut D',
    coeur2c_num_h: 'Croisement TJ - N° Cœur Croisement Haut',
    ep_cr_g_b: 'Croisement TJ - Épaisseur CR Bas G', ep_cal_g_b: 'Croisement TJ - Épaisseur Calage Bas G', nb_cal_g_b: 'Croisement TJ - Nbre Cales Bas G',
    p2p_g_b: 'Croisement TJ - P2P Bas G', p2p_d_b: 'Croisement TJ - P2P Bas D',
    ep_cr_d_b: 'Croisement TJ - Épaisseur CR Bas D', ep_cal_d_b: 'Croisement TJ - Épaisseur Calage Bas D', nb_cal_d_b: 'Croisement TJ - Nbre Cales Bas D',
    coeur2c_num_b: 'Croisement TJ - N° Cœur Croisement Bas',
    p2pt_h_g: 'Traversée TJ - P2PT Tête Haut G', p2pt_h_d: 'Traversée TJ - P2PT Tête Haut D', libre_passage_g: 'Traversée TJ - Libre Passage G',
    libre_passage_d: 'Traversée TJ - Libre Passage D', p2pt_b_g: 'Traversée TJ - P2PT Tête Bas G', p2pt_b_d: 'Traversée TJ - P2PT Tête Bas D',
    coeur2t_num_g: 'Traversée TJ - N° Cœur G', coeur2t_num_d: 'Traversée TJ - N° Cœur D',
    
    // Bois/Joints
    bois_bon: 'Traverses - Bon état', bois_a_remp: 'Traverses - À remplacer',
    joints_bon: 'Joints - Bon état', joints_a_repr: 'Joints - À réparer',
    joints_a_graisser: 'Joints - À graisser', etat_rails: 'Rails - État',

    // Ecartements
    ecart_1: 'Écartement 1', ecart_2: 'Écartement 2', ecart_3: 'Écartement 3', ecart_4: 'Écartement 4',
    ecart_5: 'Écartement 5', ecart_6: 'Écartement 6', ecart_7: 'Écartement 7', ecart_8: 'Écartement 8',
    
    // Attaches
    att_e_1: 'Attaches Efficaces Zone 1', att_i_1: 'Attaches Inefficaces Zone 1',
    att_e_2: 'Attaches Efficaces Zone 2', att_i_2: 'Attaches Inefficaces Zone 2',
    att_e_3: 'Attaches Efficaces Zone 3', att_i_3: 'Attaches Inefficaces Zone 3',
    att_e_4: 'Attaches Efficaces Zone 4', att_i_4: 'Attaches Inefficaces Zone 4',
    att_e_5: 'Attaches Efficaces Zone 5', att_i_5: 'Attaches Inefficaces Zone 5',
    att_e_6: 'Attaches Efficaces Zone 6', att_i_6: 'Attaches Inefficaces Zone 6',
    att_e_7: 'Attaches Efficaces Zone 7', att_i_7: 'Attaches Inefficaces Zone 7',
    att_e_8: 'Attaches Efficaces Zone 8', att_i_8: 'Attaches Inefficaces Zone 8',
    att_e_9: 'Attaches Efficaces Zone 9', att_i_9: 'Attaches Inefficaces Zone 9',
    att_e_1p: 'Attaches Efficaces Zone 1\'', att_i_1p: 'Attaches Inefficaces Zone 1\'',
    att_e_2p: 'Attaches Efficaces Zone 2\'', att_i_2p: 'Attaches Inefficaces Zone 2\'',
    att_e_3p: 'Attaches Efficaces Zone 3\'', att_i_3p: 'Attaches Inefficaces Zone 3\'',
    att_e_4p: 'Attaches Efficaces Zone 4\'', att_i_4p: 'Attaches Inefficaces Zone 4\'',
};
//il faut inverser DA Droite et Gauche pour résoudre le mapping??
Object.keys(DA_FIELDS_LABELS).forEach(fieldKey => {
    FIELD_LABELS[`${fieldKey}_DA_D`] = `${DA_FIELDS_LABELS[fieldKey]} (DA Gauche)`;
    FIELD_LABELS[`${fieldKey}_DA_G`] = `${DA_FIELDS_LABELS[fieldKey]} (DA Droite)`;
    for (let i = 1; i <= 8; i++) {
        FIELD_LABELS[`${fieldKey}_DA_${i}`] = `${DA_FIELDS_LABELS[fieldKey]} (DA Aig ${i})`;
    }
});


/**
 * Récupère la liste des changements entre l'état initial et l'état actuel
 * en comparant les objets unifiés complets.
 * @returns {Array<{label: string, oldValue: any, newValue: any}>}
 */
function getChangesList() {
    const currentData = collectAllModifiableData(); 
    const oldSnapshot = initialDataSnapshotObject;

    const changes = [];

    const allKeys = new Set([
        ...Object.keys(oldSnapshot),
        ...Object.keys(currentData)
    ]);
    
    allKeys.forEach(key => {
        // CORRECTION: Exclure explicitement toutes les clés terminant par '_pct' ou les clés système
        if (key.endsWith('_pct') || key === 'adv' || key === 'type' || key.startsWith('adv_') || key.startsWith('type_')) {
            return;
        }

        const oldValue = oldSnapshot[key] !== undefined ? oldSnapshot[key] : null;
        const newValue = currentData[key] !== undefined ? currentData[key] : null;

        // Conversion des valeurs pour la comparaison, en gérant les valeurs nulles
        const val1 = oldValue === null || oldValue === undefined ? '' : String(oldValue);
        const val2 = newValue === null || newValue === undefined ? '' : String(newValue);

        if (val1 !== val2) {
            const label = FIELD_LABELS[key] || key;
            
            let displayOldValue = oldValue === null || oldValue === undefined ? 'VIDE' : oldValue;
            let displayNewValue = newValue === null || newValue === undefined ? 'VIDE' : newValue;

            // Traduction des valeurs SELECT pour l'affichage DA (ex: 'sup_3mm' -> '(j > 3mm)')
            if (key.includes('_DA_')) {
                const fieldKeyBase = key.split('_DA_')[0];
                const daConfigItem = DEMI_AIG_CONFIG.find(item => Object.values(DEMI_AIG_FIELD_MAPPING).includes(fieldKeyBase));

                if (daConfigItem && daConfigItem.type === 'select') {
                    const findLabel = (value) => {
                        if (value === 'VIDE') return value;
                        // 1. Essayer de trouver le label dans les options SELECT
                        const match = daConfigItem.options.find(opt => String(opt.value) === String(value));
                        if (match) return match.label;
                        
                        // 2. Essayer de trouver le label dans le mapping DA plus complexe
                        const reverseMatchKey = Object.keys(DEMI_AIG_SELECT_VALUE_MAPPING).find(k => DEMI_AIG_SELECT_VALUE_MAPPING[k] === value);
                        if (reverseMatchKey) return DEMI_AIG_SELECT_VALUE_MAPPING[reverseMatchKey];
                        
                        return value; // Retourne la valeur brute si non trouvée
                    };
                    displayOldValue = findLabel(displayOldValue);
                    displayNewValue = findLabel(displayNewValue);
                }
            }
            
            changes.push({
                label: label,
                oldValue: displayOldValue,
                newValue: displayNewValue
            });
        }
    });
    for(let i = 0; i < changes.length; i++) {
        if(changes[i].label.includes('pct')) {
            changes.splice(i, 1);
            i--;            
        }
    }
    // console.log('Changements détectés:', changes);
    return changes;
}
/**
 * Affiche la liste des changements dans l'élément #changes-summary-content.
 */
function displayChangesList() {
    const summaryContent = document.getElementById('changes-summary-content');
    if (!summaryContent) return;

    const changes = getChangesList();
    let html = '';

    if (changes.length === 0) {
        html = '<p class="text-gray-500">Aucune modification détectée.</p>';
    } else {
        changes.forEach(change => {
            html += `
                <div class="change-item">
                    <span class="change-label">${change.label}</span>: 
                    <span class="change-values">
                        <span class="old-value">${change.oldValue}</span> 
                        &rarr; 
                        <span class="new-value">${change.newValue}</span>
                    </span>
                </div>
            `;
        });
    }

    summaryContent.innerHTML = html;
}

/**
 * @returns {boolean}
 */
function hasTechnicalChanges() {
    const currentTechnicalState = JSON.stringify(collectAllModifiableData());
    return initialTechnicalState !== currentTechnicalState;
}

function updateUpdateButtonState() {
    const updateBtn = document.getElementById('updateAdvBtn');
    if (!updateBtn) return;
    
    const obsInput = document.getElementById('obs_text');
    const obsFilled = obsInput && obsInput.value.trim() !== '';
    const changesMade = hasTechnicalChanges();
    
    // Mettre à jour la liste des changements
    displayChangesList(); 
    
    // Supprimer l'écouteur de redirection existant pour éviter les appels multiples
    updateBtn.removeEventListener('click', redirectToObservationTab);
    
    if (changesMade && obsFilled) {
        // État 1: Changements OK + Observation OK
        updateBtn.style.display = 'flex';
        updateBtn.disabled = false;
        updateBtn.textContent = '⬆️ Valider l\'intervention';
        
    } else if (changesMade && !obsFilled) {
        // État 2: Changements OK mais Observation MANQUANTE
        updateBtn.style.display = 'flex';
        updateBtn.disabled = false; 
        updateBtn.textContent = '⚠️ Renseignez l\'Observation';
        
        updateBtn.addEventListener('click', redirectToObservationTab);
        
    } else {
        // État 3: Aucun Changement Technique
        updateBtn.style.display = 'flex';
        updateBtn.disabled = true; 
        updateBtn.textContent = 'Pas de modification à envoyer';
    }
}

function redirectToObservationTab(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const obsInput = document.getElementById('obs_text');
    switchTab('observations');
    if (obsInput) {
        obsInput.classList.add('required-missing');
        obsInput.focus();
        obsInput.addEventListener('input', function removeErrorClass() {
            if (this.value.trim() !== '') {
                this.classList.remove('required-missing');
                updateUpdateButtonState();
                obsInput.removeEventListener('input', removeErrorClass);
            }
        }, { once: true });
    }
}

document.addEventListener('DOMContentLoaded', async() => {
    userProfile = await fetchUserProfile();
    if (!userProfile) {
        console.warn("Profil utilisateur non chargé. Utilisation d'un profil anonyme pour l'audit.");
    }
    loadAdvList(); 

    initMap(); 
    if (typeof Chart !== 'undefined' && document.getElementById('traversesChart')) {
        if (window.traversesChartInstance) window.traversesChartInstance.destroy();
        if (window.jointsChartInstance) window.jointsChartInstance.destroy();
        
        window.traversesChartInstance = initTraversesChart();
        window.jointsChartInstance = initJointsChart();
    }
    const advForm = document.getElementById('advForm');
    if (advForm) {
        // Mise à jour de l'état du bouton et de la liste de changements sur chaque input/change
        advForm.addEventListener('input', updateUpdateButtonState);
        advForm.addEventListener('change', updateUpdateButtonState);
    }
    
    // Écouteur de soumission du formulaire
    document.getElementById('advForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const changesMade = hasTechnicalChanges();
        const obsInput = document.getElementById('obs_text');
        const obsValue = obsInput ? obsInput.value.trim() : '';
        
        if (!changesMade) {
            alert("Aucune modification technique détectée. Mise à jour annulée.");
            return;
        }
        
        if (!obsValue) {
            redirectToObservationTab(e); 
            alert("Une observation est OBLIGATOIRE pour valider les modifications.");
            return;
        }
        
        sendUpdateFormData();
    });
    
    document.querySelectorAll('.tabs-nav').forEach(nav => {
        nav.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-btn')) {
                const tab = event.target.getAttribute('data-tab');
                switchTab(tab);
            }
        });
    });

    document.addEventListener('contextmenu', (e) => {
        const demiAiguillageContent = document.getElementById('tab-demiAiguillage'); 
        const attachesContent = document.getElementById('tab-attaches');

        const clickedTD = e.target.closest('td');

        if (clickedTD && clickedTD.cellIndex > 0 && 
           (demiAiguillageContent?.contains(e.target) || attachesContent?.contains(e.target))) {
            
            e.preventDefault();
            targetCell = clickedTD;
            const rect = clickedTD.getBoundingClientRect();
            
            contextMenu.style.left = `${rect.left}px`;
            contextMenu.style.display = 'block'; 
            const menuHeight = contextMenu.offsetHeight;
            contextMenu.style.top = `${rect.top - menuHeight}px`;

            applyRowBtn.classList.remove('hidden');
            applyColBtn.classList.add('hidden');
        } else {
            hideContextMenu();
        }
    });

    document.addEventListener('click', () => {
        hideContextMenu();
    });
    
    document.getElementById('advForm').addEventListener('click', (e) => {
        const target = e.target;
        const table = target.closest('table');
        if (!table) return;
        
        if (target.id === 'reset-table-btn') {
            resetAllTableInputs(table);
            return;
        }
    });
    
    const attachesTable = document.querySelector('.attaches-table');
    if (attachesTable) {
         attachTableListeners(attachesTable);
    }

    const inputsToListen = [
        document.getElementById('bois_1'),
        document.getElementById('bois_2'),
        document.getElementById('bois_3'),
        document.getElementById('bois_4'),
        document.getElementById('bois_5')
    ];

    inputsToListen.forEach(input => {
        if (input) {
            input.addEventListener('input', updateCharts);
            input.addEventListener('change', updateCharts);
        }
    });
});