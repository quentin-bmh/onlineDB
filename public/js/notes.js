const seuilsData = {};
const seuilskeys = {
    "ep_cal_min": "Épaisseur de calage min",
    "ep_cal_max": "Épaisseur de calage max",
    "nbr_cales_max": "Nombre de cales max",
    "nbr_cales_min": "Nombre de cales min",
    "lim_att_i": "Limite pourcentage attache inefficaces (max toléré)",
    "entrebaillement_max": "Entrebaillement max",
    "entrebaillement_min": "Entrebaillement min",
    "ep_cr_min": "Épaisseur contre rail min",
    "ep_cr_max": "Épaisseur contre rail max",
    "plage_ecartements": "Plage Écartements",
    "libre_passage_max": "Libre passage max",
    "libre_passage_min": "Libre passage min",
    "lim_bois_joints_remp": "Limite pourcentage bois/joints à remplacer",
    "plage_protection_de_pointe_croisement": "Plage Protection de pointe croisement",
    "plage_protection_de_pointe_traversee": "Plage Protection de pointe traversée",
};
const JSON_KEYS = {
    'bon': 'plages_bon',
    'correct': 'plages_correct',
    'acoriger': 'plages_acoriger',
    'aremplacer': 'plages_aremplacer'
};

const NOTE_ORDRE = ['bon', 'correct', 'acoriger', 'aremplacer', 'inconnu'];

// Mapping spécifique pour l'état du rail
const ETAT_QUALITATIF_MAPPING = {
    'neuf': 'bon',
    'bon': 'bon',
    'remplacer': 'aremplacer'
};
const CLASSEMENT_DA_MAPPING = {
    'BON': 'bon',
    'VA': 'correct', 
    'VI': 'acoriger', 
    'VR': 'aremplacer'
};

// Constantes pour les labels qualitatifs
const CLASSEMENT_BUTEE = 'classement butée';
const CLASSEMENT_EBRECHURE = 'classement ébréchure';
const CLASSEMENT_USURE_LA = 'classement usure LA';
const CLASSEMENT_USURE_LCA = 'classement usure LCA';

let seuilsTransformed = {};

function transformerSeuilsData(dataLoaded, mapping) {
    const dataTransformee = {};
    for (const alias in mapping) {
        if (mapping.hasOwnProperty(alias)) {
            const labelLong = mapping[alias];
            if (dataLoaded[labelLong]) {
                dataTransformee[alias] = dataLoaded[labelLong];
            }
        }
    }
    return dataTransformee;
}

async function loadSeuils() {
    const seuilsDataLocal = {};
    try {
        const response = await fetch('/api/seuils/etendus');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        
        data.forEach(item => {
            const label = item.label_seuil.trim();
            if (!seuilsDataLocal[label]) {
                seuilsDataLocal[label] = {};
            }
            seuilsDataLocal[label][item.categorie] = item;
        });
        seuilsTransformed = transformerSeuilsData(seuilsDataLocal, seuilskeys);
        // console.log("seuilsTransformed chargés:", seuilsTransformed);
    } catch (error) {
        console.error("Erreur lors du chargement des seuils:", error);
    }
}

