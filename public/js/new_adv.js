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

// --- Ordre des clés pour l'affichage console (optionnel, mais garantit l'ordre pour le log) ---
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
    'dessous': 'dessous',
    'dessus': 'dessus',
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
                   name="${name}" 
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
        const nameEfficaces = `attaches_efficaces_${zone.replace(/'/g, 'p')}`;
        const nameInefficaces = `attaches_inefficaces_${zone.replace(/'/g, 'p')}`;

        rowsHTML += `
            <tr>
                <td class="zone-label">${zone}</td>
                <td contenteditable="true" class="attaches-data efficaces" data-name="${nameEfficaces}" data-zone="${zone}" data-type="number" placeholder="0"></td>
                <td contenteditable="true" class="attaches-data inefficaces" data-name="${nameInefficaces}" data-zone="${zone}" data-type="number" placeholder="0"></td>
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
        ? ['Aiguillage Gauche', 'Aiguillage Droite']
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

function updateForm() {
    const advType = document.getElementById('advType').value;
    const advForm = document.getElementById('advForm');
    const generalTypeInput = document.getElementById('general_2');
    if (generalTypeInput) {
        generalTypeInput.value = advType; 
    }
    const demiAiguillageTabBtn = document.querySelector('.tab-btn[data-tab="demiAiguillage"]');
    const demiAiguillageContent = document.getElementById('demi-aiguillage-content');
    const demiAiguillageTabPane = document.getElementById('tab-demiAiguillage');

    const ecartementTabBtn = document.querySelector('.tab-btn[data-tab="ecartement"]');
    const attachesTabBtn = document.querySelector('.tab-btn[data-tab="attaches"]');
    
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
    const targetCroisement = document.querySelector(`.croisement-type-content[data-type="${advTypeLower === 'tj' ? 'tj' : advTypeLower}"]`);
    if (targetCroisement) {
        targetCroisement.classList.remove('hidden-adv-type');
    }
    croisementContainer.setAttribute('data-type', advTypeLower);

    specificEcartementSections.forEach(section => section.classList.add('hidden-adv-type'));
    const targetEcartement = document.querySelector(`#tab-ecartement .ecartement-type-content[data-type="${advTypeLower}"]`);
    
    specificAttachesSections.forEach(section => section.classList.add('hidden-adv-type'));
    const targetAttaches = document.querySelector(`#tab-attaches .attaches-type-content[data-type="${advTypeLower}"]`);

    
    if (targetEcartement && targetAttaches) {
        ecartementTabBtn.classList.remove('hidden');
        attachesTabBtn.classList.remove('hidden');
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

    } else {
        ecartementTabBtn.classList.add('hidden');
        attachesTabBtn.classList.add('hidden');
    }

    if (config.demiAiguillageCols > 0) {
        demiAiguillageTabBtn.classList.remove('hidden');
        demiAiguillageTabPane.classList.remove('hidden');
        demiAiguillageContent.innerHTML = generateDemiAiguillageTable(advType);
    } else {
        demiAiguillageTabBtn.classList.add('hidden');
        demiAiguillageTabPane.classList.add('hidden');
        const currentActiveTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        if (currentActiveTab === 'demiAiguillage' || currentActiveTab === 'ecartement' || currentActiveTab === 'attaches') {
             switchTab('general');
        }
    }
}
let traversesChartInstance = null;
let jointsChartInstance = null;

/**
 * @returns {Chart} Instance du graphique.
 */
