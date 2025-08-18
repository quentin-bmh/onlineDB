let map;
let marker;

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadTypeButtons();
  setupToggleMenu();
  initCharts();
});

function initMap() {
    map = L.map('map').setView([46.5, 2.5], 7);

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
}

function updateMap(adv) {
    const lat = parseFloat(adv["lat"] ?? adv["Latitude"]);
    const lng = parseFloat(adv["long"] ?? adv["Longitude"]);

    if (!lat || !lng) {
      alert("Coordonnées manquantes pour cet ADV");
      return;
    }

    if (marker) map.removeLayer(marker);

    marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<b>${adv["adv"] ?? adv["ADV"] ?? "ADV"}</b>`)
      .openPopup();

    map.setView([lat, lng], 20);

    // Très utile si la carte est dans un container dynamique (onglet, menu déroulant, etc.)
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
}


function createTable(data) {
  console.log('appel de la fonction createTable');
  const tbody = document.querySelector("#advTable tbody");
  tbody.innerHTML = ''; // nettoyage

  data.forEach((adv, index) => {
    const name = adv["adv"];
    const type = adv["type"];
    const row = document.createElement("tr");
    row.innerHTML = `<td>${name}</td>`;

    row.addEventListener("click", () => {
      console.log('row sélectionnée:', name, type, adv);
      // 1. UI
      updateMap(adv);
      document.querySelectorAll("#advTable tbody tr").forEach(r => r.classList.remove("active-adv"));
      row.classList.add("active-adv");
      // resetVoieContent();
      // 2. Charger les infos détaillées selon le type
      if (type && name) {
        const lowerType = type.toLowerCase(); // bs / to / tj
        fetch(`/api/${lowerType}/${encodeURIComponent(name)}`)
          .then(res => {
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            return res.json();
          })
          .then(data => {
            // data = réponse détaillée selon le type
            const advData = Array.isArray(data) ? data[0] : data;
            // console.log(`Données ADV récupérées pour ${name}:`, advData);
            getAdvData(advData); // tu peux adapter ici
          })
          .catch(err => {
            console.error("Erreur lors de la récupération des données ADV détaillées:", err);
          });
      } else {
        console.warn("Type ou nom ADV manquant:", { type, name });
      }
    });

    tbody.appendChild(row);
  });
}

let currentType = '';
let summaryData = [];

function loadTypeButtons() {
  console.log('appel de la fonction loadTypeButtons');
  fetch('/api/adv_types')
    .then(res => res.json())
    .then(types => {
      const advSection = document.querySelector('.adv-section');
      if (!advSection || types.length === 0) return;

      advSection.innerHTML = ''; // Clear previous buttons

      let firstButton = null;
      
      types.forEach(({ type }, index) => {
        const button = document.createElement('button');
        button.textContent = type;
        button.classList.add('data-btn');
        button.setAttribute('data-type', type);

        button.addEventListener('click', () => {
          document.querySelectorAll('.data-btn').forEach(btn => btn.classList.remove('active-type'));
          button.classList.add('active-type');
          currentType = type.toLowerCase();
          console.log(`Type sélectionné: ${currentType}`);
          document.querySelectorAll('button[data-target="voie-aiguillage"]').forEach(boutonAiguillage => {
            boutonAiguillage.style.display = (type === 'BS' || type === 'TJ') ? 'inline-block' : 'none';
          });

          fetch(`/api/adv_from/${encodeURIComponent(type)}`)
            .then(res => res.json())
            .then(data => {
              summaryData = data;
              createTable(data);

              if (data.length > 0) {
                updateMap(data[0]);
                getAdvDetails(data[0]);
                // getAdvData(data[0]);
                const firstRow = document.querySelector("#advTable tbody tr");
                if (firstRow) {
                  firstRow.click();
                }
              }
            })
            .catch(err => {
              console.error("Erreur lors du chargement des ADV par type:", err);
            });
        });

        advSection.appendChild(button);
        if (index === 0) {
          firstButton = button;
        }
      });
      if (firstButton) {
        firstButton.click();
      }
    })
    .catch(err => {
      console.error('Erreur lors du chargement des types ADV :', err);
    });
}

function displayAdvDetails(adv) {
  console.log('appel de la fonction displayAdvDetails');

  const container = document.getElementById('info-container');
  container.innerHTML = ''; 
  const fieldsMap = {
    tangente:       { label: 'Tangente',          key: 'tangente' },
    modele:         { label: 'Modèle',            key: 'modele' },
    plancher:       { label: 'Plancher',          key: 'plancher' },
    pose:           { label: 'Pose',              key: 'pose' },
    rail:           { label: 'Rail',              key: 'rails' },
    sensDerivation: { label: 'Sens dérivation',   key: 'sens_deviation' },
    typeAttaches:   { label: "Type d'attaches",   key: 'type_attaches' },
  };

  for (const [spanId, { label, key }] of Object.entries(fieldsMap)) {
    const val = adv[key];
    if (val !== null && val !== undefined && val !== '') {
      const item = document.createElement('div');
      item.className = 'info-item';

      const labelEl = document.createElement('label');
      labelEl.setAttribute('for', spanId);
      labelEl.textContent = label + ' :';

      const spanEl = document.createElement('span');
      spanEl.id = spanId;
      spanEl.textContent = val;

      item.appendChild(labelEl);
      item.appendChild(spanEl);
      container.appendChild(item);
    }
  }
}

function getAdvData(adv) {
  // console.trace();
  console.log('appel de la fonction getAdvData');
  const name = (adv["adv"] || adv["ADV"] || '').trim();
  const type = (adv["type"] || '').toLowerCase();

  if (!name || !type) {
    console.warn("ADV ou type manquant dans l'objet :", adv);
    return;
  }

  // 1. Charger les données principales
  fetch(`/api/${type}/${encodeURIComponent(name)}`)
    .then(res => {
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const advData = Array.isArray(data) ? data[0] : data;
      if (!advData) {
        console.warn("Pas de données reçues pour :", name);
        return;
      }
      // if (document.getElementById('voie-aiguillage')) {
      //   showSummaryForCurrentType();
      // } else {
      //   switchVoieTypeContent(type);
      // }
      switchVoieTypeContent(type);
      showOrHideDataForAiguillage(type);
      updateEcartements(advData, type);
      fillCoeur2cInputs(advData);
      updateAttaches(adv, type);
      updateBois(advData);
      updateCharts(advData);
    })
    .catch(err => {
      console.error("Erreur en chargeant les détails ADV:", err);
    });

  // 2. Charger les bavures (via la nouvelle route)
  fetch(`/api/da?adv=${encodeURIComponent(name)}`)
    .then(res => {
      if (!res.ok) throw new Error(`Erreur HTTP (bavure): ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("Pas de données de bavure reçues pour :", name);
        return;
      }

      // Remplir le tableau #bavure-table
      // console.log("Données de bavure reçues :", data);
      if (document.getElementById('voie-aiguillage')) {
        showSummaryForCurrentType();
      } else {
        switchVoieTypeContent(type);
      }
      updateBavuresTable(data);
      updateEbrechureTable(data);
      updateAppDM(data);
      updateUsureLcaTable(data);
      updateUsureLaTable(data);
    })
    .catch(err => {
      console.error("Erreur en chargeant la bavure ADV:", err);
    });
}


