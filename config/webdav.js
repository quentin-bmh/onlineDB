// config/webdav.js
require("dotenv").config();
const path = require("path");

let client;
const targetDir = "/User-Uploads/uploads-public";

(async () => {
  const { createClient } = await import("webdav");
  client = createClient(process.env.API_NEXT_URL, {
    username: process.env.API_NEXT_USER,
    password: process.env.API_NEXT_KEY,
  });
})();

module.exports = { getClient: () => client, targetDir };
