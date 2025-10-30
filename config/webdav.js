// config/webdav.js
require("dotenv").config();

let clientPromise = (async () => {
  const { createClient } = await import("webdav");
  return createClient(process.env.API_NEXT_URL, {
    username: process.env.API_NEXT_USER,
    password: process.env.API_NEXT_KEY,
  });
})();

const targetDir = "/User-Uploads/uploads-public";

module.exports = {
  getClient: async () => await clientPromise,
  targetDir,
};