function getAdvDetails(adv) {
  console.log('appel de la fonction getAdvDetails');
  const advName = adv["ADV"] || adv["adv"];
  if (!advName) {
    console.warn("ADV manquant dans l'objet :", adv);
    return;
  }

  fetch(`/api/general_data?adv=${encodeURIComponent(advName)}`)
    .then(res => {
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => {
      displayAdvDetails(data);
    })
    .catch(err => {
      console.error("Erreur en chargeant les détails depuis general_data:", err);
    });
}
function resetVoieContent() {
  console.log('appel de la fonction resetVoieContent');
  const allVoies = document.querySelectorAll('.voie-content');
  const hub = document.getElementById('hub');
  const toggleMenu = document.querySelector('.voie-toggle');

  // Masquer tous les .voie-content
  allVoies.forEach(voie => {
    voie.classList.remove('active');
    voie.style.display = 'none';
    voie.style.visibility = 'hidden';
    voie.style.animationName = ''; // désactive toute animation précédente
  });

  // Activer #hub correctement
  hub.classList.add('active');
  hub.style.display = 'flex';
  hub.style.visibility = 'visible';
  hub.style.animationName = 'slideInUp';

  if (toggleMenu) toggleMenu.style.display = 'none';
}
function updateBois(adv) {
  console.log('appel de la fonction updateBois');
  if (!adv || typeof adv !== 'object') return;

  // === JOINTS ===
  const jointsBon = Number(adv['joints_bon']) || 0;
  const jointsRepr = Number(adv['joints_a_repr']) || 0;
  const jointsGraisser = Number(adv['joints_a_graisser']) || 0;
  const jointsPct = adv['joints_pct_remp'] !== undefined ? adv['joints_pct_remp'] + '%' : '-';

  const jointsCountEl = document.getElementById('jointsCount');
  if (jointsCountEl) {
    jointsCountEl.textContent = jointsBon + jointsRepr;
  }

  const jointsRow = document.querySelector('#plancher-joints .plancher-table tbody tr');
  if (jointsRow) {
    const cells = jointsRow.querySelectorAll('td');
    if (cells.length >= 4) {
      cells[0].textContent = jointsPct;       // % joints à remplacer
      cells[1].textContent = jointsBon;       // joints bon état
      cells[2].textContent = jointsRepr;      // joints à reprendre
      cells[3].textContent = jointsGraisser;  // joints à graisser
    }
  }

  // === BOIS ===
  const boisBon = Number(adv['bois_bon']) || 0;
  const boisRemp = Number(adv['bois_a_remp']) || 0;
  const boisPct = adv['bois_pct_remp'] !== undefined ? adv['bois_pct_remp'] + '%' : '-';

  const boisCountEl = document.getElementById('boisCount');
  if (boisCountEl) {
    boisCountEl.textContent = boisBon + boisRemp;
  }

  const boisRow = document.querySelector('#plancher-bois .plancher-table tbody tr');
  if (boisRow) {
    const cells = boisRow.querySelectorAll('td');
    if (cells.length >= 3) {
      cells[0].textContent = boisPct;      // % bois à remplacer
      cells[1].textContent = boisRemp;     // bois à remplacer
      cells[2].textContent = boisBon;      // bois bon état
    }
  }
}
function setupToggleMenu() {
  console.log('appel de la fonction setupToggleMenu');
  const contentSections = document.querySelectorAll('.voie-content');
  const hub = document.getElementById('hub');
  const toggleMenu = document.querySelector('.voie-toggle');

  contentSections.forEach(voie => {
    voie.classList.remove('active');
    voie.style.display = 'none';
    voie.style.visibility = 'hidden';
  });

  // Activer la première voie si aucune n'est active
  let active = document.querySelector('.voie-content.active');
  if (!active && contentSections.length > 0) {
    active = contentSections[0];
    active.classList.add('active');
    active.style.display = 'flex';
    active.style.visibility = 'visible';
  }

  // Afficher ou masquer .voie-toggle selon que la voie active est #hub
  if (active && active.id === 'hub') {
    toggleMenu.style.display = 'none';
  } else {
    toggleMenu.style.display = 'block';
  }
}
function updateToButtonVisibility() {
  console.log('appel de la fonction updateToButtonVisibility');
  const voieAiguillage = document.getElementById('voie-aiguillage');
  const toButton = document.querySelector('button[data-type="TO"]');
  if (!toButton) return;

  // If voie-aiguillage is visible, hide TO button, else show it
  const isAiguillageVisible = voieAiguillage && voieAiguillage.style.display !== 'none' && voieAiguillage.classList.contains('active');
  toButton.style.display = isAiguillageVisible ? 'none' : 'inline-block';
}
document.querySelectorAll('.toggle-menu button, #hub button').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const current = document.querySelector('.voie-content.active');
    const type = button.getAttribute('data-type') || '';
    const next = document.getElementById(targetId);
    const data = document.getElementById('info-container');
    const img_ag_tj = document.getElementById('tj_aiguille_img');
    const left_sidebar = document.getElementById('left-sidebar');
    const data_section = document.querySelector('.data-actions');
    const dataADV = document.getElementById('data');
    const data_voie_container = document.getElementById('dataVoie-container');
    const map = document.getElementById('map');
    if (!next || current === next) return;
    if (targetId === 'voie-aiguillage') {
      data.style.display = 'none';
      img_ag_tj.style.display = 'flex';
      left_sidebar.style.gridRow = '1 / 4';
      data_section.style.gridRow = '4 / 6';
      data_section.style.gridColumn = '1 / 3';
      dataADV.style.gridColumn = '1 / 3';
      dataADV.style.gridRow = '6 / 9';
      data_voie_container.style.gridRow = '1 / 11';
      map.style.display = 'none';
    }else{
      data.style.display = 'flex';
      img_ag_tj.style.display = 'none';
      left_sidebar.style.gridRow = '1 / 9';
      data_section.style.gridRow = '1 / 4';
      data_section.style.gridColumn = '3 / 5';
      dataADV.style.gridColumn = '5 / 7';
      dataADV.style.gridRow = '1 / 4';
      data_voie_container.style.gridRow = '4 / 11';
      map.style.display = 'block';
    }
if (current) {
      current.classList.remove('active');
      current.style.animationName = 'slideOutDown';

      setTimeout(() => {
        current.style.display = 'none';
        current.style.visibility = 'hidden';

        next.classList.add('active');
        next.style.display = 'flex';
        next.style.visibility = 'visible';
        next.style.animationName = 'slideInUp';

        // ➕ Mise à jour de .voie-toggle ici
        const toggleMenu = document.querySelector('.voie-toggle');
        if (next.id === 'hub') {
          toggleMenu.style.display = 'none';
        } else {
          toggleMenu.style.display = 'block';
        }

        // ➕ Update TO button visibility
        updateToButtonVisibility();

        // ➕ Show/hide #data for voie-aiguillage
        if (next.id === 'voie-aiguillage') {
          // Find which voie-type-container is visible
          const visibleType = Array.from(next.querySelectorAll('.voie-type-container'))
            .find(c => c.style.display !== 'none');
          const type = visibleType ? visibleType.dataset.type : '';
          showOrHideDataForAiguillage(type);
        } else {
          document.getElementById('data').style.display = 'flex';
        }

      }, 500);
    } else {
      next.classList.add('active');
      next.style.display = 'flex';
      next.style.visibility = 'visible';
      next.style.animationName = 'slideInUp';

      const toggleMenu = document.querySelector('.voie-toggle');
      if (next.id === 'hub') {
        toggleMenu.style.display = 'none';
      } else {
        toggleMenu.style.display = 'block';
      }
      updateToButtonVisibility();

      // ➕ Show/hide #data for voie-aiguillage
      if (next.id === 'voie-aiguillage') {
        const visibleType = Array.from(next.querySelectorAll('.voie-type-container'))
          .find(c => c.style.display !== 'none');
        const type = visibleType ? visibleType.dataset.type : '';
        showOrHideDataForAiguillage(type);
      } else {
        document.getElementById('data').style.display = 'flex';
      }
    }
  });
});


