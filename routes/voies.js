const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/voiesBoulogne', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT voie from voies2 order by voie');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get('/voiesBoulogne/ecart', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT voie, distance, e from voies2 order by voie, distance');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/voiesBoulogne/devers', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT voie, distance, "d" FROM voies2 ORDER BY voie, distance');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/voiesBoulogne/ga', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT voie, distance, g3 from voies2 order by voie, distance');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
