const db = require('../config/db');

exports.getUserPermissions = async (req, res) => {
    const { userId } = req.params;

    try {
        const userResult = await db.query('SELECT id, username, email, is_admin FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0)
            return res.status(404).json({ message: "Utilisateur introuvable" });

        const user = userResult.rows[0];

        const allPerms = await db.query('SELECT id, code, label FROM permissions');
        const userPerms = await db.query(
            'SELECT permission_id FROM user_permissions WHERE user_id = $1 AND granted = true',
            [userId]
        );

        const grantedIds = userPerms.rows.map(p => p.permission_id);
        const permissions = allPerms.rows.map(p => ({
            id: p.code,
            label: p.label,
            granted: user.is_admin ? true : grantedIds.includes(p.id)
        }));

        res.json({ user, permissions });

    } catch (err) {
        console.error("Erreur lors de la récupération des permissions:", err.stack);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

exports.updateUserPermissions = async (req, res) => {
    const { userId } = req.params;
    const { permissions } = req.body;

    try {
        const userCheck = await db.query('SELECT id, is_admin FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0)
            return res.status(404).json({ message: "Utilisateur introuvable" });

        const user = userCheck.rows[0];

        // On interdit de modifier un admin
        if (user.is_admin)
            return res.status(400).json({ message: "Impossible de modifier les permissions d’un administrateur." });

        // Supprime les anciennes permissions
        await db.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);

        // Réinsère les nouvelles
        for (const perm of permissions) {
            const permResult = await db.query('SELECT id FROM permissions WHERE code = $1', [perm.code]);
            if (permResult.rows.length > 0) {
                await db.query(
                    `INSERT INTO user_permissions (user_id, permission_id, granted)
                     VALUES ($1, $2, $3)`,
                    [userId, permResult.rows[0].id, perm.granted]
                );
            }
        }

        res.json({ message: "Permissions mises à jour avec succès." });

    } catch (err) {
        console.error("Erreur lors de la mise à jour des permissions:", err.stack);
        res.status(500).json({ message: "Erreur serveur." });
    }
};
