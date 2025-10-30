const { client, targetDir } = require("../config/webdav");
const path = require("path");
const mime = require("mime-types");

// Liste les fichiers dans le dossier Nextcloud
exports.listDocuments = async (req, res) => {
  try {
    const contents = await client.getDirectoryContents(targetDir);

    // console.log("DEBUG: raw contents de WebDAV", contents);

    const files = contents
      .filter((item) => item.type === "file")
      .map((item) => {
        // console log pour chaque fichier
        // console.log("DEBUG: fichier trouvé", item);

        // renvoyer un nom de fichier sûr
        const name = item.basename || path.basename(item.filename) || "unknown";
        const filePath = item.filename || path.posix.join(targetDir, name);
        return { name, path: filePath };
      });

    // console.log("DEBUG: fichiers filtrés", files);

    res.json(files);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des fichiers:", err.message, err.stack);
    res.status(500).json({ error: "Erreur serveur WebDAV" });
  }
};

// Ouvre un fichier dans le navigateur (inline)
exports.openDocument = async (req, res) => {
  const filePath = req.params.filename;
  if (!filePath) {
    console.error("❌ openDocument: paramètre filename manquant");
    return res.status(400).send("Fichier manquant");
  }

//   console.log("DEBUG: ouverture fichier", filePath);

  try {
    const fileContent = await client.getFileContents(filePath, { format: "binary" });
    const filename = path.basename(filePath);
    const encodedFilename = encodeURIComponent(filename);
    const contentType = mime.lookup(filename) || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", fileContent.length);
    res.setHeader("Content-Disposition",`inline; filename="${filename}"; filename*=UTF-8''${encodedFilename}`
);
    res.send(fileContent);

    // console.log("DEBUG: fichier envoyé correctement", filename);

  } catch (err) {
    console.error(`❌ Erreur WebDAV pour ${filePath}:`, err.message);
    if (err.message.includes("401")) return res.status(500).send("Erreur d'authentification WebDAV");
    if (err.message.includes("404")) return res.status(404).send("Fichier introuvable sur Nextcloud");
    res.status(500).send("Erreur serveur interne");
  }
};
