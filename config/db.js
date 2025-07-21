// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONNECTIONSTRING,
  ssl: false, // ou { rejectUnauthorized: false } si tu es sur Heroku ou avec certificat SSL
});

// Connexion test + réglage fuseau horaire une fois
pool.connect()
  .then(async (client) => {
    console.log('✅ Connecté à PostgreSQL via Pool !');
    await client.query("SET TIME ZONE 'Europe/Paris'");
    console.log('🕓 Fuseau horaire PostgreSQL défini sur Europe/Paris');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Erreur lors de la connexion à PostgreSQL :', err);
  });

module.exports = pool;
