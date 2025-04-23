const express = require('express');
const client = require('../db'); // Assurez-vous que 'client' est correctement configuré pour ta base de données
const router = express.Router();

// Récupérer toutes les dates distinctes arrondies au jour
router.get('/api/b2v/dates', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT DISTINCT DATE(created_at) as date FROM b2v ORDER BY date DESC;
    `);
    res.json(result.rows); // Renvoie un tableau de dates
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les données B2V filtrées par date
router.get('/api/b2v', async (req, res) => {
  try {
    const { created_at } = req.query;
    let query = 'SELECT * FROM b2v';
    let params = [];
    
    // Si un filtre de date est passé, on l'ajoute à la requête
    if (created_at) {
      query += ` WHERE DATE(created_at) = $1`;
      params.push(created_at);
    }
    
    query += ' ORDER BY created_at DESC';
    
    // Exécution de la requête
    const result = await client.query(query, params);
    res.json(result.rows); // Renvoie les résultats filtrés
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