function initTraversesChart() {
    const ctx = document.getElementById('traversesChart').getContext('2d');
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

    if (traversesChartInstance) {
        traversesChartInstance.data.datasets[0].data = [bonBois, aRemplacerBois];
        traversesChartInstance.update();
    }
    if (jointsChartInstance) {
        jointsChartInstance.data.datasets[0].data = [bonJoints, aRemplacerJoints, aGraisserJoints];
        jointsChartInstance.update();
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
 * @param {string} advType
 * @returns {Object}
 */
function collectCroisementData(advType) {
    const data = {};
    const croisementContainer = document.querySelector(`.croisement-type-content[data-type="${advType.toLowerCase() === 'tj' ? 'tj' : advType.toLowerCase()}"]`);

    if (!croisementContainer) return data;
    const inputs = croisementContainer.querySelectorAll('input[name]');
    const mappingBS = {
        'croisement_1': 'p2p_g', 
        'croisement_2': 'p2p_d', 
        'croisement_3': 'ep_cr_g',
        'croisement_4': 'ep_cr_d',
        'croisement_5': 'ep_cal_g',
        'croisement_6': 'ep_cal_d',
        'croisement_7': 'nb_cales_g',
        'croisement_8': 'nb_cales_d',
        'croisement_9': 'coeur_num', 
        'croisement_10': 'coeur_etat' 
    };
    const mappingTJ = {
        'croisement_h_1': 'ep_cr_g_h',
        'croisement_h_2': 'ep_cal_g_h',
        'croisement_h_3': 'nb_cal_g_h',
        'croisement_h_4': 'p2p_g_h',
        'croisement_h_5': 'p2p_d_h',
        'croisement_h_6': 'ep_cr_d_h',
        'croisement_h_7': 'ep_cal_d_h',
        'croisement_h_8': 'nb_cal_d_h',
        'croisement_h_9': 'coeur2c_num_h',
        // Cœur Bas (b)
        'croisement_b_1': 'ep_cr_g_b',
        'croisement_b_2': 'ep_cal_g_b',
        'croisement_b_3': 'nb_cal_g_b',
        'croisement_b_4': 'p2p_g_b',
        'croisement_b_5': 'p2p_d_b',
        'croisement_b_6': 'ep_cr_d_b',
        'croisement_b_7': 'ep_cal_d_b',
        'croisement_b_8': 'nb_cal_d_b',
        'croisement_b_9': 'coeur2c_num_b',
        // Cœur de Traversée (t)
        'croisement_t_h_g': 'p2pt_h_g',
        'croisement_t_h_d': 'p2pt_h_d',
        'croisement_l_p_g': 'libre_passage_g',
        'croisement_l_p_d': 'libre_passage_d',
        'croisement_t_b_g': 'p2pt_b_g',
        'croisement_t_b_d': 'p2pt_b_d',
        'croisement_c_t_g': 'coeur2t_num_g',
        'croisement_c_t_d': 'coeur2t_num_d'
    };

    const mappingTO = {
        // Cœur Haut (h_t)
        'croisement_h_t_1': 'p2p_g_h', 
        'croisement_h_t_2': 'p2p_d_h',
        'croisement_h_t_3': 'coeur2c_num_h',
        // Cœur Bas (b_t)
        'croisement_b_t_1': 'p2p_g_b', 
        'croisement_b_t_2': 'p2p_d_b',
        'croisement_b_t_3': 'coeur2c_num_b',
        // Cœur de Traversée (t_t)
        'croisement_t_t_h_g': 'p2pt_h_g', 
        'croisement_t_t_h_d': 'p2pt_h_d', 
        'croisement_t_l_p_g': 'libre_passage_g',
        'croisement_t_l_p_d': 'libre_passage_d',
        'croisement_t_t_b_g': 'p2pt_b_g', 
        'croisement_t_t_b_d': 'p2pt_b_d', 
        'croisement_t_c_t_g': 'coeur2t_num_g',
        'croisement_t_c_t_d': 'coeur2t_num_d'
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
    const inputs = document.querySelectorAll('#tab-ecartement input[name^="ecartement_"]');

    inputs.forEach(input => {
        const indexMatch = input.name.match(/(\d+)$/);
        if (indexMatch) {
            const index = indexMatch[1];
            const dbKey = `ecart_${index}`;
            let value = input.value.trim();

            if (value !== '') {
                // Conversion numérique
                let parsedValue = parseFloat(value);
                if (!isNaN(parsedValue)) {
                    // Les écartements sont souvent des entiers
                    value = Math.round(parsedValue); 
                } else {
                    value = null; 
                }
            } else {
                value = null;
            }
            
            data[dbKey] = value;
        }
    });

    // Nettoyage: supprimer les clés nulles
    Object.keys(data).forEach(key => (data[key] === null) && delete data[key]);
    
    return data;
}

/**
 * @returns {Object}
 */
function collectAttachesData() {
    const data = {};
    const cells = document.querySelectorAll('#tab-attaches td[contenteditable="true"]');

    // Regex pour valider les zones (ex: 1, 2, 8, 1p, 2p, 4p)
    // Seules les zones 1 à 8 (et leurs primes) sont valides pour TJ/TO/BS
    const validZoneRegex = /^[1-8]p?$/; 

    cells.forEach(cell => {
        const name = cell.getAttribute('data-name'); 
        let value = cell.innerText.trim();

        if (name && value !== '') {
            const parts = name.split('_'); 
            const zone = parts.pop(); 
            const type = parts[1]; 
            
            const safeZone = zone; 
            let dbKey = '';
            
            // --- NOUVELLE VÉRIFICATION DE ZONE ---
            if (!validZoneRegex.test(safeZone)) {
                return; // Ignore les zones invalides (ex: '9')
            }
            // ------------------------------------
            
            if (type === 'efficaces') {
                dbKey = `att_e_${safeZone}`; 
            } else if (type === 'inefficaces') {
                dbKey = `att_i_${safeZone}`; 
            }
            
            if (dbKey) {
                let parsedValue = parseInt(value, 10);
                value = isNaN(parsedValue) ? null : parsedValue;

                if (value !== null) {
                    data[dbKey] = value;
                }
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
        // Mappage basé sur les exemples JSON (/bs, /tj, /to)
        bois_bon: boisBon, 
        bois_a_remp: boisRemp,
        joints_bon: jointsBon,
        joints_a_repr: jointsRemp,
        joints_a_graisser: jointsGraisser,
        etat_rails: etatRails 
    };
    
    // Nettoyage: supprimer les clés nulles ou vides
    Object.keys(data).forEach(key => (data[key] === null || data[key] === '') && delete data[key]);

    return data;
}


/**
 * @param {string} advType 
 * @returns {Array<Object>}
 */
function collectDemiAiguillageData(advType) {
    const advName = document.getElementById('general_1').value || null;
    const demiAigTable = document.querySelector('#tab-demiAiguillage table');
    const demiAigRaw = [];
    const demiAigData = [];

    if (!demiAigTable || ADV_CONFIG_NORMALIZED[advType].demiAiguillageCols === 0) {
        return demiAigData;
    }

    const colCount = ADV_CONFIG_NORMALIZED[advType].demiAiguillageCols;
    const colLabels = (advType === 'BS') ? ['D', 'G'] : Array.from({ length: 8 }, (_, i) => String(i + 1));

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
                             value = (selectedOptionValue === 'aucune')
                                 ? 'aucune bavure'
                                 : DEMI_AIG_SELECT_VALUE_MAPPING[selectedOptionValue] || selectedOptionValue;
                        } else if (i === 2) {
                             value = (selectedOptionValue === 'aucune') ? 'aucune ebrechure' : 'présence ébrechure';
                        } else if (i === 3) {
                             value = selectedOptionValue;
                        } else if ([6, 8, 12, 15].includes(i)) {
                             value = DEMI_AIG_SELECT_VALUE_MAPPING[selectedOptionValue] || selectedOptionValue;
                        } else if (i === 14) {
                            value = DEMI_AIG_SELECT_VALUE_MAPPING[selectedOptionValue] || selectedOptionValue;
                        } else {
                            value = DEMI_AIG_SELECT_VALUE_MAPPING[selectedOptionValue] || selectedOptionValue;
                        }
                    }
                } else if (input.type === 'number' || input.type === 'text') {
                    const inputValue = input.value.trim();
                    if (inputValue !== '') {
                        let parsedValue = parseFloat(inputValue);
                        value = (i === 7) ? parseInt(inputValue, 10) : parsedValue;
                        value = isNaN(value) ? inputValue : value;
                    }
                }
            }

            aiguillageData[fieldName] = (value === '' || value === 'NaN') ? null : value;

            if (aiguillageData[fieldName] !== null) {
                hasData = true;
            }
        }

        if (hasData) {
             demiAigRaw.push(aiguillageData);
        }
    }

    demiAigRaw.forEach(rawItem => {
        const orderedItem = {};
        DEMI_AIG_OUTPUT_ORDER.forEach(key => {
            orderedItem[key] = rawItem[key] !== undefined ? rawItem[key] : null;
        });
        if (orderedItem.adv_type !== null) {
             demiAigData.push(orderedItem);
        }
    });

    return demiAigData;
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
        // Capture les zones sécurisées (ex: 1, 2, 1p, 2p)
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
            // Utilisation de la clé SANS apostrophe (ex: att_e_pct_1p)
            data[`att_e_pct_${zone}`] = formatPercentage(countE / total); 
            data[`att_i_pct_${zone}`] = formatPercentage(countI / total);
        } else {
            data[`att_e_pct_${zone}`] = "0.00"; 
            data[`att_i_pct_${zone}`] = "0.00";
        }
    });
    
    // ... (Reste de la fonction pour bois/joints)
    const boisBon = data.bois_bon || 0;
    const boisRemp = data.bois_a_remp || 0;
    const totalBois = boisBon + boisRemp;

    if (totalBois > 0) {
        data.bois_pct_remp = formatPercentage(boisRemp / totalBois);
    } else {
        data.bois_pct_remp = "0.00";
    }
    const jointsBon = data.joints_bon || 0;
    const jointsRemp = data.joints_a_repr || 0;
    const totalJoints = jointsBon + jointsRemp; 

    if (totalJoints > 0) {
        data.joints_pct_remp = formatPercentage(jointsRemp / totalJoints);
    } else {
        data.joints_pct_remp = "0.00";
    }
}


