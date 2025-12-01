let map;
let marker;
let boisChartInstance = null;
let jointsChartInstance = null;
let advMarkers = L.layerGroup();
let currentType = '';
let summaryData = [];


document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadTypeButtons();
    setupToggleMenu();
    initCharts();
});


// advBoulogne.js - Dans la fonction initMap()

function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([46.5, 2.5], 7);

    const normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    });
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; CartoDB'
    });
    satelliteLayer.addTo(map);

    L.control.layers({
      "Plan Standard": normalLayer,
      "Satellite": satelliteLayer,
      "Fond Sombre (Neutre)": darkLayer
    }).addTo(map);

    advMarkers.addTo(map);
}

function updateMap(adv) {
    if (marker) map.removeLayer(marker); 
    advMarkers.clearLayers(); 

    const lat = parseFloat(adv["lat"] ?? adv["Latitude"]);
    const lng = parseFloat(adv["long"] ?? adv["Longitude"]);

    if (!lat || !lng) {
      alert("Coordonnées manquantes pour cet ADV");
      return;
    }

    marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<b>${adv["adv"] ?? adv["ADV"] ?? "ADV"}</b>`)
      .openPopup();

    map.setView([lat, lng], 20);
    
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
}

function displayAdvMarkers(advList) {
    if (marker) map.removeLayer(marker); 
    marker = null;
    advMarkers.clearLayers();

    let bounds = [];

    advList.forEach(adv => {
        const name = adv["adv"];
        const type = adv["type"];
        const lat = parseFloat(adv["lat"] ?? adv["Latitude"]);
        const lng = parseFloat(adv["long"] ?? adv["Longitude"]);
        
        const advName = name ?? adv["ADV"] ?? "ADV";

        if (lat && lng) {
            const newMarker = L.marker([lat, lng])
                .bindPopup(`<b>${advName}</b><br>Type: ${type ?? ""}`)
                .bindTooltip(advName, { 
                    permanent: true,       
                    direction: 'top',      
                    className: 'adv-permanent-tooltip' 
                });
            newMarker.on('mouseover', function() {
                const tooltipElement = newMarker.getTooltip()._container;
                if (tooltipElement) {
                    tooltipElement.classList.add('adv-tooltip-hover-focus');
                }
            });
            newMarker.on('mouseout', function() {
                const tooltipElement = newMarker.getTooltip()._container;
                if (tooltipElement) {
                    tooltipElement.classList.remove('adv-tooltip-hover-focus');
                }
            });
            newMarker.on('click', function(e) {
                const rowId = `adv-row-${name.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const targetRow = document.getElementById(rowId);
                
                if (currentType === 'all' && type) {
                    const targetButton = document.querySelector(`.data-btn[data-type="${type}"]`);
                    if (targetButton) {
                        targetButton.dispatchEvent(new CustomEvent('advClick', { detail: { advName: name } }));
                        return;
                    }
                }
                
                if (targetRow) {
                    targetRow.querySelector('.adv-name-cell').click(); 
                    targetRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    console.warn(`Ligne de tableau non trouvée pour l'ADV : ${name} (Filtre actuel: ${currentType})`);
                }
            });

            advMarkers.addLayer(newMarker);
            bounds.push([lat, lng]);
        }
    });
    
    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] }); 
    } else {
        map.setView([46.5, 2.5], 7);
    }
    
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
}
function handleTypeButtonClick(type, advToSelect) {
    const activeVoie = document.querySelector('.voie-content.active');
    const hubButton = document.querySelector('.toggle-menu button[data-target="hub"]');
    
    if (activeVoie && activeVoie.id !== 'hub' && hubButton) {
        hubButton.click();
    }

    document.querySelectorAll('.data-btn').forEach(btn => btn.classList.remove('active-type'));
    const currentButton = document.querySelector(`.data-btn[data-type="${type}"]`);
    if (currentButton) currentButton.classList.add('active-type');
    
    currentType = type.toLowerCase();
    
    document.querySelectorAll('button[data-target="voie-aiguillage"]').forEach(boutonAiguillage => {
      boutonAiguillage.style.display = (type === 'BS' || type === 'TJ') ? 'inline-block' : 'none';
    });
    
    const fetchUrl = (type === 'ALL') 
      ? '/api/adv_coordinates'
      : `/api/adv_coordinates/${encodeURIComponent(type)}`;
      
    const mapContainer = document.getElementById('map-container');
    const mapEl = document.getElementById('map');
    
    if (mapContainer && mapEl) {
      mapContainer.style.display = 'block';
      mapContainer.classList.remove('map-no-adv-selected');
      mapEl.style.display = 'block'; 
    }
    if (map) map.invalidateSize();

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        summaryData = data;
        createTable(data, advToSelect); 
        displayAdvMarkers(data);

      })
      .catch(err => {
        console.error("Erreur lors du chargement des ADV par type:", err);
      });
}
function loadTypeButtons() {
    fetch('/api/adv_types')
      .then(res => res.json())
      .then(types => {
        const advSection = document.querySelector('.adv-section');
        if (!advSection) return;

        const allType = { type: 'ALL' };
        const finalTypes = [allType, ...types];

        advSection.innerHTML = '';

        let firstButton = null;
        finalTypes.forEach(({ type }, index) => {
          const button = document.createElement('button');
          button.textContent = type;
          button.classList.add('data-btn');
          button.setAttribute('data-type', type);
          button.addEventListener('click', (event) => {
            if (event.detail && event.detail.advName) return; 
            handleTypeButtonClick(type, null); 
          });
          button.addEventListener('advClick', (event) => {
            const advToSelect = event.detail.advName;
            handleTypeButtonClick(type, advToSelect);
          });

          advSection.appendChild(button);
          if (index === 0) firstButton = button;
        });

        if (firstButton) firstButton.click();
      })
      .catch(err => {
        console.error('Erreur lors du chargement des types ADV :', err);
      });
}
async function getSpecificSnapshotData(advType, advName, snapshotDate) {
    const url = `/api/historic_from/${advType.toLowerCase()}`; 
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        const targetAdvData = data.find(item => 
            item.adv === advName && item.snapshot_date === snapshotDate
        );

        return targetAdvData || {};
    } catch (e) {
        console.error(`Échec du chargement de la snapshot ${snapshotDate}:`, e);
        return {};
    }
}
async function getDaSnapshotData(advName, snapshotDate) {
    const url = `/api/b2v_da_historic_from/${encodeURIComponent(advName)}`; 
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        const filteredDaData = data.filter(item => 
            item.snapshot_adv === advName && item.snapshot_date === snapshotDate
        );

        return filteredDaData;
    } catch (e) {
        console.error(`Échec du chargement de la snapshot DA ${snapshotDate}:`, e);
        return [];
    }
}

