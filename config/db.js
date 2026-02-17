// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const PRIMARY_STRING = process.env.CONNECTIONSTRING;

let activePoolPromise = null;

/**
 * @param {string} connectionString
 * @param {string} name
 * @returns {Promise<Pool|null>}
 */
async function createAndConnectPool(connectionString, name) {
    if (!connectionString) {
        console.error(`❌ FATAL: Chaîne de connexion pour ${name} manquante.`);
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
        return pool;
    } catch (err) {
        console.error(`❌ FATAL: Échec de la connexion à la BDD ${name}.`, err.message);
        pool.end();
        return null;
    }
}

/**
 * Initialise le Pool (Uniquement Primaire).
 * @returns {Promise<Pool>}
 */
async function initializePool() {
    const pool = await createAndConnectPool(PRIMARY_STRING, 'Primaire');
    
    if (pool) {
        // Ajout de la gestion d'erreur au Pool
        pool.on('error', (err) => {
            console.error('❌ FATAL: Erreur inattendue sur le Pool BDD.', err);
        });
        return pool;
    }
    
    // Si la connexion primaire échoue, on lève une erreur directement
    console.error('❌ FATAL: Base de données PostgreSQL primaire non disponible.');
    throw new Error('Database service unavailable.');
}

activePoolPromise = initializePool(); 

module.exports = {
    query: async (text, params) => {
        const pool = await activePoolPromise; 

        if (!pool) {
            // Cette erreur est théoriquement atteinte uniquement si initializePool a échoué 
            // et la Promesse a été rejetée/activePoolPromise n'est pas un Pool.
            throw new Error("Base de données non initialisée ou indisponible.");
        }
        return pool.query(text, params);
    },
    getClient: async () => {
        const pool = await activePoolPromise; 

        if (!pool) {
            throw new Error("Base de données non initialisée ou indisponible.");
        }
        // Le Pool a une méthode connect qui agit comme getClient
        return pool.connect(); 
    },    
    getPool: async () => {
        return await activePoolPromise;
    }
};