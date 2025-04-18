const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.CONNECTIONSTRING,
  ssl: false,
});

client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL !'))
  .catch(err => console.error('Erreur de connexion', err));

module.exports = client;