function getElementCroisement(advData){
    const type = advData.type;

    const EP_CR = seuilskeys.ep_cr_min.replace(' min', ''); 
    const EP_CAL = seuilskeys.ep_cal_min.replace(' min', ''); 
    const NBR_CALES = seuilskeys.nbr_cales_min.replace(' min', ''); 
    const LIBRE_PASSAGE = seuilskeys.libre_passage_min.replace(' min', '');
    const P2P_C = seuilskeys.plage_protection_de_pointe_croisement;
    const P2P_T = seuilskeys.plage_protection_de_pointe_traversee;

    //BS
    const arrayBS = [
        [advData.ep_cr_g, EP_CR],
        [advData.ep_cr_d, EP_CR],
        [advData.ep_cal_d, EP_CAL],
        [advData.ep_cal_g, EP_CAL],
        [advData.nb_cales_d, NBR_CALES],
        [advData.nb_cales_g, NBR_CALES],
        [advData.coeur_etat, "état coeur"],
        [advData.p2p_d, P2P_C],
        [advData.p2p_g, P2P_C]
    ];

    //TJ
    const arrayTJ = [
        [advData.ep_cal_d_b, EP_CAL],
        [advData.ep_cal_d_h, EP_CAL],
        [advData.ep_cal_g_b, EP_CAL],
        [advData.ep_cal_g_h, EP_CAL],
        [advData.nb_cal_d_b_tj, NBR_CALES],
        [advData.nb_cal_d_h_tj, NBR_CALES],
        [advData.nb_cal_g_b_tj, NBR_CALES],
        [advData.nb_cal_g_h_tj, NBR_CALES],
        [advData.ep_cr_d_b, EP_CR],
        [advData.ep_cr_d_h, EP_CR],
        [advData.ep_cr_g_b, EP_CR],
        [advData.ep_cr_g_h, EP_CR],
        [advData.libre_passage_d, LIBRE_PASSAGE],
        [advData.libre_passage_g, LIBRE_PASSAGE],
        [advData.p2p_d_b_tj, P2P_C],
        [advData.p2p_d_h_tj, P2P_C],
        [advData.p2p_g_b_tj, P2P_C],
        [advData.p2p_g_h_tj, P2P_C],
        [advData.p2pt_b_d_tj, P2P_T],
        [advData.p2pt_b_g_tj, P2P_T],
        [advData.p2pt_h_d_tj, P2P_T],
        [advData.p2pt_h_g_tj, P2P_T]
    ];
    
    //TO
    const arrayTO = [
        [advData.libre_passage_d, LIBRE_PASSAGE],
        [advData.libre_passage_g, LIBRE_PASSAGE],
        [advData.p2p_d_b_to, P2P_C],
        [advData.p2p_d_h_to, P2P_C],
        [advData.p2p_g_b_to, P2P_C],
        [advData.p2p_g_h_to, P2P_C],
        [advData.p2pt_b_d_to, P2P_T],
        [advData.p2pt_b_g_to, P2P_T],
        [advData.p2pt_h_d_to, P2P_T],
        [advData.p2pt_h_g_to, P2P_T]
    ];
    
    if (type === "TO") return arrayTO;
    else if (type === "BS") return arrayBS;
    else if (type === "TJ") return arrayTJ;
    return [];
}

function getSeuilsCroisement(advData) {
    const type = advData.type;
    return (labelSeuilGénérique) => {
        
        let aliasKeys = [];
        // 1. Trouver les alias composites (Min/Max, ex: ep_cal_min)
        aliasKeys = Object.keys(seuilskeys).filter(key => seuilskeys[key].startsWith(labelSeuilGénérique));
        
        // 2. Trouver l'alias exact pour les seuils simples (ex: lim_att_i, plage_ecartements)
        const aliasExact = Object.keys(seuilskeys).find(key => seuilskeys[key] === labelSeuilGénérique);
        if (aliasExact && !aliasKeys.includes(aliasExact)) {
             aliasKeys.push(aliasExact);
        }
        
        let result = {};
        for (const alias of aliasKeys) {
            const advType = String(type).toUpperCase();
            const seuil = seuilsTransformed[alias] ? seuilsTransformed[alias][advType] : null;
            
            if (seuil) {
                if (alias.endsWith('_min')) {
                    result.seuilMin = seuil;
                } else if (alias.endsWith('_max')) {
                    result.seuilMax = seuil;
                } else {
                    if (seuil.plages_json) {
                        result.seuilPlage = seuil;
                    } else {
                         result.seuilMax = seuil;
                    }
                }
            }
        }
        return result;
    };
}

/**
 * Détermine la note pour une valeur mesurée par rapport à ses seuils composites.
 */
