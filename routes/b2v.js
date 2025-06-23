const express = require('express');
const client = require('../db');
const router = express.Router();

router.get('/api/b2v/dates', async (req, res) => {
  console.log('🔍 GET /api/b2v/dates - Début');
  try {
    const result = await client.query(`
      SELECT DISTINCT DATE(created_at) as date FROM b2v ORDER BY date DESC;
    `);
    console.log('✅ Dates distinctes récupérées:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Erreur dans /api/b2v/dates:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/b2v', async (req, res) => {
  console.log('🔍 GET /api/b2v - Début');
  try {
    const { adv } = req.query;
    console.log('🟢 Filtre ADV:', adv);
    let query = 'SELECT * FROM b2v';
    let params = [];

    if (adv) {
      query += ' WHERE adv = $1';
      params.push(adv);
    }
    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, params);
    console.log(`✅ ${result.rows.length} enregistrements récupérés`);
    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Erreur dans /api/b2v:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/b2v/advs', async (req, res) => {
  console.log('🔍 GET /api/b2v/advs - Début');
  try {
    const result = await client.query('SELECT DISTINCT adv FROM b2v ORDER BY adv');
    console.log('✅ Liste ADV récupérée:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Erreur dans /api/b2v/advs:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/b2v/:id', async (req, res) => {
  console.log('\n--- 🔄 Début de mise à jour ADV ---');
  const { id } = req.params;
  console.log('🆔 ID:', id);
  const updatedData = req.body;
  console.log('📨 Données reçues dans req.body:', updatedData);
  const userId = 1;

  if (!id || isNaN(Number(id))) {
    console.warn('⚠️ ID invalide fourni:', id);
    return res.status(400).json({ error: "ID invalide" });
  }

  try {
    const { rows } = await client.query('SELECT * FROM b2v WHERE id = $1', [id]);
    if (rows.length === 0) {
      console.warn('⚠️ ADV non trouvé avec ID:', id);
      return res.status(404).json({ error: "ADV non trouvé" });
    }
    const current = rows[0];
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

    console.log('💾 Insertion dans b2v_historique');
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

router.get('/api/b2v_historique/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`🔍 GET /api/b2v_historique/${id} - Début`);
  if (isNaN(id)) {
    console.warn('⚠️ ID invalide:', req.params.id);
    return res.status(400).json({ error: "ID invalide" });
  }

  try {
    const result = await client.query('SELECT * FROM b2v_historique WHERE b2v_id = $1', [id]);
    if (result.rows.length === 0) {
      console.warn('⚠️ Historique non trouvé pour ID:', id);
      return res.status(404).json({ error: "Historique non trouvé" });
    }
    console.log('✅ Historique récupéré');
    res.json(result.rows);
  } catch (err) {
    console.error("🔥 Erreur pendant la récupération de l'historique ADV:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get('/api/b2v_historique/:id/dates', async (req, res) => {
  const { id } = req.params;
  console.log(`🔍 GET /api/b2v_historique/${id}/dates - Début`);

  if (!id || isNaN(Number(id))) {
    console.warn('⚠️ ID invalide:', id);
    return res.status(400).json({ error: "ID invalide" });
  }

  try {
    const result = await client.query(`
      SELECT snapshot_date 
      FROM b2v_historique 
      WHERE b2v_id = $1 
      GROUP BY snapshot_date 
      ORDER BY snapshot_date DESC
    `, [id]);
    console.log(`✅ Dates d'historique récupérées: ${result.rows.length}`);
    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Erreur pendant la récupération de l\'historique ADV:', err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get('/api/b2v_historique/:id/date/:snapshot_date', async (req, res) => {
  const { id, snapshot_date } = req.params;
  console.log(`📥 GET /api/b2v_historique/${id}/date/${snapshot_date} - Appel reçu`);

  // Vérification de l'id
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    console.warn('⚠️ ID invalide:', id);
    return res.status(400).json({ error: "ID invalide" });
  }

  // Vérification de la date
  const parsedDate = new Date(snapshot_date);
  if (isNaN(parsedDate.getTime())) {
    console.warn('⚠️ Date invalide:', snapshot_date);
    return res.status(400).json({ error: "Format de date invalide" });
  }

  try {
    const result = await client.query(`
      SELECT * FROM b2v_historique
      WHERE b2v_id = $1 AND snapshot_date <= $2::timestamptz
      ORDER BY snapshot_date DESC
      LIMIT 1
    `, [parsedId, parsedDate.toISOString()]);

    if (result.rows.length === 0) {
      console.warn(`❌ Aucune snapshot trouvée pour b2v_id=${parsedId} avant ${parsedDate.toISOString()}`);
      return res.status(404).json({ error: "Aucune version historique trouvée." });
    }

    console.log(`✅ Snapshot trouvée pour b2v_id=${parsedId} :`, result.rows[0]);
    return res.json(result.rows[0]); // On retourne bien un seul objet
  } catch (err) {
    console.error("🔥 Erreur lors de la récupération de la snapshot:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});


module.exports = router;
