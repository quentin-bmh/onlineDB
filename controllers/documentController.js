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
exports.uploadPlan = async (req, res) => {
    if (!req.file || !req.body.advName) {
        return res.status(400).json({ error: "Fichier ou nom ADV manquant" });
    }

    try {
        const client = await getClient();
        
        // 1. Nom propre : On garde les espaces internes (ex: "BS 10a")
        const cleanAdvName = req.body.advName.trim(); 
        
        // 2. Lister le dossier pour trouver les doublons (même nom, extension différente)
        const directoryItems = await client.getDirectoryContents(targetDir);
        
        // On cherche tout fichier dont le nom (sans extension) est EXACTEMENT le nom de l'ADV
        const filesToDelete = directoryItems.filter(item => {
            if (item.type !== "file") return false;
            
            // Récupère "BS 10a" depuis "BS 10a.png" ou "BS 10a.pdf"
            const nameWithoutExt = path.parse(item.basename || item.filename).name;
            return nameWithoutExt === cleanAdvName;
        });

        // 3. Supprimer les anciens fichiers trouvés
        if (filesToDelete.length > 0) {
            console.log(`🗑️ Nettoyage pour ${cleanAdvName} : ${filesToDelete.length} fichier(s) supprimé(s).`);
            for (const file of filesToDelete) {
                await client.deleteFile(file.filename);
            }
        }

        // 4. Création du nouveau nom (Format: "BS 10a.png")
        const extension = path.extname(req.file.originalname);
        const newFilename = `${cleanAdvName}${extension}`;
        const targetPath = path.posix.join(targetDir, newFilename);

        // 5. Upload du nouveau fichier
        await client.putFileContents(targetPath, req.file.buffer, {
            overwrite: true
        });

        res.json({ success: true, path: targetPath });

    } catch (err) {
        console.error("❌ Erreur upload WebDAV:", err);
        res.status(500).json({ error: "Echec transfert WebDAV" });
    }
};