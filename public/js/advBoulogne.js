let map;
let marker;

fetch('/api/advBoulogne')
    .then(res => res.json())
    .then(data => {
      console.log('Données ADV chargées :', data[0]);
        createTable(data);
        initMap();
        if (data.length > 0) updateMap(data[0]);
    })
    .catch(err => {
      console.error('Erreur lors du chargement des données ADV :', err);
    });

function createTable(data) {
    const tbody = document.querySelector("#advTable tbody");
    data.forEach((adv, index) => {
        const lat = parseFloat(adv["Latitude"]);
        const lng = parseFloat(adv["Longitude"]);

        if (!lat || !lng) return;

        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${adv["ADV"] || `ADV ${index}`}</td>
        `;
        // <td>${lat.toFixed(5)}</td>
        // <td>${lng.toFixed(5)}</td>

        row.addEventListener("click", () => updateMap(adv));
        tbody.appendChild(row);
    });
}

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
    const lat = parseFloat(adv["Latitude"]);
    const lng = parseFloat(adv["Longitude"]);

    if (!lat || !lng) return alert("Coordonnées manquantes pour cet ADV");

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map).bindPopup(`<b>${adv["ADV"]}</b>`).openPopup();
    map.setView([lat, lng], 20);
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