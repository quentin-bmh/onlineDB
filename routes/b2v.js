const express = require('express');
const client = require('../db');
const router = express.Router();

// Récupérer toutes les dates distinctes arrondies au jour
router.get('/api/b2v/dates', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT DISTINCT DATE(created_at) as date FROM b2v ORDER BY date DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les données B2V, avec filtre optionnel par adv
router.get('/api/b2v', async (req, res) => {
  try {
    const { adv } = req.query;
    let query = 'SELECT * FROM b2v';
    let params = [];

    if (adv) {
      query += ' WHERE adv = $1';
      params.push(adv);
    }

    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer la liste distincte des adv
router.get('/api/b2v/advs', async (req, res) => {
  try {
    const result = await client.query('SELECT DISTINCT adv FROM b2v ORDER BY adv');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour un enregistrement b2v et archiver l'état avant modification
router.put('/api/b2v/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const userId = 1; // À récupérer dynamiquement en fonction de l'authentification

  try {
    // Récupérer l'enregistrement actuel
    const { rows } = await client.query('SELECT * FROM b2v WHERE id = $1', [id]);
    const current = rows[0];
    if (!current) return res.status(404).json({ error: "ADV non trouvé" });

    // Préparer les colonnes et valeurs à insérer dans b2v_historique (sans 'id')
    const keys = Object.keys(current).filter(k => k !== 'id');
    if (keys.length === 0) {
      return res.status(400).json({ error: "Données actuelles invalides" });
    }

    // Récupérer les valeurs correspondantes (dans le même ordre que keys)
    const values = keys.map(k => current[k]);

    // Insérer dans b2v_historique
    await client.query(`
      INSERT INTO b2v_historique (
        ${keys.join(', ')},
        snapshot_date, user_id, b2v_id, operation
      ) VALUES (
        ${keys.map((_, i) => `$${i + 1}`).join(', ')},
        NOW(), $${keys.length + 1}, $${keys.length + 2}, 'UPDATE'
      )
    `, [...values, userId, current.id]);

    // Mettre à jour l'enregistrement actuel uniquement si updatedData n'est pas vide
    const fields = Object.keys(updatedData);
    if (fields.length === 0) {
      return res.status(400).json({ error: "Aucune donnée fournie pour la mise à jour" });
    }
    const vals = Object.values(updatedData);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    await client.query(
      `UPDATE b2v SET ${setClause} WHERE id = $${fields.length + 1}`,
      [...vals, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// Récupérer l'historique des modifications d'un b2v
router.get('/api/b2v/:id/historique', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await client.query(`
      SELECT * FROM b2v_historique
      WHERE b2v_id = $1
      ORDER BY snapshot_date DESC
    `, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération historique" });
  }
});

module.exports = router;