function getAdvDataHub(adv, isSnapshot = false, snapshotDate = null) {
  const name = (adv["adv"] || adv["ADV"] || '').trim();
  const type = (adv["type"] || currentType).toLowerCase();

  if (!name || !type) {
    console.warn("ADV ou Type non défini. Données détaillées ADV non chargées.");
    return;
  }
  
  if (isSnapshot && snapshotDate) {
      console.log(`Chargement de la SNAPSHOT: ${name} (${snapshotDate})`);
      getSpecificSnapshotData(type, name, snapshotDate)
          .then(advData => {
              if (Object.keys(advData).length === 0) {
                  console.warn("Aucune donnée spécifique trouvée pour cette snapshot.");
                  return;
              }
              switchVoieTypeContent(type, 'voie-croisement');
              switchVoieTypeContent(type, 'voie-ecartement');
              updateCroisement(advData)
              updateEcartementAttaches(advData, type)
              updatePlancherBois(advData);
          });
      if (type === 'bs' || type === 'tj') {
          getDaSnapshotData(name, snapshotDate)
              .then(data => {
                  if (data.length > 0) {
                      switchVoieTypeContent(type, 'voie-aiguillage');
                      updateDA(data, type);
                  }
              });
      }
      
  } else {
      console.log(`Chargement des données COURANTES: ${name}`);
      const encodedName = encodeURIComponent(name);
      
      fetch(`/api/${type}/${encodedName}`)
        .then(res => {
          if (!res.ok) throw new Error(`Erreur ${res.status}`);
          return res.json();
        })
        .then(advData => {
          advData = Array.isArray(advData) ? advData[0] : advData;
          if (!advData) return;
          switchVoieTypeContent(type, 'voie-croisement');
          switchVoieTypeContent(type, 'voie-ecartement');
          updateCroisement(advData)
          updateEcartementAttaches(advData, type)
          updatePlancherBois(advData);
        })
        .catch(err => console.error("Erreur chargement ADV détails:", err));
        
      fetch(`/api/da?adv=${encodedName}`)
        .then(res => {
          if (!res.ok) throw new Error(`Erreur HTTP (bavure): ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) return;
          switchVoieTypeContent(type, 'voie-aiguillage');
          updateDA(data, type);
        })
        .catch(err => console.error("Erreur chargement bavure ADV:", err));
  }
}
async function getSnapshotList(type) {
    const url = `/api/list_historic_for/${type.toLowerCase()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        if (e.message && e.message.includes('404')) {
             console.warn(`[Historique] Route ou ressource non trouvée pour ${type}.`);
             return [];
        }
        console.error(`Échec du chargement des snapshots pour ${type}:`, e);
        return [];
    }
}

async function createTable(data, advToSelect = null) {
    const tbody = document.querySelector("#advTable tbody");
    tbody.innerHTML = '';
    const dataVoieContainer = document.getElementById('dataVoie-container');
    const dataContainer = document.getElementById('data');
    const mapContainer = document.getElementById('map-container');
    const currentAdvType = currentType.toUpperCase();
    if (dataVoieContainer && dataContainer && mapContainer) {
        dataVoieContainer.classList.remove('active-adv-data');
        dataContainer.classList.remove('active-adv-data'); 
        dataContainer.style.display = '';
        dataVoieContainer.style.display = '';
        mapContainer.classList.add('map-no-adv-selected');
        if (map) map.invalidateSize();
    }
    
    if (data.length === 0) {
        console.log(`Aucun ADV trouvé pour le type: ${currentAdvType}`);
        return;
    }
    let snapshotMap = new Map();
    if (currentAdvType !== 'ALL') {
        const allSnapshots = await getSnapshotList(currentAdvType);
        
        allSnapshots.forEach(snap => {
            if (!snapshotMap.has(snap.snapshot_adv)) {
                snapshotMap.set(snap.snapshot_adv, []);
            }
            snapshotMap.get(snap.snapshot_adv).push(snap.snapshot_date);
        });
    }
    for (const adv of data) {
        const name = adv["adv"];
        const advType = adv["type"] ?? currentAdvType;
        const rowId = `adv-row-${name.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        const snapshots = snapshotMap.get(name) || [];
        const hasSnapshots = snapshots.length > 0;
        const row = document.createElement("tr");
        row.setAttribute('id', rowId);
        
        row.innerHTML = `
            <td class="adv-name-cell">${name}</td>
            <td class="snapshot-toggle-cell" data-adv="${name}">
                ${hasSnapshots ? `<span class="toggle-icon">▶</span>` : ''}
            </td>
        `;
        row.querySelector('.adv-name-cell').addEventListener("click", () => {
            if (currentType === 'all' && advType) {
                const targetButton = document.querySelector(`.data-btn[data-type="${advType}"]`);
                if (targetButton) {
                    targetButton.dispatchEvent(new CustomEvent('advClick', { detail: { advName: name } }));
                    return;
                }
            }
            if (dataVoieContainer && dataContainer && mapContainer) {
                mapContainer.classList.remove('map-no-adv-selected');
                dataVoieContainer.classList.add('active-adv-data');
                dataContainer.classList.add('active-adv-data');
                if (map) map.invalidateSize();
            }

            document.querySelectorAll("#advTable tbody tr").forEach(r => r.classList.remove("active-adv", "active-snapshot", "active-snapshot-item"));
            row.classList.add("active-adv");
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            getAdvDetails(adv);
            getAdvDataHub(adv, false);
            updateMap(adv);
        });

        tbody.appendChild(row);
        const snapshotRows = [];

        if (hasSnapshots) {
            const toggleCell = row.querySelector('.snapshot-toggle-cell');
            const icon = toggleCell.querySelector('.toggle-icon');
            
            snapshots.sort((a, b) => new Date(b) - new Date(a));
            
            snapshots.forEach(dateStr => {
                const date = new Date(dateStr);
                
                const displayDate = date.toLocaleDateString('fr-FR', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                });
                
                // CRÉATION DE LA LIGNE DE SNAPSHOT (TR)
                const itemRow = document.createElement('tr');
                itemRow.classList.add('snapshot-item-row', 'hidden'); 
                
                itemRow.innerHTML = `
                    <td colspan="2" class="snapshot-item-cell" data-date="${dateStr}">
                        Mise à jour le
                        ${displayDate}
                    </td>
                `;
                
                // Clic sur une snapshot spécifique
                itemRow.addEventListener('click', () => {
                    // 1. Mise en évidence
                    document.querySelectorAll("#advTable tbody tr").forEach(r => r.classList.remove("active-adv", "active-snapshot", "active-snapshot-item"));
                    row.classList.add("active-adv", "active-snapshot"); 
                    itemRow.classList.add("active-snapshot-item"); 
                    
                    // Logique d'affichage
                    if (dataVoieContainer && dataContainer && mapContainer) {
                        mapContainer.classList.remove('map-no-adv-selected');
                        dataVoieContainer.classList.add('active-adv-data');
                        dataContainer.classList.add('active-adv-data');
                        if (map) map.invalidateSize();
                    }

                    // 2. Charger les données HISTORIQUES et METTRE À JOUR LA CARTE
                    getAdvDetails(adv); 
                    getAdvDataHub(adv, true, dateStr); 
                    updateMap(adv); // ✅ CORRECTION: Appel à la mise à jour de la carte (utilise l'ADV parent pour les coordonnées)
                });

                snapshotRows.push(itemRow);
                tbody.appendChild(itemRow); 
            });
            
            // Événement de bascule du dépliant
            toggleCell.addEventListener('click', () => {
                const isCurrentlyHidden = snapshotRows.length > 0 && snapshotRows[0].classList.contains('hidden');

                // Basculer l'état de visibilité de toutes les lignes de snapshots
                snapshotRows.forEach(sr => sr.classList.toggle('hidden'));
                
                // Mettre à jour l'icône (▼ si ouvert, ▶ si fermé)
                icon.textContent = isCurrentlyHidden ? '▼' : '▶';
            });
        }
    } // Fin boucle for...of (data)

    // --- Gestion du Clic Forcé (ALL -> Type) ---
    if (advToSelect) {
        const targetRowId = `adv-row-${advToSelect.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const targetRow = document.getElementById(targetRowId);

        if (targetRow) {
            // Déclencher le clic sur la cellule du nom de l'ADV (qui charge les données courantes)
            // L'appel au `.click()` déclenchera l'écouteur, qui contient maintenant `updateMap(adv)`.
            targetRow.querySelector('.adv-name-cell').click(); 
        }
    }
}
// Le reste des fonctions (getAdvDetails, updateCroisement, etc.) suit ici...

function getAdvDetails(adv) {
  const advName = adv["ADV"] || adv["adv"];
  if (!advName) {
    console.warn("ADV manquant dans l'objet :", adv);
    return;
  }
  createDocumentButton(advName);
  
  // CORRECTION: Utilisation de encodeURIComponent pour le chemin query string
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
      document.getElementById('document-btn')?.remove();
    });
}


// document.getElementById("new-measure-btn").addEventListener("click", () => {
//   const activeVoie = document.querySelector(".voie-content.active");
//   if (!activeVoie) {
//     console.warn("Aucune voie active trouvée !");
//     return;
//   }

//   const visibleContainers = Array.from(
//     activeVoie.querySelectorAll(".voie-type-container")
//   ).filter(c => c.style.display !== "none");

//   visibleContainers.forEach(container => {
//     const elements = container.querySelectorAll(
//       "input, textarea, select, table, [data-value], [data-editable], .ecartement-card"
//     );

//     elements.forEach(el => {
//       let identifier =
//         el.id ||
//         el.getAttribute("name") ||
//         (el.className ? "." + el.className.split(" ").join(".") : "(sans id/classe)");
//       if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
//         el.disabled = false;
//       } else if (el.tagName === "TABLE") {
//       } else if (el.classList.contains("ecartement-card")) {
//         el.contentEditable = true;
//         el.style.cursor = "text";
//       }
//       let value = "";
//       if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
//         value = el.value;
//       } else if (el.tagName === "TABLE") {
//         value = el.innerText.trim();
//       } else {
//         value = el.getAttribute("data-value") || el.innerText.trim();
//       }
//       console.log(identifier,`Valeur ${value}`);
//     });
//   });
// });


function createDocumentButton(advName) {
    const hub = document.getElementById('hub');
    if (!hub) return;
    const oldButton = document.getElementById('document-btn');
    if (oldButton) oldButton.remove();

    if (!advName || advName === '') return;

    const button = document.createElement('button');
    button.id = 'document-btn';
    button.textContent = `Plan de l'appareil`;
    button.classList.add('data-btn-document'); 
    const fullFilename = advName + '.pdf';
    const WEBDAV_TARGET_DIR = "/User-Uploads/uploads-public"; // Assurez-vous que cette constante est définie
    const webdavFullPath = `${WEBDAV_TARGET_DIR}/${fullFilename}`; 
    const encodedPath = encodeURIComponent(webdavFullPath);
    const documentUrl = `/api/webdav/open/${encodedPath}`; 

    button.onclick = () => {
        window.open(documentUrl, '_blank'); 
    };
    hub.appendChild(button);
}


function displayAdvDetails(adv) {
  const container = document.getElementById('info-container');
  container.innerHTML = ''; 
  const fieldsMap = {
    tangente:       { label: 'Tangente',          key: 'tangente' },
    modele:         { label: 'Modèle',            key: 'modele' },
    plancher:       { label: 'Plancher',          key: 'plancher' },
    pose:           { label: 'Pose',              key: 'pose' },
    rail:           { label: 'Rail',              key: 'rails' },
    sensDeviation: { label: 'Sens déviation',   key: 'sens_deviation' },
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
function setupToggleMenu() {
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




function getAdvData(adv) {
  const name = (adv["adv"] || adv["ADV"] || '').trim();
  const type = (adv["type"] || '').toLowerCase();
  
  if (!name || !type) {
    if (currentType !== 'all') {
      console.warn("ADV ou Type non défini. Données détaillées ADV non chargées.");
    }
    return;
  }
  
  // Utiliser la fonction hub pour le chargement courant
  getAdvDataHub(adv, false);
}

function updateCroisement(adv){
  fillCoeur2cInputs(adv);
}

function updatePlancherBois(adv){
  updateBois(adv);
  updateCharts(adv);
}
function updateEcartementAttaches(adv, type){
  updateEcartements(adv, type);
  updateAttaches(adv, type);
}

function updateDA(data, type){
  updateBavuresTable(data);
  updateEbrechureTable(data);
  updateAppDM(data);
  updateUsureLcaTable(data);
  updateUsureLaTable(data);
}


function switchVoieTypeContent(type, voieId) {
  const parent = document.getElementById(voieId);
  if (!parent) return;
  
  if (voieId === 'voie-aiguillage') {
    parent.querySelectorAll('.voie-type-container').forEach(container => {
      container.style.display = (container.dataset.type === 'summary') ? 'flex' : 'none';
    });

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

    const showDetailBtn = document.getElementById('show-detail');
    if (showDetailBtn) showDetailBtn.style.display = 'inline-block';
    const showSummaryBtn = document.getElementById('show-summary');
    if (showSummaryBtn) showSummaryBtn.style.display = 'none';

    return;
  }

  parent.querySelectorAll('.voie-type-container').forEach(container => {
    container.style.display = (container.dataset.type === type) ? 'flex' : 'none';
  });
  showOrHideDataForAiguillage(type);
  updateButtons();
}


function showOrHideDataForAiguillage(type) {
  const voieAiguillage = document.getElementById('voie-aiguillage');
  const dataSection = document.getElementById('data');
  if (!voieAiguillage || !dataSection) return;
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

function updateToButtonVisibility() {
  const voieAiguillage = document.querySelector('#voie-aiguillage.voie-content.active');
  const toggleContainer = document.querySelector('.toggle-summary-detail');
  if (!toggleContainer) return;
  
  const isAiguillageActive = voieAiguillage && voieAiguillage.classList.contains('active');
  
  // toggleContainer.style.display = isAiguillageActive ? 'none' : 'inline-flex';
  updateButtons();
}
document.querySelectorAll('.toggle-menu button, #hub button').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const current = document.querySelector('.voie-content.active');
    const next = document.getElementById(targetId);
    const infoContainer = document.getElementById('info-container'); 
    const img_ag_tj = document.getElementById('tj_aiguille_img');
    const left_sidebar = document.getElementById('left-sidebar');
    const data_section = document.querySelector('.data-actions');
    const dataADV = document.getElementById('data');
    const data_voie_container = document.getElementById('dataVoie-container');
    const mapEl = document.getElementById('map');
    const mapContainer = document.getElementById('map-container');
    
    if (!next || current === next) return;

    const isAdvSelected = data_voie_container && data_voie_container.classList.contains('active-adv-data');
    if (targetId === 'voie-aiguillage') {
      infoContainer.style.display = 'none';
      img_ag_tj.style.display = 'flex';
      left_sidebar.style.gridRow = '1 / 4';
      data_section.style.gridRow = '4 / 6';
      data_section.style.gridColumn = '1 / 3';
      dataADV.style.gridColumn = '1 / 3';
      dataADV.style.gridRow = '6 / 8';
      data_voie_container.style.gridRow = '1 / 11';
      mapContainer.style.display = 'none';
      
    
      dataADV.style.display = 'none'; 
      data_voie_container.style.display = 'flex'; 
      
    } else {
      infoContainer.style.display = 'flex';
      img_ag_tj.style.display = 'none';
      left_sidebar.style.gridRow = '1 / 8';
      data_section.style.gridRow = '1 / 4';
      data_section.style.gridColumn = '3 / 5';
      dataADV.style.gridColumn = '5 / 7';
      dataADV.style.gridRow = '1 / 4';
      data_voie_container.style.gridRow = '4 / 11';
      // mapEl.style.display = 'block';
      dataADV.style.display = ''; 
      data_voie_container.style.display = '';
      if (isAdvSelected) {
        mapContainer.style.display = 'block';
        dataADV.classList.add('active-adv-data');
        data_voie_container.classList.add('active-adv-data');
      } 
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

        const toggleMenu = document.querySelector('.voie-toggle');
        if (next.id === 'hub') {
          toggleMenu.style.display = 'none';
        } else {
          toggleMenu.style.display = 'block';
        }

        updateToButtonVisibility();

        if (next.id === 'voie-aiguillage') {
          const visibleType = Array.from(next.querySelectorAll('.voie-type-container'))
            .find(c => c.style.display !== 'none');
          const type = visibleType ? visibleType.dataset.type : '';
        } else {
          if (map) map.invalidateSize(); 
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

      if (next.id === 'voie-aiguillage') {
        const visibleType = Array.from(next.querySelectorAll('.voie-type-container'))
          .find(c => c.style.display !== 'none');
        const type = visibleType ? visibleType.dataset.type : '';
        showOrHideDataForAiguillage(type);
      } else {
        if (map) map.invalidateSize();
      }
    }
  });
});






function resetVoieContent() {
  const allVoies = document.querySelectorAll('.voie-content');
  const hub = document.getElementById('hub');
  const toggleMenu = document.querySelector('.voie-toggle');

  // Masquer tous les .voie-content
  allVoies.forEach(voie => {
    voie.classList.remove('active');
    voie.style.display = 'none';
    voie.style.visibility = 'hidden';
    voie.style.animationName = '';
  });

  // Activer #hub correctement
  hub.classList.add('active');
  hub.style.display = 'flex';
  hub.style.visibility = 'visible';
  hub.style.animationName = 'slideInUp';

  if (toggleMenu) toggleMenu.style.display = 'none';
}



function updateButtons() {
  const voieAiguillage = document.querySelector('#voie-aiguillage.voie-content.active');
  const toggleContainer = document.querySelector('.toggle-summary-detail');
  const btnSummary = document.getElementById('show-summary');
  const btnDetail = document.getElementById('show-detail');
  toggleContainer.style.display = 'none';
  if (!voieAiguillage) return;
   const visibleContainer = Array.from(voieAiguillage.querySelectorAll('.voie-type-container'))
    .find(c => c.style.display !== 'none');
  if (!visibleContainer) return;
  toggleContainer.style.display = 'inline-flex';
  if (visibleContainer.dataset.type === 'summary') {
    btnSummary.style.display = 'none';
    btnDetail.style.display = 'inline-block';
  } else {
    btnSummary.style.display = 'inline-block';
    btnDetail.style.display = 'none';
  }
}
updateButtons();
 document.getElementById('show-detail').onclick = function () {
  const voieAiguillage = document.querySelector('#voie-aiguillage.voie-content.active');
  if (!voieAiguillage) return;

  voieAiguillage.querySelector('.voie-type-container[data-type="summary"]').style.display = 'none';
  voieAiguillage.querySelectorAll('.voie-type-container').forEach(c => {
    if (c.dataset.type === currentType) c.style.display = 'flex';
    else if (c.dataset.type !== 'summary') c.style.display = 'none';
  });

  updateButtons(); // mettre à jour les boutons
};

// Clic sur show-summary
document.getElementById('show-summary').onclick = function () {
  const voieAiguillage = document.querySelector('#voie-aiguillage.voie-content.active');
  if (!voieAiguillage) return;

  voieAiguillage.querySelectorAll('.voie-type-container').forEach(c => {
    if (c.dataset.type === 'summary') c.style.display = 'flex';
    else c.style.display = 'none';
  });

  renderSummaryTable(currentType, summaryData);

  updateButtons();
};

function renderSummaryTable(type, data) {
  // Hide both summary tables first
  const bsTable = document.getElementById('summary-table_bs');
  const tjTable = document.getElementById('summary-table_tj');
  if (bsTable) bsTable.style.display = 'none';
  if (tjTable) tjTable.style.display = 'none';

  // Show the correct summary table
  let table = null;
  if (type === 'bs') {
    table = bsTable;
    // console.log('Showing summary-table_bs');
  } else if (type === 'tj') {
    table = tjTable;
    // console.log('Showing summary-table_tj');
  } else {
    // console.warn('Unknown type for summary:', type);
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

// function whereImI(){
//   const current = document.querySelector('.voie-content.active');
//   if(current){
//     return "Nouvelles mesures pour " + current.id;
//   }else{
//     return "Aucune voie-content active.";
//   }
// }
// const btn = document.getElementById("new-measure-btn");
// const tooltip = document.getElementById("tooltip");

// // Affichage au survol
// btn.addEventListener("mouseenter", () => {
//   tooltip.textContent = whereImI();
//   tooltip.classList.add("show");
// });

// // Masquage quand on sort
// btn.addEventListener("mouseleave", () => {
//   tooltip.classList.remove("show");
// });

function updateBavuresTable(data) {
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


//page Plancher/bois

function updateBois(adv) {
  if (!adv || typeof adv !== 'object') return;
  
  // === JOINTS ===
  const jointsBon = Number(adv['joints_bon']) || 0;
  const jointsRepr = Number(adv['joints_a_repr']) || 0;
  const jointsGraisser = Number(adv['joints_a_graisser']) || 0;
  const jointsPct = adv['joints_pct_remp'] !== undefined ? adv['joints_pct_remp'] + '%' : '-';

  // CORRECTION: Total des joints (ceux qui existent physiquement, qu'ils soient bons ou à reprendre)
  const totalJoints = jointsBon + jointsRepr;

  const jointsCountEl = document.getElementById('jointsCount');
  if (jointsCountEl) {
    jointsCountEl.textContent = totalJoints;
  }

  const jointsRow = document.querySelector('#plancher-joints .plancher-table tbody tr');
  if (jointsRow) {
    const cells = jointsRow.querySelectorAll('td');
    if (cells.length >= 4) {
      cells[0].textContent = jointsPct;       // % joints à remplacer
      cells[1].textContent = jointsBon;       // joints bon état
      cells[2].textContent = jointsRepr;      // joints à reprendre
      cells[3].textContent = jointsGraisser;  // joints à graisser (catégorie distincte)
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
  
  // Appel à updateCharts avec les trois valeurs distinctes
  updateCharts(adv);
}

function initCharts() {
    const boisCtx = document.getElementById('boisChart')?.getContext('2d');
    if (boisCtx) {
        boisChartInstance = new Chart(boisCtx, {
            type: 'doughnut',
            data: {
                labels: ['Bon état', 'À remplacer'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#4caf50', '#f44336']
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });
    }

    const jointsCtx = document.getElementById('jointsChart')?.getContext('2d');
    if (jointsCtx) {
        jointsChartInstance = new Chart(jointsCtx, {
            type: 'bar',
            data: {
                labels: ['Bon état', 'À reprendre', 'À graisser'],
                datasets: [{
                    label: 'Nombre de joints',
                    data: [0, 0, 0],
                    backgroundColor: ['#4caf50', '#f44336', '#e2df13ff'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#000000ff'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#000000ff'
                        }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}
function updateCharts(adv) {
  if (!adv || typeof adv !== 'object') {
      console.warn("Données ADV invalides reçues par updateCharts.");
      return;
  }

  const boisBon = Number(adv['bois_bon']) || 0;
  const boisRemp = Number(adv['bois_a_remp']) || 0;
  
  const jointsBon = Number(adv['joints_bon']) || 0;
  const jointsRemp = Number(adv['joints_a_repr']) || 0;
  const jointsGraisser = Number(adv['joints_a_graisser']) || 0;
  
  // Mise à jour Bois (Doughnut)
  if (boisChartInstance) {
    boisChartInstance.data.datasets[0].data = [boisBon, boisRemp];
    boisChartInstance.update();
  }

  // Mise à jour Joints (Graphique à Barres) : 3 catégories distinctes
  if (jointsChartInstance) {
    jointsChartInstance.data.datasets[0].data = [jointsBon, jointsRemp, jointsGraisser];
    jointsChartInstance.update();
  }
}


//page ecartement/attaches

function updateEcartements(adv, type) {
  // console.log('UpdateEcartement: adv: ', adv, 'type: ',type)
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

        let zone = zoneCell.textContent.trim();
        const zoneKey = zone.replace("'", 'p');
        const keyEffCount = `att_e_${zoneKey}`;
        const keyIneffCount = `att_i_${zoneKey}`;
        const keyEffPct = `att_e_pct_${zoneKey}`;
        const keyIneffPct = `att_i_pct_${zoneKey}`;

        const valEffCount = adv[keyEffCount];
        const valIneffCount = adv[keyIneffCount];
        effCell.textContent = (valEffCount != null && valEffCount !== '') ? valEffCount : '-';
        ineffCell.textContent = (valIneffCount != null && valIneffCount !== '') ? valIneffCount : '-';
        effCell.setAttribute('contenteditable', 'true');
        ineffCell.setAttribute('contenteditable', 'true');
        const valEffPct = adv[keyEffPct];
        const valIneffPct = adv[keyIneffPct];
        effCell.textContent = (valEffPct != null) ? `${(parseFloat(valEffPct) * 100).toFixed(0)}%` : '-';
        ineffCell.textContent = (valIneffPct != null) ? `${(parseFloat(valIneffPct) * 100).toFixed(0)}%` : '-';
  });
}

//page Croisement
function fillCoeur2cInputs(adv) {
  // console.log('fillCoeur2cInputs advData: ', adv)
  const voieContainers = document.querySelectorAll(".voie-type-container");

  voieContainers.forEach(container => {
    const type = container.dataset.type;
    if (type !== "tj" && type !== "to" && type !== "bs") return;

    // Partie haute
    const h = container.querySelector(".container_coeur2c_h");
    if (h) {
      h.querySelector(".ep_cr_g").value = adv["ep_cr_g_h"] ?? "no-data";
      h.querySelector(".ep_cal_g").value = adv["ep_cal_g_h"] ?? "no-data";
      h.querySelector(".nb_cal_g").value = adv["nb_cal_g_h"] ?? "no-data";

      h.querySelector(".p2p_g_h").value = adv["p2p_g_h"] ?? "no-data";
      h.querySelector(".p2p_d_h").value = adv["p2p_d_h"] ?? "no-data";


      h.querySelector(".ep_cr_d").value = adv["ep_cr_d_h"] ?? "no-data";
      h.querySelector(".ep_cal_d").value = adv["ep_cal_d_h"] ?? "no-data";
      h.querySelector(".nb_cal_d").value = adv["nb_cal_d_h"] ?? "no-data";

      h.querySelector(".coeur2c_num_h").value = adv["coeur2c_num_h"] ?? "no-data";
    }

    const ht = container.querySelector(".container_coeur2c_h_t");
    if (ht) {
      ht.querySelector(".p2p_g_h").value = adv["p2p_g_h"] ?? "no-data";
      ht.querySelector(".p2p_d_h").value = adv["p2p_d_h"] ?? "no-data";
      ht.querySelector(".coeur2c_num_h_t").value = adv["coeur2c_num_h"] ?? "no-data";
    }

    // Partie basse
    const b = container.querySelector(".container_coeur2c_b");
    if (b) {
      b.querySelector(".ep_cr_g").value = adv["ep_cr_g_b"] ?? "no-data";
      b.querySelector(".ep_cal_g").value = adv["ep_cal_g_b"] ?? "no-data";
      b.querySelector(".nb_cal_g").value = adv["nb_cal_g_b"] ?? "no-data";

      b.querySelector(".p2p_g_b").value = adv["p2p_g_b"] ?? "no-data";
      b.querySelector(".p2p_d_b").value = adv["p2p_d_b"] ?? "no-data";

      b.querySelector(".ep_cr_d").value = adv["ep_cr_d_b"] ?? "no-data";
      b.querySelector(".ep_cal_d").value = adv["ep_cal_d_b"] ?? "no-data";
      b.querySelector(".nb_cal_d").value = adv["nb_cal_d_b"] ?? "no-data";

      b.querySelector(".coeur2c_num_b").value = adv["coeur2c_num_b"] ?? "no-data";
    }

    const bt = container.querySelector(".container_coeur2c_b_t");
    if (bt) {
      bt.querySelector(".p2p_g_b").value = adv["p2p_g_b"] ?? "no-data";
      bt.querySelector(".p2p_d_b").value = adv["p2p_d_b"] ?? "no-data";
      bt.querySelector(".coeur2c_num_b_t").value = adv["coeur2c_num_b"] ?? "no-data";
    }

    const t = container.querySelector(".traverse-img");
    if (t) {
      t.querySelector(".p2pt_g_h").value = adv["p2pt_h_g"] ?? "no-data";
      t.querySelector(".p2pt_d_h").value = adv["p2pt_h_d"] ?? "no-data";
      t.querySelector(".libre_passage_g").value = adv["libre_passage_g"] ?? "no-data";
      t.querySelector(".libre_passage_d").value = adv["libre_passage_d"] ?? "no-data";
      t.querySelector(".p2pt_g_b").value = adv["p2pt_b_g"] ?? "no-data";
      t.querySelector(".p2pt_d_b").value = adv["p2pt_b_d"] ?? "no-data";
      t.querySelector(".coeur2t_num_g").value = adv["coeur2t_num_g"] ?? "no-data";
      t.querySelector(".coeur2t_num_d").value = adv["coeur2t_num_d"] ?? "no-data";
    }

    const bs = container.querySelector(".croisement-img-bs");
    if (bs) {
      bs.querySelector(".p2p_g").value = adv["p2p_g"] ?? "no-data";
      bs.querySelector(".p2p_d").value = adv["p2p_d"] ?? "no-data";
      bs.querySelector(".ep_cr_g").value = adv["ep_cr_g"] ?? "no-data";
      bs.querySelector(".ep_cr_d").value = adv["ep_cr_d"] ?? "no-data";
      bs.querySelector(".ep_cal_g").value = adv["ep_cal_g"] ?? "no-data";
      bs.querySelector(".ep_cal_d").value = adv["ep_cal_d"] ?? "no-data";
      bs.querySelector(".nb_cal_d").value = adv["nb_cales_d"] ?? "no-data";
      bs.querySelector(".nb_cal_g").value = adv["nb_cales_g"] ?? "no-data";
      bs.querySelector(".coeur2c_num_h").value = adv["coeur_num"] ?? "no-data";
      bs.querySelector(".coeur_etat").value = adv["coeur_etat"] ?? "no-data";
    }
  });

  // Appeler UNE SEULE fois après la boucle
  // fillCroisementTable(document, adv);
}

function fillCroisementTable(container, adv) {
  const table = container.querySelector(".croisement-table");
  if (!table) return;

  const row = table.querySelector("tbody tr");
  if (!row) return;

  const cells = row.querySelectorAll("td");
  if (cells.length < 8) return;

  cells[0].textContent = adv["coeur_num"] ?? "no-data";
  cells[1].textContent = adv["ep_cr_g"] ?? "no-data";
  cells[2].textContent = adv["ep_cal_g"] ?? "no-data";
  cells[3].textContent = adv["nb_cales_g"] ?? "no-data";
  cells[4].textContent = adv["ep_cr_d"] ?? "no-data";
  cells[5].textContent = adv["ep_cal_d"] ?? "no-data";
  cells[6].textContent = adv["nb_cales_d"] ?? "no-data";
  cells[7].textContent = adv["coeur_etat"] ?? "no-data";
}