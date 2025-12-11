// script.js
let fullSeuilsData = []; 
const pendingChanges = {};
const saveButton = document.getElementById('save-button');
const tableBody = document.querySelector('#seuil-table tbody');
let currentEtat = 'bon';

const COMPLEX_THRESHOLDS = [
    'Plage Protection de pointe croisement',
    'Plage Protection de pointe traversée',
    'Plage Écartements'
];

const JSON_KEYS = {
    'bon': 'plages_bon',
    'correct': 'plages_correct',
    'acoriger': 'plages_acoriger',
    'aremplacer': 'plages_aremplacer'
};

function updateSaveButton() {
    const count = Object.keys(pendingChanges).length;
    saveButton.textContent = `Sauvegarder les modifications (${count})`;
    saveButton.disabled = count === 0;
}

function handleInputChange(event) {
    const input = event.target;
    // Utiliser Number(input.value) pour convertir la chaîne vide en 0, puis vérifier, ou parseInt
    const nouvelleValeur = input.value === "" ? null : parseInt(input.value, 10);
    
    const labelSeuil = input.getAttribute('data-label');
    const categorie = input.getAttribute('data-cat');
    const type = input.getAttribute('data-type');
    
    if (type.startsWith('json-')) {
        handleJsonRangeChange(labelSeuil, categorie, input, nouvelleValeur);
    } else {
        handleSimpleRangeChange(labelSeuil, categorie, nouvelleValeur); // Modification: suppression du paramètre 'type'
    }
    
    const cell = input.closest('.cell-input');
    // Vérifier si des changements sont en attente pour CETTE cellule spécifique
    const hasPendingChanges = Object.keys(pendingChanges).some(k => k.startsWith(`${labelSeuil}-${categorie}-${currentEtat}`));
    if (hasPendingChanges) {
        cell.classList.add('modified');
    } else {
        cell.classList.remove('modified');
    }

    updateSaveButton();
}

// Nouvelle signature, car le type (min/max) n'existe plus pour les seuils simples
function handleSimpleRangeChange(labelSeuil, categorie, nouvelleValeur) {
    // La clé unique n'a plus besoin du 'type'
    const key = `${labelSeuil}-${categorie}-${currentEtat}`; 
    const valeurKey = `valeur_${currentEtat}`; // Clé unique dans la BDD: valeur_bon, valeur_correct, etc.

    const initialRow = fullSeuilsData.find(d => d.label_seuil === labelSeuil && d.categorie === categorie);
    const valeurInitiale = initialRow ? initialRow[valeurKey] : null;

    // Suppression du changement si la nouvelle valeur est identique à celle de la base de données
    if (nouvelleValeur === valeurInitiale) {
        delete pendingChanges[key];
    } else {
        pendingChanges[key] = {
            label_seuil: labelSeuil.trim(),
            categorie: categorie,
            etat: currentEtat,
            type: 'simple', // Utilisation d'un type générique 'simple' pour les différencier des 'json'
            valeur_seuil: nouvelleValeur
        };
    }
}

function handleJsonRangeChange(labelSeuil, categorie, input, nouvelleValeur) {
    const [_, type, index] = input.getAttribute('data-type').split('-');
    const jsonKey = JSON_KEYS[currentEtat];
    const bufferKey = `${labelSeuil}-${categorie}-${currentEtat}-json`;
    
    const initialRow = fullSeuilsData.find(d => d.label_seuil === labelSeuil && d.categorie === categorie);
    
    // Récupérer les plages du buffer, ou de la BDD si le buffer est vide
    let currentPlages = pendingChanges[bufferKey]
        ? JSON.parse(JSON.stringify(pendingChanges[bufferKey].valeur_seuil))
        : initialRow.plages_json && initialRow.plages_json[jsonKey] ? JSON.parse(JSON.stringify(initialRow.plages_json[jsonKey])) : [];
    
    // Mise à jour de la plage spécifique
    if (currentPlages[index]) {
        currentPlages[index][type] = nouvelleValeur;
    }

    pendingChanges[bufferKey] = {
        label_seuil: labelSeuil.trim(),
        categorie: categorie,
        etat: currentEtat,
        type: 'json',
        valeur_seuil: currentPlages
    };
    
    // Logique de nettoyage : si le contenu du buffer redevient identique à la BDD, supprimer le changement
    const initialPlages = initialRow.plages_json && initialRow.plages_json[jsonKey] ? initialRow.plages_json[jsonKey] : [];
    
    // Filtrer les plages entièrement vides pour la comparaison (simule le nettoyage du handleSave)
    const currentPlagesFiltered = currentPlages.filter(range => range.min !== null || range.max !== null);
    
    if (JSON.stringify(currentPlagesFiltered) === JSON.stringify(initialPlages)) {
        delete pendingChanges[bufferKey];
    }
}

