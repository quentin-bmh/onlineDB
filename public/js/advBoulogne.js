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
  tbody.innerHTML = ''; // nettoyage avant remplissage

  data.forEach((adv, index) => {
    const name = adv["adv"] || adv["ADV"] || `ADV ${index}`;

    const row = document.createElement("tr");
    row.innerHTML = `<td>${name}</td>`;

    row.addEventListener("click", () => {
      updateMap(adv);

      // Enlever la classe active à toutes les lignes
      document.querySelectorAll("#advTable tbody tr").forEach(r => r.classList.remove("active-adv"));
      // Ajouter à la ligne cliquée
      row.classList.add("active-adv");
    });

    tbody.appendChild(row);
  });
}
function loadTypeButtons() {
  fetch('/api/adv_types')
    .then(res => res.json())
    .then(types => {
      const advSection = document.querySelector('.adv-section');
      if (!advSection) return;

      types.forEach(({ type }) => {
        const button = document.createElement('button');
        button.textContent = type;
        button.classList.add('data-btn');
        button.setAttribute('data-type', type);

        button.addEventListener('click', () => {
          document.querySelectorAll('.data-btn').forEach(btn => btn.classList.remove('active-type'));
          button.classList.add('active-type');

          fetch(`/api/adv_from/${encodeURIComponent(type)}`)
            .then(res => res.json())
            .then(data => {
              createTable(data);

              if (data.length > 0) {
                updateMap(data[0]);
                displayAdvDetailsFromAdv(data[0]);
                const firstRow = document.querySelector("#advTable tbody tr");
                if (firstRow) firstRow.classList.add("active-adv");
              }
            })
            .catch(err => {
              console.error("Erreur lors du chargement des ADV par type:", err);
            });
        });

        advSection.appendChild(button);
      });
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
    rail:           { label: 'Rail',              key: 'rails' },           // attention au pluriel dans l'exemple
    sensDerivation: { label: 'Sens dérivation',   key: 'sens_deviation' },  // note underscore
    typeAttaches:   { label: "Type d'attaches",   key: 'type_attaches' },
  };

  for (const [spanId, { label, key }] of Object.entries(fieldsMap)) {
    const val = adv[key];
    if (val !== null && val !== undefined && val !== '') {
      const item = document.createElement('div');
      item.className = 'info-item';

      const labelEl = document.createElement('label');
      labelEl.setAttribute('for', spanId);
      labelEl.textContent = label + ':';

      const spanEl = document.createElement('span');
      spanEl.id = spanId;
      spanEl.textContent = val;

      item.appendChild(labelEl);
      item.appendChild(spanEl);
      container.appendChild(item);
    }
  }
}

function displayAdvDetailsFromAdv(adv) {
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
      console.error("Erreur en chargeant les détails ADV:", err);
    });
}


function setupToggleMenu() {
  const toggleTab = document.querySelector('.toggle-tab');
  const toggleMenu = document.querySelector('.toggle-menu');
  const contentSections = document.querySelectorAll('.voie-content');

  if (!toggleTab || !toggleMenu) return;

  toggleTab.addEventListener('click', () => {
    const isOpen = toggleMenu.style.display === 'block';
    toggleMenu.style.display = isOpen ? 'none' : 'block';
    toggleTab.classList.toggle('active', !isOpen);
  });

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
    active.style.display = 'block';
    active.style.visibility = 'visible';
  }


  document.querySelectorAll('.toggle-menu button').forEach(button => {
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
        }, 500);
      } else {
        next.classList.add('active');
        next.style.display = 'block';
        next.style.visibility = 'visible';
        next.style.animationName = 'slideInUp';
      }
    });
  });
}

function initCharts() {
  const boisCtx = document.getElementById('boisChart')?.getContext('2d');
  if (boisCtx) {
    new Chart(boisCtx, {
      type: 'doughnut',
      data: {
        labels: ['Bon état', 'À remplacer'],
        datasets: [{
          data: [35, 5],
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
    new Chart(jointsCtx, {
      type: 'doughnut',
      data: {
        labels: ['Bon état', 'À reprendre'],
        datasets: [{
          data: [40, 5],
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
