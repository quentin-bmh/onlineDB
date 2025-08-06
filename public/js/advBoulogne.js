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
  const tbody = document.querySelector("#advTable tbody");
  tbody.innerHTML = ''; // nettoyage

  data.forEach((adv, index) => {
    const name = adv["adv"];
    const type = adv["type"]; // très important
    // console.log(`Création de la ligne pour ADV: ${name}, Type: ${type}`);
    const row = document.createElement("tr");
    row.innerHTML = `<td>${name}</td>`;

    row.addEventListener("click", () => {
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
            console.log(`Données ADV récupérées pour ${name}:`, advData);
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

function loadTypeButtons() {
  fetch('/api/adv_types')
    .then(res => res.json())
    .then(types => {
      const advSection = document.querySelector('.adv-section');
      if (!advSection || types.length === 0) return;

      // Pour garder une référence au premier bouton
      let firstButton = null;

      types.forEach(({ type }, index) => {
        const button = document.createElement('button');
        button.textContent = type;
        button.classList.add('data-btn');
        button.setAttribute('data-type', type);

        button.addEventListener('click', () => {
          document.querySelectorAll('.data-btn').forEach(btn => btn.classList.remove('active-type'));
          button.classList.add('active-type');
          const boutonAiguillage = document.querySelector('button[data-target="voie-aiguillage"]');
          if (type === 'TO') {
            if (boutonAiguillage) boutonAiguillage.style.display = 'none';
          } else {
            if (boutonAiguillage) boutonAiguillage.style.display = 'inline-block';
          }

          fetch(`/api/adv_from/${encodeURIComponent(type)}`)
            .then(res => res.json())
            .then(data => {
              createTable(data);

              if (data.length > 0) {
                updateMap(data[0]);
                getAdvDetails(data[0]);
                getAdvData(data[0]);
                const firstRow = document.querySelector("#advTable tbody tr");
                if (firstRow) {
                  firstRow.click(); // simulate real click
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
  const container = document.getElementById('info-container');
  container.innerHTML = ''; // reset

  // Mapping clé dans adv => label + id span
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
  const name = (adv["adv"] || adv["ADV"] || '').trim();
  const type = (adv["type"] || '').toLowerCase();

  if (!name || !type) {
    console.warn("ADV ou type manquant dans l'objet :", adv);
    return;
  }

  // 1. Charger les données principales depuis /api/tj/TJD_4 ou autre
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

      switchVoieTypeContent(type);
      updateEcartements(advData, type);
      fillCoeur2cInputs(advData);
      updateAttaches(adv, type);
      updateBois(advData);
      updateCharts(advData);
    })
    .catch(err => {
      console.error("Erreur en chargeant les détails ADV:", err);
    });

  // 2. Charger la bavure (si c’est une voie de type "tj")
  // if (type === 'tj') {
  //   fetch(`/api/da?name=${encodeURIComponent(name)}`)
  //     .then(res => {
  //       if (!res.ok) throw new Error(`Erreur HTTP (bavure): ${res.status}`);
  //       return res.json();
  //     })
  //     .then(data => {
  //       const advData = Array.isArray(data) ? data[0] : data;
  //       if (!advData || !advData.bavure) {
  //         console.warn("Pas de données de bavure reçues pour :", name);
  //         return;
  //       }

  //       loadBavuresSeries(name); // Ne la crée qu’une fois si pas déjà là
  //       updateBavuresTable(name, advData.bavure);
  //     })
  //     .catch(err => {
  //       console.error("Erreur en chargeant la bavure ADV:", err);
  //     });
  // }
}


function getAdvDetails(adv) {
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



document.querySelectorAll('.toggle-menu button, #hub button').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const current = document.querySelector('.voie-content.active');
    const next = document.getElementById(targetId);

    if (!next || current === next) return;

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

      }, 500);
    } else {
      next.classList.add('active');
      next.style.display = 'flex';
      next.style.visibility = 'visible';
      next.style.animationName = 'slideInUp';

      // ➕ Et ici aussi si aucun `current` n'était actif
      const toggleMenu = document.querySelector('.voie-toggle');
      if (next.id === 'hub') {
        toggleMenu.style.display = 'none';
      } else {
        toggleMenu.style.display = 'block';
      }
    }
  });
});


let boisChartInstance = null;
let jointsChartInstance = null;

function initCharts() {
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
  document.querySelectorAll('.voie-type-container').forEach(container => {
    if (container.dataset.type === type) {
      container.style.display = 'flex';
    } else {
      container.style.display = 'none';
    }
  });
}


function updateEcartements(adv, type) {
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
  const voieContainers = document.querySelectorAll(".voie-type-container");
  // console.log('data advData:', advData);

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

    fillCroisementTable(container, advData);
  });
}
function fillCroisementTable(container, advData) {
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












// function loadBavuresSeries(baseName) {
//   createBavuresTable(); // ne fait rien si déjà créé

//   for (let i = 1; i <= 8; i++) {
//     const advId = `${baseName}_${i}`;

//     fetch(`/api/da?name=${encodeURIComponent(advId)}`)
//       .then(res => {
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         return res.json();
//       })
//       .then(data => {
//         const advData = Array.isArray(data) ? data[0] : data;
//         if (advData && advData.bavure) {
//           updateBavuresTable(advId, advData.bavure);
//         } else {
//           console.warn("Pas de données de bavure pour :", advId);
//         }
//       })
//       .catch(err => {
//         console.error("Erreur fetch bavure:", advId, err);
//       });
//   }
// }


// function createBavuresTable() {
//   const container = document.querySelector('#voie-aiguillage .voie-type-container[data-type="tj"]');
//   if (!container) return;

//   // Rendre visible si caché
//   container.style.display = 'block';

//   // Supprimer ancienne table si présente
//   const existing = document.getElementById("bavure-table");
//   if (existing) existing.remove();

//   const table = document.createElement('table');
//   table.id = 'bavure-table';
  

//   const headers = ['', '1/2 aig 1', '1/2 aig 2', '1/2 aig 3', '1/2 aig 4', '1/2 aig 5', '1/2 aig 6', '1/2 aig 7', '1/2 aig 8'];
//   const rows = [
//     { label: 'Aucune bavure', key: 'aucune' },
//     { label: 'Bavures éliminées par meulage', key: 'meulage' },
//     { label: 'Présence de bavures', key: 'presence' }
//   ];

//   const thead = document.createElement('thead');
//   const headerRow = document.createElement('tr');
//   headers.forEach(h => {
//     const th = document.createElement('th');
//     th.textContent = h;
//     th.classList.add('border', 'px-4', 'py-2', 'bg-gray-200');
//     headerRow.appendChild(th);
//   });
//   thead.appendChild(headerRow);
//   table.appendChild(thead);

//   const tbody = document.createElement('tbody');
//   rows.forEach(rowInfo => {
//     const tr = document.createElement('tr');
//     tr.dataset.type = rowInfo.key;

//     const labelCell = document.createElement('td');
//     labelCell.textContent = rowInfo.label;
//     tr.appendChild(labelCell);

//     for (let i = 1; i <= 8; i++) {
//       const td = document.createElement('td');
//       td.textContent = '';
//       tr.appendChild(td);
//     }

//     tbody.appendChild(tr);
//   });

//   table.appendChild(tbody);
//   container.appendChild(table);
// }

// function updateBavuresTable(advName, bavure) {
//   if (!bavure) return;

//   const bavureMap = {
//     "aucune bavure": "aucune",
//     "bavures éliminées par meulage": "meulage",
//     "présence de bavures": "presence"
//   };

//   const rowType = bavureMap[bavure.toLowerCase().trim()];
//   const match = advName.match(/_(\d)$/); // Extrait le suffixe _1, _2, etc.
//   const colIndex = match ? parseInt(match[1], 10) : null;

//   if (!rowType || !colIndex || colIndex < 1 || colIndex > 8) return;

//   const table = document.getElementById("bavure-table");
//   if (!table) return;

//   // On efface tous les X existants avant de placer le nouveau
//   table.querySelectorAll('tbody td').forEach(td => td.textContent = '');

//   const row = table.querySelector(`tr[data-type="${rowType}"]`);
//   if (row) {
//     // +1 car la première colonne est la description (donc index 0)
//     row.children[colIndex].textContent = "X";
//   }
// }
