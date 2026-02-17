// config/webdav.js
require("dotenv").config();
const https = require("https"); // AJOUT : Import https

// AJOUT : Configuration de l'agent Keep-Alive pour éviter la latence handshake SSL
const agent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 10000,
    maxSockets: 50 // Augmente le parallélisme si nécessaire
});

let clientPromise = (async () => {
  const { createClient } = await import("webdav");
  return createClient(process.env.API_NEXT_URL, {
    username: process.env.API_NEXT_USER,
    password: process.env.API_NEXT_KEY,
    httpsAgent: agent, // AJOUT : Injection de l'agent optimisé
  });
})();

const targetDir = "/User-Uploads/uploads-public"; // Assure-toi que ce chemin est bon

module.exports = {
  getClient: async () => await clientPromise,
  targetDir,
};