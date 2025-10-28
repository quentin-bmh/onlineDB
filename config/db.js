// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const PRIMARY_STRING = process.env.CONNECTIONSTRING;
const SECONDARY_STRING = process.env.CONNECTIONSTRING2;

let activePoolPromise = null;

/**
  @param {string} connectionString
  @param {string} name
  @returns {Promise<Pool|null>}
*/
async function createAndConnectPool(connectionString, name) {
    if (!connectionString) {
        console.warn(`[DB] Chaîne de connexion pour ${name} manquante.`);
        return null;
    }

    const pool = new Pool({
        connectionString: connectionString,
        ssl: false,
        connectionTimeoutMillis: 5000,
        max: 5,
    });

    try {
        const client = await pool.connect();
        await client.query("SET TIME ZONE 'Europe/Paris'");
        client.release();
        console.log(`✅ Connecté à PostgreSQL via Pool sur : ${name} !`);
        console.log('🕓 Fuseau horaire PostgreSQL défini sur Europe/Paris');
        return pool;
    } catch (err) {
        console.warn(`❌ Échec de la connexion à la BDD ${name}. Tentative de bascule...`);
        pool.end();
        return null;
    }
}

/**
  @returns {Promise<Pool>}
*/
async function initializePool() {
    let pool = await createAndConnectPool(PRIMARY_STRING, 'Primaire (Limoges)');
    
    if (pool) {
        return pool;
    }
    pool = await createAndConnectPool(SECONDARY_STRING, 'Secours (Bureau)');

    if (pool) {
        return pool;
    }
    console.error('❌ FATAL: Aucune base de données PostgreSQL disponible.');
    throw new Error('Database service unavailable.');
}
activePoolPromise = initializePool();
module.exports = {
    getPool: async () => {
        return await activePoolPromise;
    }
};