function determinerNote(valeur, seuilsComposites, labelSeuilGénérique) {
    // 1. Cas Qualitatifs (état coeur, état rail, classements DA)
    if (typeof valeur === 'string') {
        if (labelSeuilGénérique === "état coeur" && valeur === 'Conforme') {
            return { note: "bon", borneUtilisee: "État qualitatif coeur", seuilVal: 'N/A' };
        }
        if (labelSeuilGénérique === "état rail") {
            const note = ETAT_QUALITATIF_MAPPING[valeur] || 'inconnu';
            return { note: note, borneUtilisee: "Correspondance qualitative rail", seuilVal: valeur };
        }
        if (labelSeuilGénérique.startsWith('classement ')) {
            const note = CLASSEMENT_DA_MAPPING[valeur] || 'inconnu';
            return { note: note, borneUtilisee: "Classification DA", seuilVal: valeur };
        }
    }
    
    const val = Number(valeur);
    if (isNaN(val)) return { note: "inconnu", borneUtilisee: "N/A", seuilVal: 'N/A' };

    const { seuilMin, seuilMax, seuilPlage } = seuilsComposites;
    const categories = ['bon', 'correct', 'acoriger', 'aremplacer'];

    // 2. Seuils par Plages
    if (seuilPlage && seuilPlage.plages_json) {
        const seuilsPlages = seuilPlage.plages_json;
        for (const key of categories) {
            const plagesKey = JSON_KEYS[key];
            if (seuilsPlages[plagesKey]) {
                for (const range of seuilsPlages[plagesKey]) {
                    const min = range.min !== null ? range.min : -Infinity;
                    const max = range.max !== null ? range.max : Infinity;
                    if (val >= min && val <= max) {
                        return { note: key, borneUtilisee: `Plage [${range.min !== null ? range.min : 'min'}, ${range.max !== null ? range.max : 'max'}]`, seuilVal: val };
                    }
                }
            }
        }
        return { note: "inconnu", borneUtilisee: "Hors plages définies", seuilVal: val };
    }

    // 3. Seuils par Bornes Min et Max (ou Max seulement)
    if (seuilMin || seuilMax) {
        for (const key of categories) {
            const valMin = seuilMin ? seuilMin['valeur_' + key] : null;
            const valMax = seuilMax ? seuilMax['valeur_' + key] : null;

            let estValide = true;
            let borneDetail = "";

            if (valMin !== null) {
                if (val < valMin) { estValide = false; borneDetail = `Inférieur à la borne MIN ${valMin}`; } 
                else { borneDetail = `Borne MIN ${valMin}`; }
            }
            if (valMax !== null) {
                if (val > valMax) { estValide = false; borneDetail = `Supérieur à la borne MAX ${valMax}`; } 
                else {
                    if (valMin !== null) borneDetail = `[${valMin} à ${valMax}]`;
                    else borneDetail = `Borne MAX ${valMax}`;
                }
            }
            
            if (estValide && (valMin !== null || valMax !== null)) {
                return { note: key, borneUtilisee: borneDetail.trim(), seuilVal: val };
            }
        }
    }

    return { note: "inconnu", borneUtilisee: "Aucun seuil satisfait", seuilVal: val };
}

function getNoteCroisement(advData) {
    const elements = getElementCroisement(advData);
    const getSeuil = getSeuilsCroisement(advData);
    const resultats = [];
    let baddestResult = 'bon';

    if (Object.keys(seuilsTransformed).length === 0) {
        return { results:[ "Avertissement: Les seuils n'ont pas été chargés. Impossible d'attribuer une note."], noteSection: 'inconnu'};
    }
    for (const [valeur, label] of elements) {
        if (valeur !== undefined && valeur !== null) {
            const seuilsComposites = getSeuil(label);
            const resultatNote = determinerNote(valeur, seuilsComposites, label); 
            const noteActuelle = resultatNote.note;
            const sortieFormattee = `${label}: ${valeur}, ${resultatNote.note}`;
            resultats.push(sortieFormattee);
            
            const indexNoteActuelle = NOTE_ORDRE.indexOf(noteActuelle);
            const indexPireNote = NOTE_ORDRE.indexOf(baddestResult);
            if (indexNoteActuelle > indexPireNote) {
                baddestResult = noteActuelle;
            }
        }
    }
    return { results: resultats, noteSection: baddestResult };
}