function addRange(labelSeuil, categorie) {
    const bufferKey = `${labelSeuil}-${categorie}-${currentEtat}-json`;
    const jsonKey = JSON_KEYS[currentEtat];

    const initialRow = fullSeuilsData.find(d => d.label_seuil === labelSeuil && d.categorie === categorie);
    
    // Initialiser à partir de la BDD
    let currentPlages = initialRow.plages_json && initialRow.plages_json[jsonKey] ? JSON.parse(JSON.stringify(initialRow.plages_json[jsonKey])) : [];

    // Récupérer le buffer s'il existe
    if (pendingChanges[bufferKey]) {
        currentPlages = JSON.parse(JSON.stringify(pendingChanges[bufferKey].valeur_seuil));
    }

    currentPlages.push({ min: null, max: null });

    pendingChanges[bufferKey] = {
        label_seuil: labelSeuil.trim(),
        categorie: categorie,
        etat: currentEtat,
        type: 'json',
        valeur_seuil: currentPlages
    };

    renderTable(fullSeuilsData, currentEtat);
    updateSaveButton();
}

function removeRange(event, labelSeuil, categorie, index) {
    event.stopPropagation();
    const bufferKey = `${labelSeuil}-${categorie}-${currentEtat}-json`;
    const jsonKey = JSON_KEYS[currentEtat];
    
    const initialRow = fullSeuilsData.find(d => d.label_seuil === labelSeuil && d.categorie === categorie);
    
    // Récupérer les plages du buffer, ou de la BDD
    let currentPlages = pendingChanges[bufferKey] 
        ? JSON.parse(JSON.stringify(pendingChanges[bufferKey].valeur_seuil))
        : initialRow.plages_json && initialRow.plages_json[jsonKey] ? JSON.parse(JSON.stringify(initialRow.plages_json[jsonKey])) : [];
    
    currentPlages.splice(index, 1);

    pendingChanges[bufferKey] = {
        label_seuil: labelSeuil.trim(),
        categorie: categorie,
        etat: currentEtat,
        type: 'json',
        valeur_seuil: currentPlages
    };
    
    // Logique de nettoyage : si le contenu du buffer redevient identique à la BDD, supprimer le changement
    const initialPlages = initialRow.plages_json && initialRow.plages_json[jsonKey] ? initialRow.plages_json[jsonKey] : [];
    
    // Filtrer les plages entièrement vides pour la comparaison
    const currentPlagesFiltered = currentPlages.filter(range => range.min !== null || range.max !== null);
    
    if (JSON.stringify(currentPlagesFiltered) === JSON.stringify(initialPlages)) {
        delete pendingChanges[bufferKey];
    }

    renderTable(fullSeuilsData, currentEtat);
    updateSaveButton();
}

