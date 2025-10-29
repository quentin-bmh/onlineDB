const createClient = require('node-webdav');
// const https = require('https'); // NE PLUS UTILISER CECI

// --- Configuration Nextcloud ---
const NEXTCLOUD_URL = `https://${process.env.API_NEXT_HOST}/remote.php/webdav/`;
const NEXTCLOUD_USER = process.env.API_NEXT_USER;
const NEXTCLOUD_KEY = process.env.API_NEXT_KEY;

// Client WebDAV configuré
const webdavClient = createClient(
    NEXTCLOUD_URL,
    NEXTCLOUD_USER,
    NEXTCLOUD_KEY
);

module.exports = webdavClient;