let boisChartInstance = null;
let jointsChartInstance = null;
function initCharts() {
  console.log('appel de la fonction initCharts');
  const boisCtx = document.getElementById('boisChart')?.getContext('2d');
  if (boisCtx) {
    boisChartInstance = new Chart(boisCtx, {
      type: 'doughnut',
      data: {
        labels: ['Bon état', 'À remplacer'],
        datasets: [{
          data: [0, 0], // données initiales vides
          backgroundColor: ['#4caf50', '#f44336']
        }]
      },
      options: {
        cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
  }

  const jointsCtx = document.getElementById('jointsChart')?.getContext('2d');
  if (jointsCtx) {
    jointsChartInstance = new Chart(jointsCtx, {
      type: 'doughnut',
      data: {
        labels: ['Bon état', 'À reprendre'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#4caf50', '#f44336']
        }]
      },
      options: {
        cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
  }
}

function updateCharts(data) {
  console.log('appel de la fonction updateCharts');
  if (boisChartInstance && data.bois_bon != null && data.bois_a_remp != null) {
    boisChartInstance.data.datasets[0].data = [data.bois_bon, data.bois_a_remp];
    boisChartInstance.update();
  }

  if (jointsChartInstance && data.joints_bon != null && data.joints_a_repr != null) {
    jointsChartInstance.data.datasets[0].data = [data.joints_bon, data.joints_a_repr];
    jointsChartInstance.update();
  }
}



function switchVoieTypeContent(type) {
  // Always show only the summary when loading voie-aiguillage
  document.querySelectorAll('#voie-aiguillage .voie-type-container').forEach(container => {
    if (container.dataset.type === 'summary') {
      container.style.display = 'flex';
    } else {
      container.style.display = 'none';
    }
  });

  // Show the correct summary table for the type
  const summaryTableBs = document.getElementById('summary-table_bs');
  const summaryTableTj = document.getElementById('summary-table_tj');
  if (type === 'bs') {
    if (summaryTableBs) summaryTableBs.style.display = '';
    if (summaryTableTj) summaryTableTj.style.display = 'none';
  } else if (type === 'tj') {
    if (summaryTableBs) summaryTableBs.style.display = 'none';
    if (summaryTableTj) summaryTableTj.style.display = '';
  } else {
    if (summaryTableBs) summaryTableBs.style.display = '';
    if (summaryTableTj) summaryTableTj.style.display = '';
  }

  // Update summary/détail buttons
  const showDetailBtn = document.getElementById('show-detail');
  if (showDetailBtn) showDetailBtn.style.display = 'inline-block';
  const showSummaryBtn = document.getElementById('show-summary');
  if (showSummaryBtn) showSummaryBtn.style.display = 'none';

  showOrHideDataForAiguillage(type);
}
function showOrHideDataForAiguillage(type) {
  // Hide #data if in voie-aiguillage and type is 'bs', show otherwise
  const voieAiguillage = document.getElementById('voie-aiguillage');
  const dataSection = document.getElementById('data');
  if (!voieAiguillage || !dataSection) return;

  // Only check if voie-aiguillage is active
  if (voieAiguillage.classList.contains('active')) {
    if (type === 'bs') {
      dataSection.style.display = 'none';
    } else {
      dataSection.style.display = 'flex';
    }
  } else {
    dataSection.style.display = 'flex';
  }
}
function showSummaryForCurrentType() {
  // Masquer toutes les voie-type sauf summary dans #voie-aiguillage
  document.querySelectorAll('#voie-aiguillage .voie-type-container').forEach(c => {
    c.style.display = (c.dataset.type === 'summary') ? 'flex' : 'none';
  });

  // Masquer toutes les tables du résumé
  document.querySelectorAll('#voie-aiguillage #summary table').forEach(tbl => {
    tbl.style.display = 'none';
  });

  // Afficher uniquement la table correspondant au currentType
  const summaryTable = document.querySelector(`#voie-aiguillage #summary-table_${currentType}`);
  if (summaryTable) {
    summaryTable.style.display = 'table';
  }

  // (Optionnel) si tu veux aussi mettre à jour les données
  if (typeof renderSummaryTable === 'function' && summaryData) {
    renderSummaryTable(currentType, summaryData);
  }

  // Mettre à jour les boutons
  document.getElementById('show-summary').style.display = 'none';
  document.getElementById('show-detail').style.display = 'inline-block';
}

function switchVoieTypeContent(type) {
  // Affiche toujours le résumé en premier
  document.querySelectorAll('.voie-type-container').forEach(container => {
    container.style.display = 'none';
    if (container.dataset.type === 'summary') {
      container.style.display = 'flex';

      // Affiche le bon tableau résumé selon le type
      const summaryTableBs = container.querySelector('#summary-table_bs');
      const summaryTableTj = container.querySelector('#summary-table_tj');
      if (type === 'bs') {
        if (summaryTableBs) summaryTableBs.style.display = '';
        if (summaryTableTj) summaryTableTj.style.display = 'none';
      } else if (type === 'tj') {
        if (summaryTableBs) summaryTableBs.style.display = 'none';
        if (summaryTableTj) summaryTableTj.style.display = '';
      } else {
        // Par défaut, tout afficher
        if (summaryTableBs) summaryTableBs.style.display = '';
        if (summaryTableTj) summaryTableTj.style.display = '';
      }
      return;
    }else if (container.dataset.type === type) {
        document.querySelectorAll('.voie-type-container').forEach(container => {
        if (container.dataset.type === type) {
          container.style.display = 'flex';
        } else {
          container.style.display = 'none';
        }
      });
    } else {
      container.style.display = 'none';
    }
  });

  // Optionnel : gérer les boutons résumé/détail
  const showDetailBtn = document.getElementById('show-detail');
  if (showDetailBtn) showDetailBtn.style.display = 'inline-block';
  const showSummaryBtn = document.getElementById('show-summary');
  if (showSummaryBtn) showSummaryBtn.style.display = 'none';
} 


function updateEcartements(adv, type) {
  console.log('appel de la fonction updateEcartements');
  if (!adv || typeof adv !== 'object') return;

  const voieEcartement = document.getElementById('voie-ecartement');
  if (!voieEcartement) return;

  document.querySelectorAll('#voie-ecartement .voie-type-container').forEach(container => {
    container.style.display = (container.dataset.type === type) ? 'block' : 'none';
  });

  const targetContainer = voieEcartement.querySelector(`.voie-type-container[data-type="${type}"]`);
  if (!targetContainer) {
    console.warn(`❌ Container avec data-type="${type}" non trouvé.`);
    return;
  }

  // Remplit les cartes
  const cards = targetContainer.querySelectorAll('.ecartement-card');
  cards.forEach((card, index) => {
    const key = `ecart_${index + 1}`;
    const value = adv[key];
    card.textContent = (value !== undefined && value !== null && value !== '') ? value : '-';
  });
}

function updateAttaches(adv, type) {
  console.log('appel de la fonction updateAttaches');
  if (!adv || typeof adv !== 'object') return;

  const voieEcartement = document.getElementById('voie-ecartement');
  if (!voieEcartement) return;

  const targetContainer = voieEcartement.querySelector(`.voie-type-container[data-type="${type}"]`);
  if (!targetContainer) {
    console.warn(`❌ Container avec data-type="${type}" non trouvé.`);
    return;
  }

  const rows = targetContainer.querySelectorAll('table.attaches-table tbody tr');

  rows.forEach(row => {
    const zoneCell = row.cells[0];
    const effCell = row.cells[1];
    const ineffCell = row.cells[2];

    if (!zoneCell || !effCell || !ineffCell) return;

    const zone = zoneCell.textContent.trim(); // ex: "1", "2'", etc.

    const keyEff = `att_e_pct_${zone}`;
    const keyIneff = `att_i_pct_${zone}`;

    const valEff = adv[keyEff];
    const valIneff = adv[keyIneff];

    effCell.textContent = valEff != null ? `${(parseFloat(valEff) * 100).toFixed(0)}%` : '-';
    ineffCell.textContent = valIneff != null ? `${(parseFloat(valIneff) * 100).toFixed(0)}%` : '-';
  });
}
function fillCoeur2cInputs(advData) {
  console.log('appel de la fonction fillCoeur2cInputs');

  const voieContainers = document.querySelectorAll(".voie-type-container");

  voieContainers.forEach(container => {
    const type = container.dataset.type;
    if (type !== "tj" && type !== "to" && type !== "bs") return;

    // Partie haute
    const h = container.querySelector(".container_coeur2c_h");
    if (h) {
      h.querySelector(".ep_cr_g").value = advData["ep_cr_g_h"] ?? "no-data";
      h.querySelector(".ep_cal_g").value = advData["ep_cal_g_h"] ?? "no-data";
      h.querySelector(".nb_cal_g").value = advData["nb_cal_g_h"] ?? "no-data";

      h.querySelector(".ep_cr_d").value = advData["ep_cr_d_h"] ?? "no-data";
      h.querySelector(".ep_cal_d").value = advData["ep_cal_d_h"] ?? "no-data";
      h.querySelector(".nb_cal_d").value = advData["nb_cal_d_h"] ?? "no-data";

      h.querySelector(".coeur2c_num_h").value = advData["coeur2c_num_h"] ?? "no-data";
    }

    const ht = container.querySelector(".container_coeur2c_h_t");
    if (ht) {
      ht.querySelector(".p2p_g_h").value = advData["p2p_g_h"] ?? "no-data";
      ht.querySelector(".p2p_d_h").value = advData["p2p_d_h"] ?? "no-data";
      ht.querySelector(".coeur2c_num_h_t").value = advData["coeur2c_num_h"] ?? "no-data";
    }

    // Partie basse
    const b = container.querySelector(".container_coeur2c_b");
    if (b) {
      b.querySelector(".ep_cr_g").value = advData["ep_cr_g_b"] ?? "no-data";
      b.querySelector(".ep_cal_g").value = advData["ep_cal_g_b"] ?? "no-data";
      b.querySelector(".nb_cal_g").value = advData["nb_cal_g_b"] ?? "no-data";

      b.querySelector(".ep_cr_d").value = advData["ep_cr_d_b"] ?? "no-data";
      b.querySelector(".ep_cal_d").value = advData["ep_cal_d_b"] ?? "no-data";
      b.querySelector(".nb_cal_d").value = advData["nb_cal_d_b"] ?? "no-data";

      b.querySelector(".coeur2c_num_b").value = advData["coeur2c_num_b"] ?? "no-data";
    }

    const bt = container.querySelector(".container_coeur2c_b_t");
    if (bt) {
      bt.querySelector(".p2p_g_b").value = advData["p2p_g_b"] ?? "no-data";
      bt.querySelector(".p2p_d_b").value = advData["p2p_d_b"] ?? "no-data";
      bt.querySelector(".coeur2c_num_b_t").value = advData["coeur2c_num_b"] ?? "no-data";
    }

    const t = container.querySelector(".traverse-img");
    if (t) {
      t.querySelector(".p2p_g_h").value = advData["p2p_g_h"] ?? "no-data";
      t.querySelector(".p2p_d_h").value = advData["p2p_d_h"] ?? "no-data";
      t.querySelector(".libre_passage_g").value = advData["libre_passage_g"] ?? "no-data";
      t.querySelector(".libre_passage_d").value = advData["libre_passage_d"] ?? "no-data";
      t.querySelector(".p2p_g_b").value = advData["p2p_g_b"] ?? "no-data";
      t.querySelector(".p2p_d_b").value = advData["p2p_d_b"] ?? "no-data";
      t.querySelector(".coeur2t_num_g").value = advData["coeur2t_num_g"] ?? "no-data";
      t.querySelector(".coeur2t_num_d").value = advData["coeur2t_num_d"] ?? "no-data";
    }

    const bs = container.querySelector(".croisement-img-bs");
    if (bs) {
      bs.querySelector(".p2p_g").value = advData["p2p_g"] ?? "no-data";
      bs.querySelector(".p2p_d").value = advData["p2p_d"] ?? "no-data";
    }
  });

  // Appeler UNE SEULE fois après la boucle
  fillCroisementTable(document, advData);
}

function fillCroisementTable(container, advData) {
  console.log('appel de la fonction fillCroisementTable');
  const table = container.querySelector(".croisement-table");
  if (!table) return;

  const row = table.querySelector("tbody tr");
  if (!row) return;

  const cells = row.querySelectorAll("td");
  if (cells.length < 8) return;

  cells[0].textContent = advData["coeur_num"] ?? "no-data";
  cells[1].textContent = advData["ep_cr_g"] ?? "no-data";
  cells[2].textContent = advData["ep_cal_g"] ?? "no-data";
  cells[3].textContent = advData["nb_cales_g"] ?? "no-data";
  cells[4].textContent = advData["ep_cr_d"] ?? "no-data";
  cells[5].textContent = advData["ep_cal_d"] ?? "no-data";
  cells[6].textContent = advData["nb_cales_d"] ?? "no-data";
  cells[7].textContent = advData["coeur_etat"] ?? "no-data";
}

function updateBavuresTable(data) {
  console.log('appel de la fonction updateBavuresTable');
  const mappingBavure = {
    "aucune bavure": "aucune",
    "bavures éliminées par meulage": "meulage",
    "présence de bavures": "presence"
  };

  ['tj', 'bs'].forEach(type => {
    const container = document.querySelector(`#voie-aiguillage .voie-type-container[data-type="${type}"]`);
    if (!container) {
      console.warn(`#voie-aiguillage .voie-type-container[data-type="${type}"] not found`);
      return;
    }

    const table = container.querySelector("#bavure-table");
    if (!table) {
      console.warn(`#bavure-table not found in ${type} container`);
      return;
    }

    // Clear all cells except the first column
    table.querySelectorAll("tbody tr").forEach(row => {
      for (let i = 1; i < row.cells.length; i++) {
        row.cells[i].textContent = "";
      }
    });

    data.forEach(item => {
      if (!item.bavure || !item.adv_type) return;
      const bavureKey = mappingBavure[item.bavure.toLowerCase()];
      if (!bavureKey) return;

      const row = table.querySelector(`tbody tr[data-type="${bavureKey}"]`);
      if (!row) return;

      const advType = item.adv_type.toUpperCase();

      if (type === "bs") {
        // For BS, columns: 1 = G, 2 = D
        if (advType === "G" && row.cells[1]) row.cells[1].textContent = "✗";
        if (advType === "D" && row.cells[2]) row.cells[2].textContent = "✗";
      } else if (type === "tj") {
        // For TJ, columns: 1..8 = 1..8
        const colIndex = parseInt(advType, 10);
        if (!isNaN(colIndex) && colIndex >= 1 && colIndex <= 8 && row.cells[colIndex]) {
          row.cells[colIndex].textContent = "✗";
        }
      }
    });
  });
}

function updateEbrechureTable(data) {
  console.log('appel de la fonction updateEbrechureTable');
  ['tj', 'bs'].forEach(type => {
    const container = document.querySelector(`#voie-aiguillage .voie-type-container[data-type="${type}"]`);
    if (!container) return;
    const table = container.querySelector("#ebrechure_ag");
    if (!table) return;

    // Clear all cells except the first column
    table.querySelectorAll("tbody tr").forEach(row => {
      for (let i = 1; i < row.cells.length; i++) {
        row.cells[i].textContent = "";
      }
    });

    data.forEach(item => {
      const advType = (item.adv_type || '').toUpperCase();

      // Determine column index for this adv_type
      let colIndex = null;
      if (type === "bs") {
        if (advType === "G") colIndex = 1;
        if (advType === "D") colIndex = 2;
      } else if (type === "tj") {
        const idx = parseInt(advType, 10);
        if (!isNaN(idx) && idx >= 1 && idx <= 8) colIndex = idx;
      }

      // 1. ebrechure_a
      if (item.ebrechure_a && colIndex !== null) {
        const val = item.ebrechure_a.toLowerCase();
        if (val.includes("aucune")) {
          const row = table.querySelector('tr[data-type="aucune_ebrechure"]');
          if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
        } else {
          const row = table.querySelector('tr[data-type="presence_ebrechure"]');
          if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
        }
      }

      // 2. ctc_fente
      if (item.ctc_fente && colIndex !== null) {
        if (item.ctc_fente === "dessous") {
          const row = table.querySelector('tr[data-type="ctc_dessous_fente"]');
          if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
        } else if (item.ctc_fente === "dessus") {
          const row = table.querySelector('tr[data-type="ctc_dessus_fente"]');
          if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
        }
      }

      // 3. taille_ebrechure_fente → longueur_sous_fente
      if (item.taille_ebrechure_fente != null && colIndex !== null) {
        const row = table.querySelector('tr[data-type="longueur_sous_fente"]');
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = item.taille_ebrechure_fente;
      }

      // 4. taille_tot_ebrechure → longueur_totale_zone
      if (item.taille_tot_ebrechure != null && colIndex !== null) {
        const row = table.querySelector('tr[data-type="longueur_totale_zone"]');
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = item.taille_tot_ebrechure;
      }

      // 5. ebrechure_a_classement → ebrechure_a_classement
      if (item.ebrechure_a_classement != null && colIndex !== null) {
        const row = table.querySelector('tr[data-type="ebrechure_a_classement"]');
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = item.ebrechure_a_classement;
      }
    });
  });
}

function updateAppDM(data) {
  console.log('appel de la fonction updateAppDM');
  ['tj', 'bs'].forEach(type => {
    const container = document.querySelector(`#voie-aiguillage .voie-type-container[data-type="${type}"]`);
    if (!container) return;
    const table = container.querySelector("#app_demi-aiguillage");
    if (!table) return;

    // Clear all cells except the first column
    table.querySelectorAll("tbody tr").forEach(row => {
      for (let i = 1; i < row.cells.length; i++) {
        row.cells[i].textContent = "";
      }
    });

    data.forEach(item => {
      const advType = (item.adv_type || '').toUpperCase();

      // Determine column index for this adv_type
      let colIndex = null;
      if (type === "bs") {
        if (advType === "G") colIndex = 1;
        if (advType === "D") colIndex = 2;
      } else if (type === "tj") {
        const idx = parseInt(advType, 10);
        if (!isNaN(idx) && idx >= 1 && idx <= 8) colIndex = idx;
      }

      // application_da_etat_bute → etat_butee
      if (item.application_da_etat_bute && colIndex !== null) {
        const row = table.querySelector('tr[data-type="etat_butee"]');
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = item.application_da_etat_bute;
      }

      // application_da_entrebaillement → entrebaillement
      if (item.application_da_entrebaillement != null && colIndex !== null) {
        const row = table.querySelector('tr[data-type="entrebaillement"]');
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = item.application_da_entrebaillement;
      }
    });
  });
}

function updateUsureLcaTable(data) {
  console.log('appel de la fonction updateUsureLcaTable');
  ['tj', 'bs'].forEach(type => {
    const container = document.querySelector(`#voie-aiguillage .voie-type-container[data-type="${type}"]`);
    if (!container) return;
    const table = container.querySelector("#usure_lca");
    if (!table) return;

    // Clear all cells except the first column
    table.querySelectorAll("tbody tr").forEach(row => {
      for (let i = 1; i < row.cells.length; i++) {
        row.cells[i].textContent = "";
      }
    });

    data.forEach(item => {
      const advType = (item.adv_type || '').toUpperCase();

      // Determine column index for this adv_type
      let colIndex = null;
      if (type === "bs") {
        if (advType === "G") colIndex = 1;
        if (advType === "D") colIndex = 2;
      } else if (type === "tj") {
        const idx = parseInt(advType, 10);
        if (!isNaN(idx) && idx >= 1 && idx <= 8) colIndex = idx;
      }

      if (colIndex === null) return;

      // usure_lca
      if (item.usure_lca) {
        let row = null;
        const val = item.usure_lca.toLowerCase();
        if (val.includes("(j < 3mm)")) {
          row = table.querySelector('tr[data-type="pige_j_moins_3"]');
        } else if (val.includes("(j = 0)")) {
          row = table.querySelector('tr[data-type="pige_j_egal_0"]');
        } else if (val.includes("(j > 3mm)")) {
          row = table.querySelector('tr[data-type="pige_j_plus_3"]');
        }
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
      }

      // usure_lca_calibre
      if (item.usure_lca_calibre) {
        let row = null;
        if (item.usure_lca_calibre === "ne passe pas") {
          row = table.querySelector('tr[data-type="calibre_ne_passe_pas"]');
        } else if (item.usure_lca_calibre === "sans meulage") {
          row = table.querySelector('tr[data-type="calibre_avant_meulage"]');
        } else if (item.usure_lca_calibre === "après meulage") {
          row = table.querySelector('tr[data-type="calibre_apres_meulage"]');
        }
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
      }

      // usure_lca_pige
      if (item.usure_lca_pige) {
        let row = null;
        if (item.usure_lca_pige === "ne passe pas") {
          row = table.querySelector('tr[data-type="pige_ne_passe_pas"]');
        } else if (item.usure_lca_pige === "sans meulage") {
          row = table.querySelector('tr[data-type="pige_avant_meulage"]');
        } else if (item.usure_lca_pige === "après meulage") {
          row = table.querySelector('tr[data-type="pige_apres_meulage"]');
        }
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
      }

      // usure_lca_classement
      if (item.usure_lca_classement != null) {
        const row = table.querySelector('tr[data-type="usure_la_classement"]');
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = item.usure_lca_classement;
      }
    });
  });
}

function updateUsureLaTable(data) {
  console.log('appel de la fonction updateUsureLaTable');
  ['tj', 'bs'].forEach(type => {
    const container = document.querySelector(`#voie-aiguillage .voie-type-container[data-type="${type}"]`);
    if (!container) return;
    const table = container.querySelector("#usure_la");
    if (!table) return;

    // Vide toutes les cellules sauf la première colonne
    table.querySelectorAll("tbody tr").forEach(row => {
      for (let i = 1; i < row.cells.length; i++) {
        row.cells[i].textContent = "";
      }
    });

    data.forEach(item => {
      const advType = (item.adv_type || '').toUpperCase();

      // Détermine l'index de colonne pour ce adv_type
      let colIndex = null;
      if (type === "bs") {
        if (advType === "G") colIndex = 1;
        if (advType === "D") colIndex = 2;
      } else if (type === "tj") {
        const idx = parseInt(advType, 10);
        if (!isNaN(idx) && idx >= 1 && idx <= 8) colIndex = idx;
      }
      if (colIndex === null) return;

      // usure_la_contact
      if (item.usure_la_contact) {
        const val = item.usure_la_contact.toLowerCase();
        if (val.includes("au dessus et au dessous")) {
          const row = table.querySelector('tr[data-type="contact_haut_bas"]');
          if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
        } else if (val.includes("au dessus")) {
          const row = table.querySelector('tr[data-type="contact_haut"]');
          if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
        } else if (val.includes("au dessous")) {
          const row = table.querySelector('tr[data-type="contact_bas"]');
          if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
        }
      }

      // usure_la_pente
      if (item.usure_la_pente) {
        const val = item.usure_la_pente.replace(/\s/g, '').toLowerCase();
        if (val.includes(">=60°") || val.includes("≥60°") || val.includes(">60°")) {
          const row = table.querySelector('tr[data-type="pente_usure_sup_60"]');
          if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
        } else if (val.includes("<=60°") || val.includes("≤60°") || val.includes("<60°")) {
          const row = table.querySelector('tr[data-type="pente_usure_inf_60"]');
          if (row && row.cells[colIndex]) row.cells[colIndex].textContent = "✗";
        }
      }

      // usure_la_classement
      if (item.usure_la_classement != null) {
        const row = table.querySelector('tr[data-type="usure_la_classement"]');
        if (row && row.cells[colIndex]) row.cells[colIndex].textContent = item.usure_la_classement;
      }
    });
  });
}

document.getElementById('show-detail').onclick = function () {
  // Masquer le résumé, afficher le détail selon le type courant
  document.querySelector('.voie-type-container[data-type="summary"]').style.display = 'none';
  document.querySelectorAll('#voie-aiguillage .voie-type-container').forEach(c => {
    if (c.dataset.type === currentType) {
      c.style.display = 'flex';
    } else if (c.dataset.type !== 'summary') {
      c.style.display = 'none';
    }
  });
  // Boutons
  document.getElementById('show-summary').style.display = 'inline-block';
  document.getElementById('show-detail').style.display = 'none';
};

document.getElementById('show-summary').onclick = function () {
  // Masquer le détail, afficher le résumé
  document.querySelectorAll('#voie-aiguillage .voie-type-container').forEach(c => {
    if (c.dataset.type === 'summary') {
      c.style.display = 'flex';
    } else {
      c.style.display = 'none';
    }
  });
  // Afficher le bon tableau résumé
  renderSummaryTable(currentType, summaryData);
  // Boutons
  document.getElementById('show-summary').style.display = 'none';
  document.getElementById('show-detail').style.display = 'inline-block';
};

function renderSummaryTable(type, data) {
  console.log('renderSummaryTable called with type:', type);

  // Hide both summary tables first
  const bsTable = document.getElementById('summary-table_bs');
  const tjTable = document.getElementById('summary-table_tj');
  if (bsTable) bsTable.style.display = 'none';
  if (tjTable) tjTable.style.display = 'none';

  // Show the correct summary table
  let table = null;
  if (type === 'bs') {
    table = bsTable;
    console.log('Showing summary-table_bs');
  } else if (type === 'tj') {
    table = tjTable;
    console.log('Showing summary-table_tj');
  } else {
    console.warn('Unknown type for summary:', type);
  }
  if (!table) return;
  table.style.display = 'table';

  // Toggle buttons: show only #show-detail in summary mode
  document.getElementById('show-summary').style.display = 'none';
  document.getElementById('show-detail').style.display = 'inline-block';

  // Clear all cells except the first column
  // table.querySelectorAll('tbody tr').forEach(row => {
  //   for (let i = 1; i < row.cells.length; i++) {
  //     row.cells[i].textContent = "";
  //   }
  // });

  // Helper to get column index for bs/tj
  function getColIndex(advType) {
    if (type === 'bs') {
      if (advType === 'G') return 1;
      if (advType === 'D') return 2;
    } else if (type === 'tj') {
      const idx = parseInt(advType, 10);
      if (!isNaN(idx) && idx >= 1 && idx <= 8) return idx;
    }
    return null;
  }

  data.forEach(item => {
    const advType = (item.adv_type || '').toUpperCase();
    const colIndex = getColIndex(advType);
    if (colIndex === null) return;

    // Bavure
    if (item.bavure) {
      const row = table.querySelector('tr[data-type="bavure"]');
      if (row && row.cells[colIndex]) row.cells[colIndex].textContent = " ^|^w";
    }
    //  ^ibr  chure
    if (item.ebrechure_a) {
      const row = table.querySelector('tr[data-type="ebrechure"]');
            if (row && row.cells[colIndex]) row.cells[colIndex].textContent = " ^|^w";
    }
    // Application demi-aiguillage
    if (item.application_da_etat_bute || item.application_da_entrebaillement) {
      const row = table.querySelector('tr[data-type="app-dm-ag"]');
      if (row && row.cells[colIndex]) row.cells[colIndex].textContent = " ^|^w";
    }
    // Usure lat  rale contre-aiguille
    if (item.usure_lca) {
      const row = table.querySelector('tr[data-type="usure_lca"]');
      if (row && row.cells[colIndex]) row.cells[colIndex].textContent = " ^|^w";
    }
    // Usure lat  rale aiguille
    if (item.usure_la_contact || item.usure_la_pente || item.usure_la_classement) {
      const row = table.querySelector('tr[data-type="usure_la"]');
      if (row && row.cells[colIndex]) row.cells[colIndex].textContent = " ^|^w";
    }
  });
}