async function handleSave() {
    if (Object.keys(pendingChanges).length === 0) return;

    // Filtration des changements : Retirer les plages JSON entièrement vides
    const changesToSend = Object.values(pendingChanges).map(change => {
        if (change.type === 'json' && Array.isArray(change.valeur_seuil)) {
             // Filtrer les objets min/max où les deux sont null
             change.valeur_seuil = change.valeur_seuil.filter(
                range => range.min !== null || range.max !== null
             );
        }
        return change;
    });
    
    // Si après filtrage, il ne reste plus de changements significatifs (très peu probable ici)
    if (changesToSend.length === 0) {
         Object.keys(pendingChanges).forEach(key => delete pendingChanges[key]);
         updateSaveButton();
         return; 
    }

    try {
        const response = await fetch('/api/seuils/update-etendu', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changesToSend)
        });

        const responseText = await response.text(); 

        if (!response.ok) {
            let errorMessage = `Erreur serveur: ${response.status} - Échec de la mise à jour.`;
            try {
                // Tente d'analyser le JSON pour obtenir un message d'erreur précis
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || JSON.stringify(errorData);
            } catch (e) {
                // Utilise le texte brut si le JSON est invalide
                errorMessage = responseText;
                if (errorMessage.length > 200) {
                     errorMessage = errorMessage.substring(0, 200) + '...';
                }
            }
            throw new Error(errorMessage);
        }

        // Mise à jour de l'état local (fullSeuilsData) après succès
        changesToSend.forEach(change => {
             const item = fullSeuilsData.find(d => d.label_seuil.trim() === change.label_seuil.trim() && d.categorie === change.categorie);
             if (item) {
                 if (change.type === 'json') {
                     // Mise à jour de la colonne JSONB
                     const jsonKey = JSON_KEYS[change.etat];
                     item.plages_json = item.plages_json || {}; 
                     item.plages_json[jsonKey] = change.valeur_seuil;
                 } else {
                     // Mise à jour du seuil simple (valeur_bon, valeur_correct, etc.)
                     const key = `valeur_${change.etat}`; // Correction: supprime _${change.type}
                     item[key] = change.valeur_seuil;
                 }
             }
         });
        
        // Nettoyage complet du buffer après sauvegarde réussie
        Object.keys(pendingChanges).forEach(key => delete pendingChanges[key]);
        
        renderTable(fullSeuilsData, currentEtat);
        alert(`Sauvegarde réussie de ${changesToSend.length} seuils.`);
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde :', error);
        alert(`Échec de la sauvegarde : ${error.message}`);
    }
    
    updateSaveButton();
}