function getElementEcartement(advData){
    const type = advData.type;
    const ecartement = seuilskeys.plage_ecartements; 
    
    const arrayBS = [
        [advData.ecart_1 , ecartement], 
        [advData.ecart_2 , ecartement], 
        [advData.ecart_3 , ecartement], 
        [advData.ecart_4 , ecartement], 
        [advData.ecart_5 , ecartement], 
        [advData.ecart_6 , ecartement], 
        [advData.ecart_7 , ecartement]
    ];
    const arrayTJ = [
        [advData.ecart_1 , ecartement],
        [advData.ecart_2 , ecartement],
        [advData.ecart_3 , ecartement],
        [advData.ecart_4 , ecartement],
        [advData.ecart_5 , ecartement],
        [advData.ecart_6 , ecartement],
        [advData.ecart_7 , ecartement],
        [advData.ecart_8 , ecartement]
    ];
    const arrayTO = [
        [advData.ecart_1 , ecartement], 
        [advData.ecart_2 , ecartement], 
        [advData.ecart_3 , ecartement], 
        [advData.ecart_4 , ecartement], 
        [advData.ecart_5 , ecartement], 
        [advData.ecart_6 , ecartement], 
        [advData.ecart_7 , ecartement], 
        [advData.ecart_8 , ecartement]
    ];
    
    if (type === "TO") return arrayTO;
    else if (type === "BS") return arrayBS;
    else if (type === "TJ") return arrayTJ;
    return [];
}


function getSeuilsEcartement(advData){
    return getSeuilsCroisement(advData);
}


function getNoteEcartement(advData){
    const elements = getElementEcartement(advData);
    const getSeuil = getSeuilsEcartement(advData);
    const resultats = [];
    let baddestResult = 'bon'; 

    if (Object.keys(seuilsTransformed).length === 0) {
        return { results: ["Avertissement: Les seuils n'ont pas été chargés. Impossible d'attribuer une note."], noteSection: 'inconnu' };
    }

    for (const [valeur, label] of elements) {
        if (valeur !== undefined && valeur !== null) {
            const seuilsComposites = getSeuil(label);
            const resultatNote = determinerNote(valeur, seuilsComposites, label); 
            const noteActuelle = resultatNote.note; 

            const sortieFormattee = `${label} (${valeur}): ${noteActuelle}`;

            resultats.push(sortieFormattee);
            
            const indexNoteActuelle = NOTE_ORDRE.indexOf(noteActuelle);
            const indexPireNote = NOTE_ORDRE.indexOf(baddestResult);
            
            if (indexNoteActuelle > indexPireNote) {
                baddestResult = noteActuelle;
            }
        }
    }

    return { results: resultats, noteSection: baddestResult };
}

/**
 * Extrait les paires [valeur, label_seuil générique] pour les attaches inefficaces ET l'état des rails.
 */
function getElementAttache(advData) {
    const type = advData.type;
    const labelSeuilAttache = seuilskeys.lim_att_i;
    const labelSeuilRail = "état rail"; 
    const elements = [];

    const addElement = (attacheKey, railKey) => {
        const valAttacheStr = advData[attacheKey];
        const valRailStr = advData[railKey];
        
        // Attaches (conversion %):
        if (valAttacheStr !== undefined && valAttacheStr !== null) {
            const valPercent = parseFloat(valAttacheStr) * 100; 
            if (!isNaN(valPercent)) {
                elements.push([valPercent, labelSeuilAttache]);
            } else {
                console.warn(`Valeur non numérique pour ${attacheKey}: ${valAttacheStr}`);
            }
        }
        
        // État Rail (qualitatif):
        if (valRailStr !== undefined && valRailStr !== null) {
            elements.push([String(valRailStr).toLowerCase(), labelSeuilRail]); 
        }
    };

    if (type === "BS") {
        for (let i = 1; i <= 9; i++) {
            addElement(`att_i_pct_${i}`, `etat_rail${i}`);
        }
    } else if (type === "TJ" || type === "TO") {
        for (let i = 1; i <= 4; i++) {
            addElement(`att_i_pct_${i}`, `etat_rail${i}`);
            addElement(`att_i_pct_${i}p`, `etat_rail${i}p`);
        }
        for (let i = 5; i <= 8; i++) {
            addElement(`att_i_pct_${i}`, `etat_rail${i}`);
        }
    }
    
    return elements;
}

function getSeuilsAttache(advData){
    return getSeuilsCroisement(advData);
}

