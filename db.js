const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.CONNECTIONSTRING,
  ssl: false,
});

client.connect()
  .then(async () => {
    console.log('Connecté à la base de données PostgreSQL !');
    await client.query("SET TIME ZONE 'Europe/Paris'");
    console.log("🕓 Fuseau horaire PostgreSQL défini sur UTC");
  })
  .catch(err => console.error('Erreur de connexion', err));

module.exports = client;
