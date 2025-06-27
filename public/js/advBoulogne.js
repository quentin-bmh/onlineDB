let map;
let marker;

fetch('/api/advBoulogne')
    .then(res => res.json())
    .then(data => {
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