/**
 * @param {string} advType
 * @returns {Object}
 */
function collectSpecificTechnicalData(advType) {
    let specificData = {};

    // 1. Croisement
    const croisementData = collectCroisementData(advType);
    specificData = { ...specificData, ...croisementData };
    
    // 2. Écartement
    const ecartementData = collectEcartementData();
    specificData = { ...specificData, ...ecartementData };
    
    // 3. Attaches
    const attachesData = collectAttachesData();
    specificData = { ...specificData, ...attachesData };
    
    // 4. Bois/Joints
    const boisJointsData = collectBoisJointsData();
    specificData = { ...specificData, ...boisJointsData };

    // --- 5. Calcul des Pourcentages ---
    calculateSpecificDataPercentages(specificData);

    // 6. Normalisation et Ajout des clés ADV
    // Normalisation du Type pour la base de données (TJ -> TJ)
    specificData.type = (advType === 'TJ') ? 'TJ' : advType;
    
    // Ajout du nom ADV pour l'insertion
    specificData.adv = document.getElementById('general_1').value;

    return specificData;
}


/**
 * @returns {{generalData: Object, specificData: Object, demiAiguillageData: Array<Object>}} Les données séparées.
 */
function splitFormData() {
    const advType = document.getElementById('advType').value;
    
    if (!advType) {
        console.warn("Aucun type d'ADV sélectionné.");
        return { generalData: null, specificData: null, demiAiguillageData: null };
    }
    const advName = document.getElementById('general_1').value;
    const tangente = document.getElementById('general_5').value;
    const latitude = document.getElementById('general_3').value;
    const longitude = document.getElementById('general_4').value;

    const generalData = {
        adv: advName, 
        type: advType, 
        lat: parseFloat(latitude) || null,
        long: parseFloat(longitude) || null,
        tangente: parseFloat(tangente) || null,
        modele: document.getElementById('general_6').value,
        plancher: document.getElementById('general_7').value,
        pose: document.getElementById('general_8').value,
        rails: document.getElementById('general_9').value,
        type_attaches: document.getElementById('general_10').value,
        sens_deviation: document.getElementById('general_11').value
    };
    // Données techniques spécifiques (Croisement, Ecartement, Attaches, Bois/Joints)
    const specificData = collectSpecificTechnicalData(advType);
    
    // Données de Demi-Aiguillage
    const demiAiguillageData = collectDemiAiguillageData(advType);

    return { generalData, specificData, demiAiguillageData };
}

