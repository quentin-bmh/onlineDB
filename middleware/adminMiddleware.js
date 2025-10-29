// middleware/adminMiddleware.js
const db = require('../config/db');

exports.getUsersData = async (req, res) => {
        try {
            if (!db || !db.query) {
                return res.status(503).json({ message: "Service de base de données indisponible" });
            }
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
                message: "Données utilisateurs récupérées avec succès", 
                users: result.rows 
            });

        } catch (error) {
            console.error("❌ ERREUR getUsersData:", error.message);
            res.status(500).json({ message: "Erreur serveur lors de la récupération des données" });
        }
};

exports.authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.is_admin !== true) { 
        console.warn(`[Auth] Accès Administrateur refusé pour l'utilisateur ID: ${req.user ? req.user.id : 'N/A'}`);
        return res.status(403).json({ message: "Accès refusé. Rôle Administrateur requis." });
    }
    next();
};