function getNoteAttache(advData){
    const elements = getElementAttache(advData);
    const getSeuil = getSeuilsAttache(advData);
    const resultats = [];
    let baddestResult = 'bon'; 

    if (Object.keys(seuilsTransformed).length === 0) {
        return { results: ["Avertissement: Les seuils n'ont pas été chargés. Impossible d'attribuer une note."], noteSection: 'inconnu' };
    }

    for (const [valeur, label] of elements) {
        if (valeur !== undefined && valeur !== null) {
            const seuilsComposites = getSeuil(label);
            const resultatNote = determinerNote(valeur, seuilsComposites, label); 
            const noteActuelle = resultatNote.note; 

            const isAttache = label === seuilskeys.lim_att_i;
            
            // Format de sortie adapté (affiche le % si c'est une attache)
            const sortieFormattee = 
                `${label} (Valeur: ${isAttache ? valeur + ' %' : valeur}): ` + 
                `${noteActuelle}`;

            resultats.push(sortieFormattee);
            
            const indexNoteActuelle = NOTE_ORDRE.indexOf(noteActuelle);
            const indexPireNote = NOTE_ORDRE.indexOf(baddestResult);
            
            if (indexNoteActuelle > indexPireNote) {
                baddestResult = noteActuelle;
            }
        }
    }

    return { results: resultats, noteSection: baddestResult };
}

function getElementPlancherJoints(advData) {
    const labelSeuil = seuilskeys.lim_bois_joints_remp; 
    const elements = [];

    const keys = ['bois_pct_remp', 'joints_pct_remp'];

    keys.forEach(key => {
        const valStr = advData[key];
        if (valStr !== undefined && valStr !== null) {
            const valPercent = parseFloat(valStr) * 100; 
            
            if (!isNaN(valPercent)) {
                elements.push([valPercent, labelSeuil]);
            } else {
                console.warn(`Valeur non numérique pour ${key}: ${valStr}`);
            }
        }
    });
    
    return elements;
}
function getSeuilsPlancherJoints(advData){
    return getSeuilsCroisement(advData);
}
function getNotePlancherJoints(advData){
    const elements = getElementPlancherJoints(advData);
    const getSeuil = getSeuilsPlancherJoints(advData);
    const resultats = [];
    let baddestResult = 'bon'; 

    if (Object.keys(seuilsTransformed).length === 0) {
        return {
            results: ["Avertissement: Les seuils n'ont pas été chargés. Impossible d'attribuer une note."],
            noteSection: 'inconnu'
        }
    }

    for (const [valeur, label] of elements) {
        if (valeur !== undefined && valeur !== null) {
            const seuilsComposites = getSeuil(label);
            const resultatNote = determinerNote(valeur, seuilsComposites, label); 
            const noteActuelle = resultatNote.note; 

            const sortieFormattee = 
                `${label} (Valeur: ${valeur} %): ` + 
                `${noteActuelle}`;

            resultats.push(sortieFormattee);
            
            const indexNoteActuelle = NOTE_ORDRE.indexOf(noteActuelle);
            const indexPireNote = NOTE_ORDRE.indexOf(baddestResult);
            
            if (indexNoteActuelle > indexPireNote) {
                baddestResult = noteActuelle;
            }
        }
    }

    return {
        results: resultats,
        noteSection: baddestResult
    };
}

/** DA FUNCTIONS **/

function getEntrebaillementSeuils(type) {
    const advType = String(type).toUpperCase(); 
    
    const seuilMaxAlias = 'entrebaillement_max';
    const seuilMinAlias = 'entrebaillement_min';

    const seuilMax = seuilsTransformed[seuilMaxAlias] ? seuilsTransformed[seuilMaxAlias][advType] : null;
    const seuilMin = seuilsTransformed[seuilMinAlias] ? seuilsTransformed[seuilMinAlias][advType] : null;
    
    // console.log(`DEBUG: Entrebaillement chargé pour ${advType}. Seuils max/min:`, seuilMax, seuilMin);
    
    return {
        seuilMin: seuilMin,
        seuilMax: seuilMax
    };
}

