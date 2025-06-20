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
  const userId = 1;

  try {
    console.log('\n--- 🔄 Début de mise à jour ADV ---');
    console.log('🆔 ID:', id);
    console.log('📨 Données reçues dans req.body:', updatedData);

    const { rows } = await client.query('SELECT * FROM b2v WHERE id = $1', [id]);
    const current = rows[0];
    if (!current) return res.status(404).json({ error: "ADV non trouvé" });

    console.log('📦 Données actuelles de la BDD (b2v):', current);

    const changedFields = {};

    for (const [key, newValue] of Object.entries(updatedData)) {
      const oldValue = current[key];
      if (oldValue === undefined) {
        console.warn(`⚠️ Champ "${key}" n'existe pas dans l'enregistrement actuel`);
        continue;
      }

      console.log(`🔍 Comparaison pour le champ "${key}":`);
      console.log(`   Ancienne valeur (BDD):`, oldValue, `(type: ${typeof oldValue})`);
      console.log(`   Nouvelle valeur (BODY):`, newValue, `(type: ${typeof newValue})`);

      const isDifferent = (() => {
        if (oldValue === null || oldValue === undefined) return newValue !== null && newValue !== undefined && newValue !== '';
        if (typeof oldValue === 'number') return Number(newValue) !== oldValue;
        if (typeof oldValue === 'boolean') return (newValue === 'true' || newValue === true || newValue === 1 || newValue === '1') !== oldValue;
        return oldValue != newValue; // comparaison non stricte pour strings
      })();

      if (isDifferent) {
        changedFields[key] = {
          oldValue,
          newValue
        };
      } else {
        console.log(`   ✅ Pas de différence détectée`);
      }
    }

    if (Object.keys(changedFields).length === 0) {
      console.log("❌ Aucune modification détectée.");
      return res.status(400).json({ error: "Aucune modification détectée" });
    }

    console.log("✅ Champs détectés comme modifiés:");
    for (const [field, { oldValue, newValue }] of Object.entries(changedFields)) {
      console.log(`- ${field}: "${oldValue}" => "${newValue}"`);
    }

    // Historiser
    const keys = Object.keys(current).filter(k => k !== 'id');
    const values = keys.map(k => current[k]);

    await client.query(`
      INSERT INTO b2v_historique (
        ${keys.join(', ')},
        snapshot_date, user_id, b2v_id, operation
      ) VALUES (
        ${keys.map((_, i) => `$${i + 1}`).join(', ')},
        NOW(), $${keys.length + 1}, $${keys.length + 2}, 'UPDATE'
      )
    `, [...values, userId, current.id]);

    // Mise à jour
    const fields = Object.keys(changedFields);
    const vals = fields.map(f => updatedData[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const result = await client.query(
      `UPDATE b2v SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...vals, id]
    );

    console.log('✅ Mise à jour effectuée avec succès.');
    res.json({ success: true, updated: result.rows[0] });

  } catch (err) {
    console.error('🔥 Erreur pendant la mise à jour ADV:', err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



module.exports = router;
