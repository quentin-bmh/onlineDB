fetch('/api/voiesBoulogne')
    .then(res => res.json())
    .then(data => {
        const voies = data.map(row => row.voie);
        createTableVoies(voies);
    })
    .catch(err => {
    console.error('Erreur lors du chargement des données ADV :', err);
    })
;

fetch('/api/voiesBoulogne/ecart')
    .then(res => res.json())
    .then(data => {
        
    })
    .catch(err => {
    console.error('Erreur lors du chargement des données ADV :', err);
    })
;






function createTableVoies(voies) {
    const container = document.getElementById("container");    
    voies.forEach((voie) => {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.textContent = voie; 
        row.appendChild(cell);
        container.appendChild(row);
    });
}