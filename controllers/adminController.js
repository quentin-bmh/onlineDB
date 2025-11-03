// controllers/adminController.js
const db = require('../config/db'); 
const bcrypt = require('bcrypt');
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
    },
    createUser: async (req, res) => {
        try {
            const { username, email, password, is_admin } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ message: "Les champs nom d'utilisateur, email et mot de passe sont requis." });
            }

            // 1. Vérification de l'existence (actif ou en attente)
            const checkExisting = await db.query(
                'SELECT id FROM "users" WHERE email = $1 UNION ALL SELECT id FROM "pending_registrations" WHERE email = $1', 
                [email]
            );
            if (checkExisting.rows.length > 0) {
                return res.status(409).json({ message: "Un utilisateur ou une demande d'inscription existe déjà avec cet email." });
            }

            // 2. Hachage du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // 3. Insertion dans la table des utilisateurs actifs
            const is_admin_bool = is_admin === true; // S'assurer que c'est bien un booléen
            
            const result = await db.query(
                `INSERT INTO "users" (username, email, password_hash, is_admin, created_at) 
                VALUES ($1, $2, $3, $4, NOW()) 
                RETURNING id, username, email, is_admin`,
                [username, email, hashedPassword, is_admin_bool]
            );

            res.status(201).json({ 
                message: "Utilisateur créé avec succès", 
                user: result.rows[0] 
            });

        } catch (error) {
            console.error("❌ ERREUR Création utilisateur par Admin:", error.stack);
            res.status(500).json({ message: "Erreur serveur lors de la création de l'utilisateur." });
        }
    },
    deleteUser: async (req, res) => {
        try {
            // ID de l'utilisateur à supprimer reçu dans le corps de la requête DELETE
            const { userId } = req.body; 
            
            if (!userId) {
                return res.status(400).json({ message: "L'ID utilisateur est requis pour la suppression." });
            }
            
            // Sécurité: Empêcher l'administrateur connecté de se supprimer lui-même
            if (parseInt(userId, 10) === req.user.id) {
                return res.status(403).json({ message: "Interdit: Vous ne pouvez pas supprimer votre propre compte administrateur." });
            }

            // Exécution de la requête DELETE
            const result = await db.query(
                'DELETE FROM "users" WHERE id = $1 RETURNING id, username',
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Utilisateur non trouvé ou déjà supprimé." });
            }

            res.status(200).json({ 
                message: `Utilisateur '${result.rows[0].username}' (ID: ${result.rows[0].id}) supprimé avec succès.`,
                deletedUserId: result.rows[0].id 
            });

        } catch (error) {
            console.error("❌ ERREUR Suppression utilisateur par Admin:", error.stack);
            res.status(500).json({ message: "Erreur serveur lors de la suppression de l'utilisateur." });
        }
    }
        

};