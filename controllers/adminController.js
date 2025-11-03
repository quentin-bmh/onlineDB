// controllers/adminController.js
const db = require('../config/db'); // Utiliser l'interface db.query

module.exports = {
    getUsersData: async (req, res) => {
        try {
            if (!db || !db.query) return res.status(503).json({ message: "Service de base de données indisponible" });

            // On utilise db.query
            const result = await db.query(
                `SELECT 
                    id, 
                    username, 
                    email, 
                    is_admin, 
                    TO_CHAR(last_login, 'YYYY-MM-DD HH24:MI:SS') AS last_login, 
                    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at 
                FROM "users" 
                ORDER BY last_login DESC`
            );

            res.status(200).json({ 
                message: "Données utilisateurs récupérées", 
                users: result.rows 
            });

        } catch (error) {
            console.error("❌ ERREUR getUsersData:", error.stack);
            res.status(500).json({ message: "Erreur serveur" });
        }
    },
    getPendingRequests: async (req, res) => {
        try {
            const result = await db.query(
                `SELECT id, username, email, request_date 
                 FROM pending_registrations 
                 ORDER BY request_date ASC`
            );
            res.status(200).json({ pendingRequests: result.rows });
        } catch (error) {
            console.error("Erreur récupération demandes en attente:", error.stack);
            res.status(500).json({ message: "Erreur serveur" });
        }
    },

    // 2. Valider une demande (POST/PUT)
    approveRegistration: async (req, res) => {
        const { requestId } = req.body;
        
        try {
            await db.query('BEGIN'); // Début de transaction pour assurer l'atomicité

            // A. Récupérer les données (y compris le password_hash)
            const requestResult = await db.query(
                `SELECT id, username, email, password_hash 
                 FROM pending_registrations 
                 WHERE id = $1 FOR UPDATE`, // Verrouillage de la ligne
                [requestId]
            );
            const requestData = requestResult.rows[0];

            if (!requestData) {
                await db.query('ROLLBACK');
                return res.status(404).json({ message: "Demande d'inscription non trouvée" });
            }

            // B. Créer l'utilisateur dans la table "users"
            const userInsert = await db.query(
                `INSERT INTO "users" (email, password_hash, username, is_admin) 
                 VALUES ($1, $2, $3, FALSE) 
                 RETURNING id, username`,
                [requestData.email, requestData.password_hash, requestData.username]
            );
            
            // C. Supprimer la demande de la table "pending_registrations"
            await db.query(
                `DELETE FROM pending_registrations WHERE id = $1`,
                [requestId]
            );

            await db.query('COMMIT'); // Validation de la transaction

            res.status(200).json({ 
                message: "Utilisateur créé et demande approuvée", 
                user: userInsert.rows[0] 
            });

        } catch (error) {
            await db.query('ROLLBACK'); // Annulation si une erreur survient
            console.error("Erreur d'approbation:", error.stack);
            res.status(500).json({ message: "Échec de l'approbation serveur" });
        }
    }
};