// config/webdav.js

const webdav = require('webdav'); 
const createClient = webdav.createClient; 
require('dotenv').config();

const NEXTCLOUD_URL = process.env.API_NEXT_URL; 
const NEXTCLOUD_USER = process.env.API_NEXT_USER; 
const NEXTCLOUD_TOKEN = process.env.API_NEXT_KEY;

if (!NEXTCLOUD_TOKEN || !NEXTCLOUD_URL || !NEXTCLOUD_USER) {
    console.error("❌ FATAL: Configuration Nextcloud WebDAV (URL, USER ou KEY) manquante dans .env.");
    // Retourner un objet mock pour éviter l'erreur de client non défini si l'app continue de se charger
    module.exports = { createReadStream: () => { throw new Error('WebDAV Client not initialized'); }, getFileContents: async () => { throw new Error('WebDAV Client not initialized'); } };
    return;
}

console.log(`[WebDAV CONFIG] URL: ${NEXTCLOUD_URL}`);
console.log(`[WebDAV CONFIG] User: ${NEXTCLOUD_USER}`);
console.log(`[WebDAV CONFIG] Key Prefix: ${NEXTCLOUD_TOKEN.substring(0, 8)}... (Longueur: ${NEXTCLOUD_TOKEN.length})`);

// 🚨 CORRECTION & DEBUG: Forcer Basic Auth et ignorer le rejet SSL
const client = createClient( 
    NEXTCLOUD_URL,
    NEXTCLOUD_USER,
    NEXTCLOUD_TOKEN,
    {
        // Forcer le rejet à false pour ignorer les certificats (le 401 pourrait masquer un problème SSL)
        rejectUnauthorized: false,
        // S'assurer que le digest n'est pas utilisé (Nextcloud utilise Basic pour les jetons)
        digest: false, 
    }
);

console.log("[WebDAV CONFIG] Client créé avec rejectUnauthorized: false.");

module.exports = client;