/**
 * Envoie les données à la route API spécifiée via POST.
 * @param {string} url - L'URL de l'API.
 * @param {Object|Array} data - Les données à envoyer.
 * @returns {Promise<Object>} La réponse JSON de l'API.
 */
async function postData(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
 * Orchestre la soumission de toutes les parties du formulaire aux routes backend.
 */
/**
 * Orchestre la soumission de toutes les parties du formulaire aux routes backend 
 * (basées sur les noms des tables de la BDD).
 */
async function sendFormData() {
    const { generalData, specificData, demiAiguillageData } = splitFormData();
    
    // Si generalData n'est pas fourni, le type sera null, ce qui est géré.
    const advType = generalData?.type.toLowerCase(); 

    if (!generalData || !advType) {
        console.error("Impossible de soumettre : Données générales manquantes ou type ADV invalide.");
        return;
    }
    
    console.log('--- Démarrage de la soumission de l\'ADV ---');

    let success = true;

    // 1. Soumission des Données Générales (Table: general_data)
    try {
        const generalUrl = '/api/general_data';
        console.log(`POST ${generalUrl} avec:`, generalData);
        await postData(generalUrl, generalData);
        console.log('✅ Soumission Données Générales réussie.');
    } catch (e) {
        console.error('❌ Échec de la soumission des données générales.');
        success = false;
    }

    // 2. Soumission des Données Spécifiques (Table: adv_bs, adv_tj, adv_to)
    if (success) {
        try {
            const specificUrl = `/api/adv_${advType}`; // Construit /adv_bs, /adv_tj, ou /adv_to
            console.log(`POST ${specificUrl} avec:`, specificData);
            await postData(specificUrl, specificData);
            console.log(`✅ Soumission Données Spécifiques (ADV_${advType.toUpperCase()}) réussie.`);
        } catch (e) {
            console.error('❌ Échec de la soumission des données spécifiques.');
            success = false;
        }
    }

    // 3. Soumission des Données de Demi-Aiguillage (Table: b2v_da)
    if (success && (advType === 'bs' || advType === 'tj') && demiAiguillageData.length > 0) {
        try {
            const daUrl = '/api/b2v_da';
            console.log(`POST ${daUrl} avec:`, demiAiguillageData);
            // Soumission du tableau d'objets (chaque élément est un demi-aiguillage)
            await postData(daUrl, demiAiguillageData); 
            console.log('✅ Soumission Données Demi-Aiguillage (b2v_da) réussie.');
        } catch (e) {
            console.error('❌ Échec de la soumission des données de demi-aiguillage.');
            success = false;
        }
    }
    
    if (success) {
        console.log("🎉 Création de l'ADV complétée avec succès !");
    } else {
        console.error("🛑 La création de l'ADV a échoué.");
    }
}


let map;
let marker = null;
let advMarkers;
const latInputId = 'general_3';
const lngInputId = 'general_4';
// Définition de coordonnées initiales (ex: Paris)
const initialLat = 48.8566;
const initialLng = 2.3522;


/**
 * Initialise la carte Leaflet et attache les écouteurs.
 */
function initMap() {
    // Vérifier si Leaflet est chargé et si l'élément map existe
    if (typeof L === 'undefined' || !document.getElementById('map')) {
        console.error("Leaflet ou l'élément 'map' n'est pas prêt.");
        return;
    }

    // Initialisation de la carte sur la div 'map'
    map = L.map('map').setView([initialLat, initialLng], 13); // Zoom par défaut sur Paris

    advMarkers = L.layerGroup(); // Initialisation du groupe de marqueurs
    
    // Définition des couches de tuiles (Plan Standard et Satellite)
    const normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    });

    // Ajouter la couche Satellite par défaut
    satelliteLayer.addTo(map);

    // Contrôle des couches
    L.control.layers({
        "Plan Standard": normalLayer,
        "Satellite": satelliteLayer
    }).addTo(map);

    advMarkers.addTo(map); // Ajout du groupe de marqueurs à la carte
    
    // Attachement des écouteurs d'événements aux champs d'entrée
    const latInput = document.getElementById(latInputId);
    const lngInput = document.getElementById(lngInputId);
    
    // Écoute des événements 'input' pour une mise à jour immédiate
    if (latInput && lngInput) {
        latInput.addEventListener('input', handleCoordinateChange);
        lngInput.addEventListener('input', handleCoordinateChange);

        // Assurer l'initialisation des valeurs si l'HTML ne les a pas
        if (!latInput.value) latInput.value = initialLat;
        if (!lngInput.value) lngInput.value = initialLng;
        
        // --- CORRECTION: Déclenchement de la mise à jour initiale ---
        // Simule le changement, forçant l'appel à updateMapMarker() qui contient map.invalidateSize()
        handleCoordinateChange(); 
    }
}


