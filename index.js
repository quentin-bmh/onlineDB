const express = require('express');
require('dotenv').config();

const { Client } = require('pg');

const app = express();
const port = 3000;


const client = new Client({
  connectionString: process.env.CONNECTIONSTRING,
  ssl: false,               
});
//ou cette methode:
// const client = new Client({
//   host: process.env.HOSTBDD,
//   port: process.env.PORTBDD,                     
//   user: process.env.USERBDD,                  
//   password: process.env.PASSBDD,         
//   database: process.env.DATABASE
// });


client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL !'))
  .catch(err => console.error('Erreur de connexion', err));

// Route principale
app.get('/', async (req, res) => {
  try {
    const result = await client.query('select distinct "ADV", "Latitude","Longitude" from adv ;');
    res.send(`
      <h1>Données de la table ADV</h1>
      <pre>${JSON.stringify(result.rows, null, 2)}</pre>
    `);
  } catch (err) {
    res.status(500).send('Erreur lors de la requête SQL : ' + err.message);
  }
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur Express en ligne : http://localhost:${port}`);
});
