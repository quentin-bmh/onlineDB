// controllers/adminController.js
const { getPool } = require('../config/db'); 

module.exports = {
    getUsersData: async (req, res) => {
        try {
            const pool = await getPool();
            if (!pool) return res.status(503).json({ message: "Service de base de données indisponible" });

            const result = await pool.query(
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
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
};