// config/webdav.js
const { createClient } = require("webdav");

const client = createClient(process.env.API_NEXT_URL, {
  username: process.env.API_NEXT_USER,
  password: process.env.API_NEXT_KEY,
});

const targetDir = "/User-Uploads/uploads-public";

module.exports = { client, targetDir };
