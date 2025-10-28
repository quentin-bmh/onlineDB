//middleware/adminMiddleware.js
const { getPool } = require('../config/db'); 

exports.getUsersData = async (req, res) => {
        try {
            const pool = await getPool();
            if (!pool) {
                console.error("[AdminController] Échec d'obtention du pool.");
                return res.status(503).json({ message: "Service de base de données indisponible" });
            }
            const result = await pool.query(
                `SELECT 
                    id, 
                    username, 
                    email, 
                    is_admin, 
                    -- Formater la date pour une meilleure lisibilité côté client
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
            if (error.code === '42P01') {
                 return res.status(500).json({ message: "Erreur BDD : La table users n'a pas été trouvée (42P01). Assurez-vous d'avoir exécuté les scripts CREATE TABLE et ALTER TABLE." });
            }
            res.status(500).json({ message: "Erreur serveur lors de la récupération des données" });
        }
};
exports.authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.isAdmin !== true) { 
        console.warn(`[Auth] Accès Administrateur refusé pour l'utilisateur ID: ${req.user ? req.user.userId : 'N/A'}`);
        return res.status(403).json({ message: "Accès refusé. Rôle Administrateur requis." });
    }
    next();
};