function renderTable(data, etat) {
    const groupedData = data.reduce((acc, curr) => {
        if (!acc[curr.label_seuil]) {
            acc[curr.label_seuil] = {};
        }
        acc[curr.label_seuil][curr.categorie] = curr;
        return acc;
    }, {});

    tableBody.innerHTML = '';
    
    const bloqueKey = `bloque_${etat}`;
    const jsonKey = JSON_KEYS[etat];

    Object.keys(groupedData).forEach(labelSeuil => {
        const rowData = groupedData[labelSeuil];
        const row = document.createElement('tr');
        
        const labelCell = document.createElement('td');
        labelCell.textContent = labelSeuil;
        labelCell.style.textAlign = 'left';
        row.appendChild(labelCell);

        const isComplex = COMPLEX_THRESHOLDS.includes(labelSeuil);

        ['BS', 'TJ', 'TO'].forEach(cat => {
            const item = rowData[cat] || {}; 
            const isBlocked = item[bloqueKey] === true;
            
            const cell = document.createElement('td');
            cell.classList.add('cell-input');
            if (isBlocked) cell.classList.add('blocked');

            let isModified = false;

            if (isComplex) {
                // Rendu des Plages JSONB
                const bufferKey = `${labelSeuil}-${cat}-${etat}-json`;
                
                // Récupérer les plages depuis le buffer, sinon depuis la BDD (avec l'état JSONB ciblé)
                let ranges = pendingChanges[bufferKey]
                    ? pendingChanges[bufferKey].valeur_seuil
                    : item.plages_json && item.plages_json[jsonKey] ? JSON.parse(JSON.stringify(item.plages_json[jsonKey] || [])) : [];
                
                if (pendingChanges[bufferKey]) {
                    isModified = true;
                }
                
                const container = document.createElement('div');
                container.classList.add('range-container');

                ranges.forEach((range, index) => {
                    const pair = document.createElement('div');
                    pair.classList.add('range-pair');

                    const createInput = (type) => {
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.placeholder = type.toUpperCase();
                        // La valeur affichée est la valeur du range (null ou nombre)
                        input.value = range[type] !== null ? range[type] : '';
                        input.setAttribute('data-label', labelSeuil);
                        input.setAttribute('data-cat', cat);
                        input.setAttribute('data-type', `json-${type}-${index}`);
                        input.disabled = isBlocked;
                        input.addEventListener('input', handleInputChange);
                        return input;
                    };

                    pair.appendChild(createInput('min'));
                    pair.appendChild(createInput('max'));

                    if (!isBlocked) {
                        const removeBtn = document.createElement('button');
                        removeBtn.textContent = 'X';
                        removeBtn.classList.add('range-remove-button');
                        removeBtn.addEventListener('click', (e) => removeRange(e, labelSeuil, cat, index));
                        pair.appendChild(removeBtn);
                    }

                    container.appendChild(pair);
                });

                if (!isBlocked) {
                    const addBtn = document.createElement('button');
                    addBtn.textContent = '+ Nouvelle Plage';
                    addBtn.classList.add('add-range-button');
                    addBtn.addEventListener('click', () => addRange(labelSeuil, cat));
                    container.appendChild(addBtn);
                }

                cell.appendChild(container);

            } else {
                // Rendu des Seuils Simples (Une seule colonne dans la BDD: valeur_bon, valeur_correct, etc.)
                
                const type = 'simple'; // Type logique utilisé uniquement pour la clé de pendingChanges
                const pendingKey = `${labelSeuil}-${cat}-${etat}`; // Clé sans le type 'min'
                const dbKey = `valeur_${etat}`; // Clé BDD: valeur_bon, valeur_correct, etc.
                
                let currentValue = item[dbKey] !== null ? item[dbKey] : '';

                if (pendingChanges[pendingKey]) {
                    currentValue = pendingChanges[pendingKey].valeur_seuil !== null 
                                   ? pendingChanges[pendingKey].valeur_seuil 
                                   : '';
                    isModified = true;
                } else {
                    // Vérifie s'il y a une entrée dans pendingChanges
                    isModified = Object.keys(pendingChanges).some(k => k === pendingKey);
                }
                
                const input = document.createElement('input');
                input.type = 'number';
                // input.placeholder = 'Valeur';
                input.setAttribute('data-label', labelSeuil); 
                input.setAttribute('data-cat', cat);
                input.setAttribute('data-type', type); // Défini sur 'simple' pour handleInputChange
                input.value = currentValue;
                input.style.width = '70px';
                input.disabled = isBlocked;
                
                if (!isBlocked) input.addEventListener('input', handleInputChange);
                
                cell.appendChild(input);
            }
            
            if (isModified) cell.classList.add('modified');

            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

function handleTabClick(event) {
    const newEtat = event.target.getAttribute('data-etat');
    if (newEtat && newEtat !== currentEtat) {
        currentEtat = newEtat;
        
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        renderTable(fullSeuilsData, currentEtat);
    }
}

async function loadSeuilsData() {
    try {
        const response = await fetch('/api/seuils/etendus');
        if (!response.ok) {
            throw new Error('Échec du chargement des seuils étendus.');
        }
        fullSeuilsData = await response.json();
        console.log("Données des seuils chargées :", fullSeuilsData);
        renderTable(fullSeuilsData, currentEtat);
        
        saveButton.addEventListener('click', handleSave);
        document.getElementById('seuil-tabs').addEventListener('click', handleTabClick);

    } catch (error) {
        console.error("Erreur de chargement initial des données:", error);
        alert(`Impossible de charger la configuration des seuils : ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', loadSeuilsData);