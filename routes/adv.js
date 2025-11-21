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

router.get('/adv_coordinates', async (req, res) => {
  try {
    const result = await pool.query('SELECT "adv","type", "lat", "long" FROM general_data;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/adv_coordinates/:type', async (req, res) => {
  const type = req.params.type;
  try {
    const result = await pool.query('SELECT "adv", "lat", "long" FROM general_data WHERE type = $1;', [type]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

router.get('/bs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM adv_bs;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/to', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM adv_to;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/tj', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM adv_tj;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/bs/:name', async (req, res) => {
  const advName = req.params.name;
  try {
    const result = await pool.query('SELECT * FROM adv_bs where adv = $1', [advName]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/to/:name', async (req, res) => {
  const advName = req.params.name;
  try {
    const result = await pool.query('SELECT * FROM adv_to where adv = $1', [advName]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/tj/:name', async (req, res) => {
  const advName = req.params.name;
  try {
    const result = await pool.query('SELECT * FROM adv_tj where adv = $1', [advName]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/da', async (req, res) => {
  const { adv, adv_type } = req.query;

  if (!adv) {
    return res.status(400).json({ error: 'Missing "adv" query parameter' });
  }

  let query = 'SELECT * FROM b2v_da WHERE adv = $1';
  const params = [adv];

  if (adv_type) {
    params.push(adv_type);
    query += ` AND adv_type = $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/general_data', async (req, res) => {
  const data = req.body;
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const updateFields = fields.map(field => `${field} = EXCLUDED.${field}`).join(', ');
  
  const query = `
    INSERT INTO general_data (${fields.join(', ')}) 
    VALUES (${placeholders}) 
    ON CONFLICT (adv) 
    DO UPDATE SET ${updateFields} 
    RETURNING *;
  `;
  
  try {
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'General data processed', data: result.rows[0] });
  } catch (err) {
    console.error('Erreur insertion general_data:', err.message);
    res.status(500).json({ error: `Erreur serveur lors de l'insertion dans general_data: ${err.message}` });
  }
});

router.post('/adv_:type', async (req, res) => {
  const { type } = req.params; // 'bs', 'tj', ou 'to'
  const tableName = `adv_${type}`;
  const data = req.body;
  
  if (type !== 'bs' && type !== 'tj' && type !== 'to') {
    return res.status(400).json({ error: 'Type ADV non supporté pour l\'insertion.' });
  }

  const fields = Object.keys(data).join(', ');
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  
  // Utilisation de l'ADV comme clé de conflit pour l'UPSERT
  const query = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders}) ON CONFLICT (adv) DO UPDATE SET ${fields.split(', ').map((field, i) => `${field} = $${i + 1}`).join(', ')} RETURNING *;`;

  try {
    const result = await pool.query(query, values);
    res.status(201).json({ message: `${tableName} data processed`, data: result.rows[0] });
  } catch (err) {
    console.error(`Erreur insertion ${tableName}:`, err.message);
    res.status(500).json({ error: `Erreur serveur lors de l'insertion dans ${tableName}: ${err.message}` });
  }
});

router.post('/b2v_da', async (req, res) => {
  const dataArray = req.body;
  
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return res.status(400).json({ error: 'Le corps de la requête doit être un tableau d\'objets non vide.' });
  }
  
  const advName = dataArray[0].adv;
  let client = null; 
  
  try {
    client = await pool.getClient(); 
    
    await client.query('BEGIN');
    await client.query('DELETE FROM b2v_da WHERE adv = $1', [advName]);
    for (const data of dataArray) {
        const insertFields = Object.keys(data).filter(key => data[key] !== null);
        const insertValues = insertFields.map(key => data[key]);
        const insertPlaceholders = insertValues.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO b2v_da (${insertFields.join(', ')}) VALUES (${insertPlaceholders});`;
        
        await client.query(query, insertValues);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: `${dataArray.length} demi-aiguillages insérés pour ADV: ${advName}` });
    
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Erreur insertion b2v_da (Transaction annulée):', err.message);
    res.status(500).json({ error: `Erreur serveur lors de l'insertion dans b2v_da: ${err.message}` });
  } finally {
    if (client) {
      client.release(); 
    }
  }
});
router.delete('/adv/:advName', async (req, res) => {
  const advName = req.params.advName;
  
  if (!advName) {
    return res.status(400).json({ error: 'Le nom de l\'ADV est manquant.' });
  }

  let client = null; 
  let advType = null;
  const advNameLower = advName.toLowerCase();
  
  try {
    client = await pool.getClient(); 
    await client.query('BEGIN');

    // 2. Récupérer le type d'ADV nécessaire pour cibler la table spécifique
    const typeResult = await client.query('SELECT type FROM general_data WHERE adv = $1', [advName]);
    
    if (typeResult.rows.length === 0) {
      // Si l'ADV n'existe pas, on annule et répond 404
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `ADV "${advName}" non trouvé dans general_data.` });
    }
    
    advType = typeResult.rows[0].type.toLowerCase();
    
    // 3. Suppression dans la table spécifique (adv_bs, adv_tj, ou adv_to)
    const specificTableName = `adv_${advType}`;
    
    await client.query(`DELETE FROM ${specificTableName} WHERE adv = $1`, [advName]);
    console.log(`[DELETE] Supprimé de ${specificTableName}`);

    // 4. Suppression conditionnelle dans b2v_da (pour BS et TJ uniquement)
    if (advType === 'bs' || advType === 'tj') {
      await client.query('DELETE FROM b2v_da WHERE adv = $1', [advName]);
      console.log('[DELETE] Supprimé de b2v_da (Demi-Aiguillage)');
    }

    // 5. Suppression dans la table générale (DOIT ÊTRE FAIT EN DERNIER)
    await client.query('DELETE FROM general_data WHERE adv = $1', [advName]);
    console.log('[DELETE] Supprimé de general_data');

    await client.query('COMMIT'); // Validation si toutes les étapes ont réussi
    
    res.status(200).json({ 
        message: `L'ADV "${advName}" (${advType.toUpperCase()}) et toutes ses dépendances ont été supprimés.`,
        advType: advType.toUpperCase()
    });

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error(`Erreur lors de la suppression de l'ADV ${advName}:`, err.message);
    res.status(500).json({ error: `Erreur serveur lors de la suppression: ${err.message}` });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;