/**
 * Gère les changements dans les inputs de coordonnées.
 */
function handleCoordinateChange() {
    const lat = parseFloat(document.getElementById(latInputId).value);
    const lng = parseFloat(document.getElementById(lngInputId).value);

    // Vérification que les valeurs sont des nombres valides
    if (map && !isNaN(lat) && lat >= -90 && lat <= 90 && !isNaN(lng) && lng >= -180 && lng <= 180) {
        const advName = document.getElementById('general_1').value || 'Point de visualisation';
        updateMapMarker(lat, lng, advName);
    } else if (map) {
         // Retirer le marqueur si les coordonnées sont invalides ou manquantes
         if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
    }
}


/**
 * Met à jour la position du marqueur et l'affichage de la carte.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} popupText - Texte à afficher dans la popup
 */
function updateMapMarker(lat, lng, popupText = 'Point de visualisation') {
    if (!map) return; // S'assurer que la carte est initialisée

    // S'assurer que le groupe de marqueurs est vide
    advMarkers.clearLayers();

    // Si un marqueur existait, le retirer de la carte
    if (marker) {
        map.removeLayer(marker);
    }

    // Créer et ajouter le nouveau marqueur au groupe et à la carte
    const newLatLng = L.latLng(lat, lng);
    marker = L.marker(newLatLng)
        .bindPopup(`<b>${popupText}</b>`)
        .openPopup();
        
    advMarkers.addLayer(marker);

    // Centrer la carte sur le nouveau marqueur
    map.setView(newLatLng, map.getZoom() < 13 ? 13 : map.getZoom()); 
    
    // Invalider la taille après un court délai pour assurer le bon rendu de la carte
    // Ceci est crucial lorsque l'élément 'map' est initialement masqué (dans un onglet inactif).
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// --- L'intégralité du code de gestion du DOM était ici ---

document.addEventListener('DOMContentLoaded', () => {
    initMap(); 
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
        const { generalData, specificData, demiAiguillageData } = splitFormData(); 
        
        if (generalData) {
            console.log('--- Aperçu des Données à Envoyer ---');
            console.log('1. Générales:', generalData);
            console.log(`2. Spécifiques (${generalData.type}):`, specificData);
            if (demiAiguillageData && demiAiguillageData.length > 0) {
                 console.log('3. Demi-Aiguillage:', demiAiguillageData);
            } else if (generalData.type === 'BS' || generalData.type === 'TJ') {
                 console.warn('3. Demi-Aiguillage : Aucune donnée de Demi-Aiguillage collectée.');
            }

            // Appel de la fonction de soumission réelle
            sendFormData();

        } else {
            console.error('Soumission annulée: Veuillez sélectionner un type d\'ADV.');
        }
    });
    document.getElementById('advForm').addEventListener('click', (e) => {
        const target = e.target;
        const table = target.closest('table');
        if (!table) return;
        if (target.id === 'reset-table-btn') {
            resetAllTableInputs(table);
            return;
        }
        if (target.classList.contains('clear-col-btn')) {
            const header = target.closest('th');
            const columnIndex = parseInt(header.getAttribute('data-col-index'));
            table.querySelectorAll('tbody tr').forEach((row) => {
                const cells = row.querySelectorAll('td');
                if (cells[columnIndex]) { 
                    const input = cells[columnIndex].querySelector('.table-input');
                    const editable = cells[columnIndex].getAttribute('contenteditable') === 'true';

                    if (input) {
                        resetInputValue(input);
                    } else if (editable) {
                        cells[columnIndex].innerText = '';
                        cells[columnIndex].dispatchEvent(new Event('change'));
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
                     const editable = td.getAttribute('contenteditable') === 'true';

                     if (input) {
                         resetInputValue(input);
                     } else if (editable) {
                         td.innerText = '';
                         td.dispatchEvent(new Event('change'));
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

        const sourceInput = targetCell.querySelector('.table-input');
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
        hideContextMenu();
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
    });

    document.addEventListener('click', () => {
        hideContextMenu();
    });
    const tabBois = document.getElementById('tab-bois');

    if (tabBois) {
        // Initialiser Chart.js ici si Chart est chargé
        if (typeof Chart !== 'undefined') {
            traversesChartInstance = initTraversesChart();
            jointsChartInstance = initJointsChart();
        } else {
            console.error("Chart.js n'est pas chargé. Les graphiques ne fonctionneront pas.");
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
    }
});