function getElementDA(data, type) {
    const ENTREBAILLEMENT_MAX_LABEL = seuilskeys.entrebaillement_max;
    
    const elements = [];

    data.forEach(item => {
        const entrebaillementVal = item.application_da_entrebaillement;
        if (entrebaillementVal !== undefined && entrebaillementVal !== null) {
            const val = Number(entrebaillementVal); 
            if (!isNaN(val)) {
                elements.push([val, ENTREBAILLEMENT_MAX_LABEL]); 
            }
        }
        if (item.application_da_etat_bute_classement) {
            elements.push([String(item.application_da_etat_bute_classement).toUpperCase(), CLASSEMENT_BUTEE]);
        }
        if (item.ebrechure_a_classement) {
            elements.push([String(item.ebrechure_a_classement).toUpperCase(), CLASSEMENT_EBRECHURE]);
        }
        if (item.usure_la_classement) {
            elements.push([String(item.usure_la_classement).toUpperCase(), CLASSEMENT_USURE_LA]);
        }
        if (item.usure_lca_classement) {
            elements.push([String(item.usure_lca_classement).toUpperCase(), CLASSEMENT_USURE_LCA]);
        }
    });
    
    return elements;
}

function getSeuilsDA(type){
    const ENTREBAILLEMENT_MAX_LABEL = seuilskeys.entrebaillement_max;
    
    const entrebaillementSeuils = getEntrebaillementSeuils(type);

    return (labelSeuilGénérique) => {
        if (labelSeuilGénérique === ENTREBAILLEMENT_MAX_LABEL) {
            return entrebaillementSeuils;
        }

        return getSeuilsCroisement({ type: String(type).toUpperCase() })(labelSeuilGénérique);
    };
}

function getNoteDA(data, type){
    const elements = getElementDA(data, type);
    const getSeuil = getSeuilsDA(type);
    const resultats = [];
    let baddestResult = 'bon'; 

    if (Object.keys(seuilsTransformed).length === 0) {
        return { results: ["Avertissement: Les seuils n'ont pas été chargés. Impossible d'attribuer une note."], noteSection: 'inconnu' };
    }
    
    for (const [valeur, label] of elements) {
        if (valeur !== undefined && valeur !== null) {
            const seuilsComposites = getSeuil(label);
            const resultatNote = determinerNote(valeur, seuilsComposites, label); 
            const noteActuelle = resultatNote.note; 

            const sortieFormattee = 
                `${label} (Valeur: ${valeur}): ` + 
                `${resultatNote.note}`;

            resultats.push(sortieFormattee);
            
            const indexNoteActuelle = NOTE_ORDRE.indexOf(noteActuelle);
            const indexPireNote = NOTE_ORDRE.indexOf(baddestResult);
            
            if (indexNoteActuelle > indexPireNote) {
                baddestResult = noteActuelle;
            }
        }
    }

    return { results: resultats, noteSection: baddestResult };
}

/**
 * Calcul des notes HORS DA. Retourne l'objet de synthèse.
 */
function calculNoteHorsDa(advData) {
    const notesCroisement = getNoteCroisement(advData);
    const noteEcartement = getNoteEcartement(advData);
    const noteAttache = getNoteAttache(advData);
    const noteBoisJoints = getNotePlancherJoints(advData);

    const advName = advData.nom_adv || advData.ADV || advData.adv || 'N/A';
    const advType = String(advData.type).toUpperCase();
    
    return {
        advName: advName,
        advType: advType,
        croisement: notesCroisement.noteSection,
        ecartement: noteEcartement.noteSection,
        attache_rails: noteAttache.noteSection,
        bois_joints: noteBoisJoints.noteSection,
        // On n'inclut PAS demi_aiguillage ici, ce sera fait par le coordinateur
    };
}

/**
 * Calcul des notes DA. Retourne l'objet de synthèse partiel.
 */
function calculNoteDa(data, type){
    if (Object.keys(seuilsTransformed).length === 0) {
        return { demi_aiguillage: 'inconnu' };
    }
    
    const notesDA = getNoteDA(data, type);
    return {
        demi_aiguillage: notesDA.noteSection
    };
}

/**
 * Génère le tableau de synthèse global (format console.table).
 */
