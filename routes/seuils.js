const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Définition de JSON_KEYS (Réplique de la définition frontend)
const JSON_KEYS = {
    'bon': 'plages_bon',
    'correct': 'plages_correct',
    'acoriger': 'plages_acoriger',
    'aremplacer': 'plages_aremplacer'
};

router.get('/seuils/etendus', async (req, res) => {
    try {
        const query = `
            SELECT label_seuil, categorie, 
                   valeur_bon,
                   valeur_correct,
                   valeur_acoriger, 
                   valeur_aremplacer,
                   bloque_bon, bloque_correct, bloque_acoriger, bloque_aremplacer,
                   plages_json
            FROM seuils_plages
            ORDER BY label_seuil, categorie;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lecture seuils etendus:', err.message);
        res.status(500).json({ message: "Erreur serveur lors de la lecture des seuils." });
    }
});

router.post('/seuils/update-etendu', async (req, res) => {
    const changes = req.body;
    if (!Array.isArray(changes) || changes.length === 0) {
        return res.status(400).json({ message: "Données de mise à jour manquantes ou invalides." });
    }

    let client;
    try {
        client = await pool.getClient(); 
        await client.query('BEGIN');
        
        for (const change of changes) {
            const { label_seuil, categorie, etat, type, valeur_seuil } = change;
            const bloqueColumn = `bloque_${etat}`;
            let updateValue;
            let targetColumn;
            let valueType;

            if (type === 'json') {
                targetColumn = 'plages_json';
                valueType = 'JSONB';
                
                // Correction: JSON_KEYS est maintenant défini
                updateValue = JSON.stringify({ [JSON_KEYS[etat]]: valeur_seuil });
                
                const query = `
                    UPDATE seuils_plages
                    SET plages_json = COALESCE(plages_json, '{}'::JSONB) || $1::JSONB
                    WHERE TRIM(label_seuil) = TRIM($2)
                      AND categorie = $3
                      AND ${bloqueColumn} = FALSE;
                `;
                const values = [updateValue, label_seuil, categorie];
                await client.query(query, values);
            } else {
                targetColumn = `valeur_${etat}`;
                valueType = 'INTEGER';
                updateValue = valeur_seuil;

                const query = `
                    UPDATE seuils_plages
                    SET ${targetColumn} = $1
                    WHERE TRIM(label_seuil) = TRIM($2)
                      AND categorie = $3
                      AND ${bloqueColumn} = FALSE; 
                `;
                const values = [updateValue, label_seuil, categorie];
                await client.query(query, values);
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: `${changes.length} seuils mis à jour.` });

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error("Erreur de transaction SQL étendue:", error.message);
        // Retourner l'erreur interne pour faciliter le débogage côté client (via le catch du fetch)
        res.status(500).json({ message: "Échec de la mise à jour des seuils.", error: error.message });
        
    } finally {
        if (client) {
            client.release();
        }
    }
});

router.get('/seuils/voies', async (req, res) =>{
    try{
        const query = `
            SELECT label_seuil, plages_json
            FROM seuils_voies
            ORDER BY label_seuil;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    }catch (err){
        console.error('Erreur lecture seuils etendus:', err.message);
        res.status(500).json({ message: "Erreur serveur lors de la lecture des seuils." });
    }
});
router.post('/seuil/voies/update', async (req, res) => {
    const changes = req.body;
    if (!Array.isArray(changes) || changes.length === 0) {
        return res.status(400).json({ message: "Données manquantes." });
    }

    let client;
    try {
        client = await pool.getClient();
        await client.query('BEGIN');

        for (const change of changes) {
            const { label_seuil, etat, valeur_seuil } = change;
            const jsonKey = JSON_KEYS[etat];
            const updateValue = JSON.stringify({ [jsonKey]: valeur_seuil });

            const query = `
                UPDATE seuils_voies
                SET plages_json = COALESCE(plages_json, '{}'::JSONB) || $1::JSONB
                WHERE TRIM(label_seuil) = TRIM($2);
            `;
            await client.query(query, [updateValue, label_seuil]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: "Seuils Voies mis à jour." });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        res.status(500).json({ message: "Erreur SQL", error: error.message });
    } finally {
        if (client) client.release();
    }
});
module.exports = router;