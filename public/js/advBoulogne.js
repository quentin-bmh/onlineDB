let map;
let marker;

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadTypeButtons();
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
  const lat = parseFloat(adv["lat"] || adv["Latitude"]);
  const lng = parseFloat(adv["long"] || adv["Longitude"]);

  if (!lat || !lng) return alert("Coordonnées manquantes pour cet ADV");

  if (marker) map.removeLayer(marker);

  marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${adv["adv"] || adv["ADV"]}</b>`)
    .openPopup();

  map.setView([lat, lng], 20);
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
        console.log(`Type ADV sélectionné : ${type}`);
        document.querySelectorAll('.data-btn').forEach(btn => btn.classList.remove('active-type'));
        button.classList.add('active-type');

        fetch(`/api/adv_from/${type}`)
          .then(res => res.json())
          .then(data => {
            console.log(`ADV trouvés pour le type ${type}:`, data);
            const title = document.getElementById('advTypeTitle');
            if (title) title.textContent = `Résultats pour le type : ${type}`;

            createTable(data);
            if (data.length > 0) {
              updateMap(data[0]);
              const firstRow = document.querySelector("#advTable tbody tr");
              if (firstRow) firstRow.classList.add("active-adv");
            }
          })
          .catch(err => {
            console.error(`Erreur lors du chargement des ADV pour ${type} :`, err);
          });
      });

      advSection.appendChild(button);
    });
  })
  .catch(err => {
    console.error('Erreur lors du chargement des types ADV :', err);
  });
}






const toggleTab = document.querySelector('.toggle-tab');
const toggleMenu = document.querySelector('.toggle-menu');
const contentSections = document.querySelectorAll('.voie-content');

toggleTab.addEventListener('click', () => {
  const isOpen = toggleMenu.style.display === 'block';
  toggleMenu.style.display = isOpen ? 'none' : 'block';
  toggleTab.classList.toggle('active', !isOpen);
});
document.addEventListener('DOMContentLoaded', () => {
  const allVoies = document.querySelectorAll('.voie-content');

  // Cacher toutes les voies au début
  allVoies.forEach(voie => {
    voie.classList.remove('active');
    voie.style.display = 'none';
    voie.style.visibility = 'hidden';
  });

  // Activer la première voie si aucune n'est active
  let active = document.querySelector('.voie-content.active');
  if (!active && allVoies.length > 0) {
    active = allVoies[0];
    active.classList.add('active');
    active.style.display = 'block';
    active.style.visibility = 'visible';
  }

  // Gestion des clics sur boutons
  document.querySelectorAll('.toggle-menu button').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const current = document.querySelector('.voie-content.active');
      const next = document.getElementById(targetId);

      if (!next || current === next) return;

      // Cacher l'actuel
      if (current) {
        current.classList.remove('active');
        current.style.animationName = 'slideOutDown';

        setTimeout(() => {
          current.style.display = 'none';
          current.style.visibility = 'hidden';

          // Afficher le suivant
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
});

const boisCtx = document.getElementById('boisChart').getContext('2d');
  const boisChart = new Chart(boisCtx, {
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

  const jointsCtx = document.getElementById('jointsChart').getContext('2d');
  const jointsChart = new Chart(jointsCtx, {
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


