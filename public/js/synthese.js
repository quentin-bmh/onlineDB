let currentView = 'adv';

const COULEURS = {
    bon: { hex: '#4CAF50' }, 
    correct: { hex: '#FFEB3B' }, 
    acoriger: { hex: '#F44336' }, 
    aremplacer: { hex: '#000000' }, 
    'n/a': { hex: '#CCCCCC' }, 
    inconnu: { hex: '#FF9800' },
    erreur: { hex: '#999999' }
};

const SEVERITE_ORDRE = { 'aremplacer': 4, 'acoriger': 3, 'correct': 2, 'bon': 1, 'inconnu': 0, 'erreur': 0 };

window.addEventListener('DOMContentLoaded', () => {
    switchView('adv');
});

async function switchView(view) {
    currentView = view;
    const title = document.getElementById('main-title');
    const btnAdv = document.getElementById('btn-toggle-adv');
    const btnVoies = document.getElementById('btn-toggle-voies');

    if (view === 'adv') {
        title.textContent = "Synthèse ADV Bercy";
        if (btnAdv) btnAdv.classList.add('hidden');
        if (btnVoies) btnVoies.classList.remove('hidden');
        await displaySyntheseADV();
    } else {
        title.textContent = "Synthèse Voie Bercy";
        if (btnVoies) btnVoies.classList.add('hidden');
        if (btnAdv) btnAdv.classList.remove('hidden');
        await displaySyntheseVoies();
    }
}

async function displaySyntheseADV() {
    try {
        const response = await fetch('/api/general_data');
        const advList = await response.json();
        
        const promesses = advList.map(async (item) => {
            const type = item.type ? item.type.toLowerCase() : 'inconnu';
            const res = await fetch(`/api/${type}/${encodeURIComponent(item.adv)}`);
            const advDataArr = await res.json();
            const advData = Array.isArray(advDataArr) ? advDataArr[0] : advDataArr;
            
            const notes = calculNoteHorsDa(advData);
            
            let noteDA = 'N/A';
            if (type === 'bs' || type === 'tj') {
                try {
                    const resDa = await fetch(`/api/da?adv=${encodeURIComponent(item.adv)}`);
                    const dataDA = await resDa.json();
                    if (dataDA && dataDA.length > 0) {
                        const resultDA = calculNoteDa(dataDA, type);
                        noteDA = resultDA.demi_aiguillage;
                    } else {
                        noteDA = 'inconnu';
                    }
                } catch (e) { noteDA = 'erreur'; }
            }

            return {
                ADV: notes.advName,
                Croisement: notes.croisement,
                Écartement: notes.ecartement,
                "Attaches / Rails": notes.attache_rails,
                "Bois / Joints": notes.bois_joints,
                "Demi-Aiguillage": noteDA
            };
        });
        
        const resultatsLot = await Promise.all(promesses);
        renderTableADV(resultatsLot);
    } catch (error) {
        console.error("Erreur synthèse ADV:", error);
    }
}

function renderTableADV(resultatsLot) {
    const headers = ["ADV", "Croisement", "Écartement", "Attaches / Rails", "Bois / Joints", "Demi-Aiguillage"];
    const noteKeys = ["Croisement", "Écartement", "Attaches / Rails", "Bois / Joints", "Demi-Aiguillage"];
    const container = document.getElementById('table-container');
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hRow = document.createElement('tr');
    headers.forEach(h => { const th = document.createElement('th'); th.textContent = h; hRow.appendChild(th); });
    thead.appendChild(hRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    resultatsLot.forEach(rowObj => {
        const tr = document.createElement('tr');
        headers.forEach((_, colIndex) => {
            const td = document.createElement('td');
            let notePourCouleur;

            if (colIndex === 0) {
                td.textContent = rowObj.ADV;
                let pireNote = 'bon';
                noteKeys.forEach(key => {
                    const noteCat = String(rowObj[key]).toLowerCase().split('(')[0].trim();
                    if (SEVERITE_ORDRE[noteCat] > SEVERITE_ORDRE[pireNote]) pireNote = noteCat;
                });
                notePourCouleur = pireNote;
            } else {
                const val = String(rowObj[noteKeys[colIndex - 1]]);
                td.textContent = (val.includes('N/A') || val.includes('ERREUR')) ? val : '';
                notePourCouleur = val.toLowerCase().split('(')[0].trim();
            }

            const config = COULEURS[notePourCouleur] || { hex: '#999999' };
            td.style.backgroundColor = config.hex;
            td.style.color = (notePourCouleur === 'aremplacer') ? '#FFFFFF' : '#000000';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

async function displaySyntheseVoies() {
    try {
        const resultats = await calculerNotesToutesVoies();
        if (!resultats) return;

        const headers = ["Voie", "Écartement", "Gauche"];
        const container = document.getElementById('table-container');
        container.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'data-table';

        const thead = document.createElement('thead');
        const hRow = document.createElement('tr');
        headers.forEach(h => { const th = document.createElement('th'); th.textContent = h; hRow.appendChild(th); });
        thead.appendChild(hRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        resultats.forEach(rowData => {
            const tr = document.createElement('tr');
            headers.forEach((_, colIndex) => {
                const td = document.createElement('td');
                let note;
                if (colIndex === 0) {
                    td.textContent = rowData.nom || "Inconnu";
                    note = rowData.globale;
                } else if (colIndex === 1) {
                    note = rowData.ecartement;
                } else {
                    note = rowData.gauche;
                }
                const config = COULEURS[note] || { hex: '#999999' };
                td.style.backgroundColor = config.hex;
                td.style.color = (note === 'aremplacer') ? '#FFFFFF' : '#000000';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);
    } catch (e) { console.error(e); }
}

function handleDownload() {
    if (currentView === 'adv') {
        if (typeof window.lancerCalculEtAffichage === 'function') {
            window.lancerCalculEtAffichage(true);
        }
    } else {
        if (typeof window.genererRapportVoies === 'function') {
            window.genererRapportVoies();
        }
    }
}