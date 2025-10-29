const webdavClient = require('../config/webdav'); 
const db = require('../config/db'); 
const getUserRole = (user) => {
    if (!user || !user.id) {
        return 'GUEST'; 
    }
    if (user.is_admin === true) {
        return 'admin';
    }
    if (user.is_admin === false) {
        return 'technicien';
    }
    
    return 'GUEST'; 
};
const checkAuthorization = async (userRole, docId) => {
    try {
        const result = await db.query(
            `SELECT nom_stockage, chemin_nextcloud, role_requis 
             FROM documents 
             WHERE id = $1`, 
            [docId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const doc = result.rows[0];
        const isAuthorized = (userRole === 'admin') || (userRole === doc.role_requis); 

        if (isAuthorized) {
            return {
                filename: doc.nom_stockage,
                basePath: doc.chemin_nextcloud,
                isAuthorized: true
            };
        }
        return { isAuthorized: false }; 
        
    } catch (error) {
        console.error('Erreur BDD lors de l\'autorisation:', error.message); 
        return null;
    }
};
exports.listAvailableDocuments = async (req, res) => {
    const userRole = getUserRole(req.user); 
    if (userRole === 'GUEST') {
        return res.json([]); 
    }

    try {
        const result = await db.query(
            `SELECT id, nom_visible 
             FROM documents 
             WHERE 
                $1 = 'admin' 
                OR role_requis = $1`,
             [userRole] 
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur BDD lors de la liste:', error.message);
        res.status(500).send('Erreur lors de la récupération de la liste des documents.');
    }
};
exports.downloadDocument = async (req, res) => {
    const docId = req.params.docId;
    const userRole = getUserRole(req.user); 
    const documentData = await checkAuthorization(userRole, docId);

    if (!documentData || !documentData.isAuthorized) {
        return res.status(403).send('Accès non autorisé ou document non listé.');
    }

    const filename = documentData.filename;
    const remotePath = documentData.basePath + filename; 

    try {
        const fileContent = await webdavClient.getFileContents(remotePath); 
        res.setHeader('Content-Type', 'application/pdf'); 
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.send(fileContent);

    } catch (error) {
        console.error('Erreur WebDAV/Nextcloud DÉTAILLÉE:', error); 
        if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
             return res.status(404).send('Le fichier est introuvable sur le serveur de stockage.');
        }
        res.status(500).send('Erreur lors du téléchargement du fichier.');
    }
};