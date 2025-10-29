// controllers/documentController.js

const webdavClient = require('../config/webdav');
const db = require('../config/db'); // Utilisation de l'interface db.query
const path = require('path');

module.exports = {
    /**
     * Liste les documents autorisés selon le rôle de l'utilisateur.
     * Accessible via GET /api/webdav/list
     */
    listDocuments: async (req, res) => {
        try {
            // Utilisation directe de l'interface db.query
            if (!db || !db.query) return res.status(503).json({ message: "Service de base de données indisponible" });

            // On suppose que req.user a été rempli par AuthMiddleware
            const userRole = req.user && req.user.is_admin === true ? 'admin' : 'technicien';

            // 🚨 CORRECTION SQL: Utilisation de role_requis et non de is_admin_only
            const query = `
                SELECT id, nom_visible 
                FROM documents 
                WHERE 
                    $1 = 'admin' OR role_requis = $1
                ORDER BY nom_visible
            `;

            // Utilisation de db.query
            const result = await db.query(query, [userRole]);

            res.status(200).json(result.rows);

        } catch (error) {
            console.error("❌ Erreur listDocuments:", error.stack);
            res.status(500).json({ message: "Erreur serveur lors de la récupération de la liste des documents." });
        }
    },
    downloadDocument: async (req, res) => {
        const docId = req.params.id;

        try {
            if (!db || !db.query) return res.status(503).json({ message: "Service de base de données indisponible" });
            
            // 1. VÉRIFICATION BDD
            const result = await db.query(
                `SELECT chemin_nextcloud, nom_stockage, nom_visible, role_requis
                FROM documents 
                WHERE id = $1`, 
                [docId]
            );

            const doc = result.rows[0];

            if (!doc) {
                return res.status(404).json({ message: "Document non trouvé dans la base de données." });
            }
            
            // 2. VÉRIFICATION AUTORISATION
            const userRole = req.user && req.user.is_admin === true ? 'admin' : 'technicien';
            const isAuthorized = userRole === 'admin' || doc.role_requis === userRole;
            
            if (!isAuthorized) {
                return res.status(403).json({ message: "Accès refusé. Document non autorisé pour votre rôle." });
            }

            // 3. CONSTRUCTION DU CHEMIN WEBDAV
            // 🚨 CORRECTION CRITIQUE : Utiliser path.posix.join ou forcer les barres obliques (/)
            // path.posix.join garantit que le séparateur est toujours '/'
            // La première barre oblique (/) est cruciale pour le chemin absolu WebDAV
            const fullWebdavPath = path.posix.join(doc.chemin_nextcloud, doc.nom_stockage); 
            
            // Nettoyer les barres obliques multiples si chemin_nextcloud finissait déjà par un '/'
            const cleanWebdavPath = fullWebdavPath.replace(/\\/g, '/').replace(/\/+/g, '/');

            const extension = path.extname(doc.nom_stockage).toLowerCase();
            let contentType = 'application/octet-stream';
            
            // ... (Détermination du Content-Type) ...
            if (extension === '.pdf') {
                contentType = 'application/pdf';
            } else if (['.png', '.jpg', '.jpeg'].includes(extension)) {
                contentType = `image/${extension.slice(1)}`;
            } 

            // 4. PRÉPARATION DES HEADERS
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `inline; filename="${doc.nom_visible}${extension}"`); 
            
            console.log(`[DOWNLOAD DEBUG] Attempting to access file: ${cleanWebdavPath}`);
            console.log(`[DOWNLOAD DEBUG] User Role: ${userRole}, Authorized: ${isAuthorized}`);


            // 5. STREAMING DU FICHIER
            const fileStream = webdavClient.createReadStream(cleanWebdavPath);

            // Gérer les erreurs de streaming et d'authentification (401/404)
            fileStream.on('error', (err) => {
                console.error(`❌ Erreur WebDAV/Nextcloud pour ${cleanWebdavPath}:`, err.message);
                
                // Si une erreur survient et qu'aucune donnée n'a encore été envoyée
                if (!res.headersSent) { 
                    if (err.message && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
                        // C'est le 401: le jeton n'est pas reconnu
                        return res.status(401).json({ message: "Échec de l'authentification WebDAV. Vérifiez le jeton API." });
                    }
                    if (err.message && err.message.includes('404')) {
                        return res.status(404).json({ message: "Le fichier est introuvable sur le cloud Nextcloud." });
                    }
                    return res.status(500).json({ message: "Erreur lors de la récupération du fichier depuis le cloud." });
                }
                res.end(); // Terminer la connexion si des headers ont déjà été envoyés
            });
            
            // Pipe le flux du fichier vers la réponse HTTP
            fileStream.pipe(res);

        } catch (error) {
            console.error("❌ Erreur downloadDocument (Catch Général):", error.stack);
            // Si le problème est dans la BDD ou le setup initial
            res.status(500).json({ message: "Erreur serveur interne lors du téléchargement." });
        }
    }
};