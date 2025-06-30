const voies = [];
let charts = [];
let voieActive = null;
let latestDataGlobal = [];



async function loadVoies() {
    try {
        const res = await fetch('/api/voiesBoulogne');
        const data = await res.json();

        data.forEach(row => voies.push(row.voie));

        // Charge tous les jeux de données à l’avance
        const [ecartRes, flecheRes, gaRes] = await Promise.all([
            fetch('/api/voiesBoulogne/ecart'),
            fetch('/api/voiesBoulogne/fleche'),
            fetch('/api/voiesBoulogne/ga'),
        ]);

        const [ecartData, flecheData, gaData] = await Promise.all([
            ecartRes.json(),
            flecheRes.json(),
            gaRes.json(),
        ]);

        // Fusionne les données globales pour les anomalies
        latestDataGlobal = ecartData.map(d => ({
            voie: d.voie,
            distance: d.distance,
            ecarts_1435: d.ecarts_1435,
            fleches: flecheData.find(f => f.voie === d.voie && f.distance === d.distance)?.fleches,
            ga_arrondi: gaData.find(g => g.voie === d.voie && g.distance === d.distance)?.ga_arrondi
        }));

        voieActive = voies[0];
        loadGraphData(voieActive);
        createTableVoies(voies);
    } catch (err) {
        console.error('Erreur lors du chargement des voies :', err);
    }
}


function createTableVoies(voies) {
    const container = document.getElementById("container");
    container.innerHTML = '';

    voies.forEach((voie) => {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.textContent = voie;
        cell.style.cursor = 'pointer';
        row.appendChild(cell);
        container.appendChild(row);

        // Appliquer la couleur active ou anomalie
        if (voie === voieActive) {
            row.classList.add('active-voie');
        } else if (voieHasAnomaly(voie)) {
            row.classList.add('anomalie-voie');
        }

        row.addEventListener('click', () => {
            voieActive = voie;
            loadGraphData(voie).then(() => {
                createTableVoies(voies); // Mettre à jour les couleurs après chargement
            });
        });
    });
}
function voieHasAnomaly(voie) {
    return latestDataGlobal.some(d =>
        d.voie === voie && (
            d.ecarts_1435 > 1460 ||
            // d.fleches > 100 ||      // seuils à ajuster selon ton besoin
            d.ga_arrondi > 50
        )
    );
}


async function loadGraphData(voie) {
    try {
        const [ecartRes, flecheRes, gaRes] = await Promise.all([
            fetch('/api/voiesBoulogne/ecart'),
            fetch('/api/voiesBoulogne/fleche'),
            fetch('/api/voiesBoulogne/ga'),
        ]);

        const [ecartData, flecheData, gaData] = await Promise.all([
            ecartRes.json(),
            flecheRes.json(),
            gaRes.json(),
        ]);

        const mergedData = ecartData
            .filter(d => d.voie === voie)
            .map(d => ({
                id: d.distance,
                ecart1435: d.ecarts_1435,
                fleches: flecheData.find(f => f.voie === voie && f.distance === d.distance)?.fleches,
                ga1: gaData.find(g => g.voie === voie && g.distance === d.distance)?.ga_arrondi
            }));

        updateCharts(mergedData, voie);

    } catch (err) {
        console.error('Erreur lors du chargement des données pour les graphiques :', err);
    }
}

function updateCharts(data, voieLabel) {
    charts.forEach(chart => chart.destroy());
    charts = [];

    const chartConfigs = [
        { id: 'chart1', label: 'Ecarts_1435', key: 'ecart1435', color: 'blue', threshold: 1460, tableId: 'table1-body' },
        { id: 'chart2', label: 'Flèches', key: 'fleches', color: 'blue', tableId: 'table2-body' },
        { id: 'chart3', label: 'Ga1', key: 'ga1', color: 'blue', tableId: 'table3-body' }
    ];

    chartConfigs.forEach(config => {
        const ctx = document.getElementById(config.id).getContext('2d');

        const chartData = data
            .filter(point => !isNaN(point[config.key]))
            .map(point => {
                const xValue = parseFloat(point.id);
                if (isNaN(xValue)) {
                    console.error(`ID non valide pour la voie ${voieLabel}:`, point.id);
                    return null;
                }

                const color = (config.threshold && point[config.key] > config.threshold) ? 'red' : config.color;

                return { x: xValue, y: point[config.key], backgroundColor: color };
            })
            .filter(item => item !== null);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    // label: `${config.label} pour ${voieLabel}`,
                    data: chartData,
                    backgroundColor: 'transparent',
                    borderColor: chartData.map(p => p.backgroundColor),
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    pointBackgroundColor: chartData.map(p => p.backgroundColor),
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: false }, // ⬅️ Pas de titre
                    tooltip: {
                        callbacks: {
                            label: context => `Id: ${context.raw.x}, ${config.label}: ${context.raw.y}`
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        ticks: {
                            beginAtZero: true,
                            stepSize: 10,
                        }
                    },
                    y: {
                        // No title
                    }
                }
            }
        });

        charts.push(chart);

        const tableBody = document.getElementById(config.tableId);
        tableBody.innerHTML = '';

        data
            .filter(point => config.threshold && point[config.key] > config.threshold)
            .forEach(point => {
                const row = document.createElement('tr');
                const idCell = document.createElement('td');
                const valueCell = document.createElement('td');

                idCell.textContent = point.id;
                valueCell.textContent = point[config.key];

                row.appendChild(idCell);
                row.appendChild(valueCell);
                tableBody.appendChild(row);

                row.addEventListener('mouseenter', () => {
                    const datasetIndex = 0;
                    const dataIndex = chart.data.datasets[0].data.findIndex(p => p.x === parseFloat(point.id));
                    if (dataIndex !== -1) {
                        chart.setActiveElements([{ datasetIndex, index: dataIndex }]);
                        chart.tooltip.setActiveElements([{ datasetIndex, index: dataIndex }], { x: 0, y: 0 });
                        chart.update();
                    }
                });

                row.addEventListener('mouseleave', () => {
                    chart.setActiveElements([]);
                    chart.tooltip.setActiveElements([], { x: 0, y: 0 });
                    chart.update();
                });
            });
    });
}

loadVoies();