function calculerTableauGlobal(resultat) {
    console.log("\n=============================================");
    console.log(` SYNTHÈSE GLOBALE DE L'ADV : ${resultat.advName} (${resultat.advType})`);
    console.log("=============================================");

    console.table([
        { 
            Section: "Croisement", 
            Note: resultat.croisement 
        },
        { 
            Section: "Écartement", 
            Note: resultat.ecartement 
        },
        { 
            Section: "Attaches / Rails", 
            Note: resultat.attache_rails 
        },
        { 
            Section: "Bois / Joints", 
            Note: resultat.bois_joints 
        },
        { 
            Section: "Demi-Aiguillage (DA)", 
            Note: resultat.demi_aiguillage 
        }
    ]);
    
    return resultat;
}


//section note Voies
const SEVERITE = { 'aremplacer': 4, 'acoriger': 3, 'correct': 2, 'bon': 1, 'erreur': 0 };

async function calculerNotesToutesVoies() {
    try {
        // Chargement des seuils et des deux types de mesures
        const [respSeuils, respEcart, respGauche] = await Promise.all([
            fetch('/api/seuils/voies'),
            fetch('/api/voiesBoulogne/ecart'),
            fetch('/api/voiesBoulogne/ga')
        ]);

        const seuilsVoie = await respSeuils.json();
        const dataEcart = await respEcart.json();
        const dataGauche = await respGauche.json();

        // Regroupement par voie pour trouver la pire note
        const syntheseVoies = {};

        // 1. Traitement de l'écartement (e)
        dataEcart.forEach(m => {
            if (!syntheseVoies[m.voie]) syntheseVoies[m.voie] = { ecartement: 'bon', gauche: 'bon' };
            const notePoint = evaluerPlage(m.e, "Plage Écartement Voie", seuilsVoie);
            
            // On garde la pire note rencontrée sur la voie
            if (SEVERITE[notePoint] > SEVERITE[syntheseVoies[m.voie].ecartement]) {
                syntheseVoies[m.voie].ecartement = notePoint;
            }
        });

        // 2. Traitement du gauche (g3)
        dataGauche.forEach(m => {
            if (!syntheseVoies[m.voie]) syntheseVoies[m.voie] = { ecartement: 'bon', gauche: 'bon' };
            const notePoint = evaluerPlage(m.g3, "Plage Gauche", seuilsVoie);
            
            if (SEVERITE[notePoint] > SEVERITE[syntheseVoies[m.voie].gauche]) {
                syntheseVoies[m.voie].gauche = notePoint;
            }
        });

        // 3. Finalisation du tableau de résultats
        return Object.keys(syntheseVoies).map(nomVoie => {
            const v = syntheseVoies[nomVoie];
            const noteGlobale = SEVERITE[v.ecartement] >= SEVERITE[v.gauche] ? v.ecartement : v.gauche;
            
            return {
                nom: nomVoie,
                ecartement: v.ecartement,
                gauche: v.gauche,
                globale: noteGlobale
            };
        });

    } catch (error) {
        console.error("Erreur lors du calcul des notes voies:", error);
        return [];
    }
}
function evaluerPlage(valeur, labelSeuil, referentiel) {
    if (valeur === null || valeur === undefined) return 'erreur';
    
    const config = referentiel.find(s => s.label_seuil.trim() === labelSeuil.trim());
    if (!config) return 'erreur';

    // Ordre de vérification : de la plus critique à la moins critique
    const etats = [
        { key: 'plages_aremplacer', label: 'aremplacer' },
        { key: 'plages_acoriger', label: 'acoriger' },
        { key: 'plages_correct', label: 'correct' },
        { key: 'plages_bon', label: 'bon' }
    ];
    
    for (const etat of etats) {
        const plages = config.plages_json[etat.key] || [];
        for (const p of plages) {
            const min = p.min === null ? -Infinity : p.min;
            const max = p.max === null ? Infinity : p.max;
            
            // Gestion des plages (ex: 1425 < x < 1454)
            if (valeur >= min && valeur <= max) {
                return etat.label;
            }
        }
    }
    return 'inconnu';
}

document.addEventListener('DOMContentLoaded', loadSeuils);