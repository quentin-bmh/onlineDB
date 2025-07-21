const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/voiesBoulogne', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT voie from voies order by voie');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/voiesBoulogne/ecart', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT voie, distance, ecarts_1435 from voies order by voie, distance');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/voiesBoulogne/fleche', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT voie, distance, fleches from voies order by voie, distance');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/voiesBoulogne/ga', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT voie, distance, ga_arrondi from voies order by voie, distance');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
