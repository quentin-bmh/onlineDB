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

// router.get('/api/dataAdv', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT Tangente, FROM adv ORDER BY "ADV";');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
