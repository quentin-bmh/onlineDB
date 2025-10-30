// controllers/documentController.js


const { getClient, targetDir } = require("../config/webdav");
const path = require("path");
const mime = require("mime-types");

exports.listDocuments = async (req, res) => {
  try {
    const client = await getClient(); // <-- toujours await ici
    const contents = await client.getDirectoryContents(targetDir);
    const files = contents
      .filter((item) => item.type === "file")
      .map((item) => {
        const name = item.basename || path.basename(item.filename) || "unknown";
        const filePath = item.filename || path.posix.join(targetDir, name);
        return { name, path: filePath };
      });
    res.json(files);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des fichiers:", err);
    res.status(500).json({ error: "Erreur serveur WebDAV" });
  }
};

exports.openDocument = async (req, res) => {
  const client = await getClient(); // <-- await ici aussi
  const filePath = req.params.filename;
  if (!filePath) return res.status(400).send("Fichier manquant");

  try {
    const fileContent = await client.getFileContents(filePath, { format: "binary" });
    const filename = path.basename(filePath);
    const encodedFilename = encodeURIComponent(filename);
    const contentType = mime.lookup(filename) || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", fileContent.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${filename}"; filename*=UTF-8''${encodedFilename}`
    );
    res.send(fileContent);
  } catch (err) {
    console.error(`❌ Erreur WebDAV pour ${filePath}:`, err.message);
    if (err.message.includes("401")) return res.status(500).send("Erreur d'authentification WebDAV");
    if (err.message.includes("404")) return res.status(404).send("Fichier introuvable sur Nextcloud");
    res.status(500).send("Erreur serveur interne");
  }
};
