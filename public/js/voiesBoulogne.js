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
        const [ecartRes, dRes, g3Res] = await Promise.all([
            fetch('/api/voiesBoulogne/ecart'),
            fetch('/api/voiesBoulogne/devers'),
            fetch('/api/voiesBoulogne/ga'),
        ]);

        const [ecartData, dData, g3Data] = await Promise.all([
            ecartRes.json(),
            dRes.json(),
            g3Res.json(),
        ]);

        // Fusionne les données globales
        latestDataGlobal = ecartData.map(d => ({
            voie: d.voie,
            distance: d.distance,
            e: d.e,
            d: dData.find(f => f.voie === d.voie && f.distance === d.distance)?.d,
            g3: g3Data.find(g => g.voie === d.voie && g.distance === d.distance)?.g3
        }));

        voieActive = voies[0];
        loadGraphData(voieActive);
        createTableVoies(voies);
    } catch (err) {
        console.error('Erreur lors du chargement des voies :', err);
    }
}

function voieHasAnomaly(voie) {
    return latestDataGlobal.some(d =>
        d.voie === voie && (
            d.e > 1460 ||
            d.g3 > 50
        )
    );
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

        if (voie === voieActive) {
            row.classList.add('active-voie');
        } else if (voieHasAnomaly(voie)) {
            row.classList.add('anomalie-voie');
        }

        row.addEventListener('click', () => {
            voieActive = voie;
            loadGraphData(voie).then(() => {
                createTableVoies(voies);
            });
        });
    });
}

async function loadGraphData(voie) {
    try {
        const [ecartRes, dRes, g3Res] = await Promise.all([
            fetch('/api/voiesBoulogne/ecart'),
            fetch('/api/voiesBoulogne/devers'),
            fetch('/api/voiesBoulogne/ga'),
        ]);

        const [ecartData, dData, g3Data] = await Promise.all([
            ecartRes.json(),
            dRes.json(),
            g3Res.json(),
        ]);

        const mergedData = ecartData
            .filter(d => d.voie === voie)
            .map(d => ({
                id: d.distance,
                e: d.e,
                d: dData.find(f => f.voie === voie && f.distance === d.distance)?.d,
                g3: g3Data.find(g => g.voie === voie && g.distance === d.distance)?.g3
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
        { id: 'chart1', label: 'E', key: 'e', color: 'blue', threshold: 1460, tableId: 'table1-body' },
        { id: 'chart2', label: 'D', key: 'd', color: 'green', threshold: 20, tableId: 'table2-body' },
        { id: 'chart3', label: 'G3', key: 'g3', color: 'purple', threshold: 30, tableId: 'table3-body' }
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
                    title: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => `Distance: ${context.raw.x}, ${config.label}: ${context.raw.y}`
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
                    y: {}
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
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        navigateVoie(-1);
    } else if (event.key === 'ArrowDown') {
        navigateVoie(1);
    }
});

function navigateVoie(direction) {
    const currentIndex = voies.indexOf(voieActive);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < voies.length) {
        voieActive = voies[newIndex];
        loadGraphData(voieActive).then(() => {
            createTableVoies(voies);
            scrollToActiveVoie(); // bonus
        });
    }
}
