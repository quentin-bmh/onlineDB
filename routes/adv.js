const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/advBoulogne', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT "ADV", "Latitude", "Longitude"  FROM adv ORDER BY "ADV";');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/general_data', async (req, res) => {
  const advName = req.query.adv;
  try {
    if (advName) {
      const result = await pool.query('SELECT * FROM general_data WHERE adv = $1 LIMIT 1', [advName]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'ADV non trouvé' });
      return res.json(result.rows[0]);
    } else {
      const result = await pool.query('SELECT * FROM general_data;');
      return res.json(result.rows);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});



router.get('/adv_types', async (req, res) => {
  try {
    const result = await pool.query('SELECT distinct type FROM general_data;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/adv_from/:type', async (req, res) => {
  const type = req.params.type;

  try {
    const result = await pool.query(
      'SELECT * FROM general_data WHERE type = $1',
      [type]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des ADV par type:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


module.exports = router;
