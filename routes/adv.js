const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/advBoulogne', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT "ADV", "Latitude", "Longitude" FROM adv ORDER BY "ADV";');
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
    const result = await pool.query('SELECT "adv","type", "lat", "long" FROM general_data order by adv;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/adv_coordinates/:type', async (req, res) => {
  const type = req.params.type;
  try {
    const result = await pool.query('SELECT "adv", "lat", "long" FROM general_data WHERE type = $1 order by "adv";', [type]);
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
  
  try {
    client = await pool.getClient(); 
    await client.query('BEGIN');

    const typeResult = await client.query('SELECT type FROM general_data WHERE adv = $1', [advName]);
    
    if (typeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `ADV "${advName}" non trouvé dans general_data.` });
    }
    
    advType = typeResult.rows[0].type.toLowerCase();
    
    const specificTableName = `adv_${advType}`;
    const specificHistoricTableName = `adv_${advType}_historic`;

    await client.query(`DELETE FROM ${specificHistoricTableName} WHERE snapshot_adv = $1`, [advName]);
    console.log(`[DELETE] Supprimé de ${specificHistoricTableName} (Historique)`);
    
    await client.query(`DELETE FROM ${specificTableName} WHERE adv = $1`, [advName]);
    console.log(`[DELETE] Supprimé de ${specificTableName}`);

    if (advType === 'bs' || advType === 'tj') {
      await client.query('DELETE FROM b2v_da WHERE adv = $1', [advName]);
      console.log('[DELETE] Supprimé de b2v_da (Demi-Aiguillage)');
      await client.query('DELETE FROM b2v_da_historic WHERE snapshot_adv = $1', [advName]);
      console.log('[DELETE] Supprimé de b2v_da_historic (Historique Demi-Aiguillage)');

    }

    await client.query('DELETE FROM general_data WHERE adv = $1', [advName]);
    console.log('[DELETE] Supprimé de general_data');

    await client.query('COMMIT'); 
    
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
router.get('/b2v_da/:advName', async (req, res) => {
    const advName = req.params.advName; 
    try {
        const result = await pool.query('SELECT * FROM b2v_da WHERE adv = $1', [advName]);
        res.json(result.rows); // Si vide, retourne [] (200 OK)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/adv_list', async (req, res) => {
  try {
    const result = await pool.query('SELECT adv, type FROM general_data ORDER BY adv;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/adv_historic/:type', async (req, res) => {
  const { type } = req.params;
  const tableName = `adv_${type}_historic`;
  const data = req.body;
  
  if (type !== 'bs' && type !== 'tj' && type !== 'to') {
    return res.status(400).json({ error: 'Type ADV non supporté pour l\'insertion.' });
  }

  if (!data.snapshot_adv || !data.snapshot_date) {
    return res.status(400).json({ error: 'Données historiques (snapshot_adv ou snapshot_date) manquantes.' });
  }

  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`;

  try {
    const result = await pool.query(query, values);
    res.status(201).json({ message: `${tableName} historical data recorded`, data: result.rows[0] });
  } catch (err) {
    console.error(`Erreur insertion historique ${tableName}:`, err.message);
    res.status(500).json({ error: `Erreur serveur lors de l'insertion dans ${tableName}: ${err.message}` });
  }
});

router.post('/b2v_da_historic', async (req, res) => {
  const dataArray = req.body;
  const tableName = 'b2v_da_historic';

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return res.status(400).json({ error: 'Le corps doit être un tableau non vide avec des données historiques.' });
  }
  
  let client = null;
  try {
    client = await pool.getClient(); 
    await client.query('BEGIN');
    
    const firstData = dataArray[0];
    const fields = Object.keys(firstData).filter(key => firstData[key] !== undefined);
    const fieldsString = fields.join(', ');
    
    for (const data of dataArray) {
        if (!data.snapshot_adv || !data.snapshot_date) continue; 
        
        const values = fields.map(field => data[field] !== undefined ? data[field] : null);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO ${tableName} (${fieldsString}) VALUES (${placeholders});`;
        
        await client.query(query, values);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: `${dataArray.length} demi-aiguillages historiques enregistrés.` });
    
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error(`Erreur insertion historique ${tableName} (Transaction annulée):`, err.message);
    res.status(500).json({ error: `Erreur serveur lors de l'insertion historique: ${err.message}` });
  } finally {
    if (client) {
      client.release(); 
    }
  }
});

router.put('/adv_update_transaction/:advName', async (req, res) => {
    const advName = req.params.advName;
    const { generalData, specificData, demiAiguillageData, advType } = req.body;
    
    const advTypeLower = advType.toLowerCase();
    const specificTableName = `adv_${advTypeLower}`;

    if (!advName || !advType || generalData.adv !== advName || specificData.adv !== advName) {
        return res.status(400).json({ error: 'Données ADV, Type, ou Nom de l\'ADV incohérents.' });
    }

    let client = null;
    
    try {
        client = await pool.getClient(); 
        await client.query('BEGIN'); // DÉBUT DE LA TRANSACTION

        // 1. Mise à jour des Données Générales (PATCH-like)
        const generalFields = Object.keys(generalData).filter(f => f !== 'adv' && f !== 'type');
        const generalValues = generalFields.map(field => generalData[field]);
        const generalSetClauses = generalFields.map((field, i) => `${field} = $${i + 2}`).join(', ');
        
        if (generalFields.length > 0) {
            const generalQuery = `UPDATE general_data SET ${generalSetClauses} WHERE adv = $1;`;
            await client.query(generalQuery, [advName, ...generalValues]);
        }

        // 2. Remplacement des Données Spécifiques (PUT/DELETE+INSERT)
        await client.query(`DELETE FROM ${specificTableName} WHERE adv = $1`, [advName]);
        
        const specificFields = Object.keys(specificData);
        const specificValues = Object.values(specificData);
        const specificPlaceholders = specificValues.map((_, i) => `$${i + 1}`).join(', ');
        const specificInsertQuery = `INSERT INTO ${specificTableName} (${specificFields.join(', ')}) VALUES (${specificPlaceholders});`;
        await client.query(specificInsertQuery, specificValues);


        // 3. Remplacement des Demi-Aiguillages (si applicable)
        if (advTypeLower === 'bs' || advTypeLower === 'tj') {
            await client.query('DELETE FROM b2v_da WHERE adv = $1', [advName]);
            
            if (demiAiguillageData.length > 0) {
                for (const dataItem of demiAiguillageData) {
                    const daFields = Object.keys(dataItem).filter(key => dataItem[key] !== null);
                    const daValues = daFields.map(key => dataItem[key]);
                    const daPlaceholders = daValues.map((_, i) => `$${i + 1}`).join(', ');
                    const daQuery = `INSERT INTO b2v_da (${daFields.join(', ')}) VALUES (${daPlaceholders});`;
                    
                    await client.query(daQuery, daValues);
                }
            }
        }
        
        await client.query('COMMIT'); // Validation si tout a réussi
        res.json({ message: 'Transaction de mise à jour complète réussie.' });

    } catch (err) {
        if (client) {
            await client.query('ROLLBACK'); // Annulation si une erreur survient
        }
        console.error('Erreur transactionnelle de mise à jour ADV:', err.message);
        res.status(500).json({ error: `Erreur serveur lors de la mise à jour transactionnelle: ${err.message}` });
    } finally {
        if (client) {
            client.release();
        }
    }
});

router.get('/historic_from/:type', async (req, res) => {
  const type = req.params.type;
  try {
    const tableName = `adv_${type}_historic`;
    const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY snapshot_date, historic_id DESC;`);
    res.json(result.rows);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/b2v_da_historic_from/:advName', async (req, res) => {
  const advName = req.params.advName;
  try {
    const result = await pool.query('SELECT * FROM b2v_da_historic WHERE snapshot_adv = $1 ORDER BY historic_id, snapshot_date DESC;', [advName]);
    res.json(result.rows);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  } 
});
router.get('/list_historic_for/:type', async (req, res) => {
  const type = req.params.type;
  if (type !== 'bs' && type !== 'tj' && type !== 'to') {
    return res.status(400).json({ error: 'Type ADV non supporté.' });
  }

  try {
    const tableName = `adv_${type}_historic`;
    // Sélectionne les dates et les ADV distincts dans la table historique
    const result = await pool.query(`SELECT DISTINCT snapshot_date, snapshot_adv FROM ${tableName} ORDER BY snapshot_date DESC;`);
    res.json(result.rows);
  }
  catch (err) {
    // Si la table n'existe pas, cela renverra une erreur 500.
    res.status(500).json({ error: err.message });
  }
});
router.post('/adv-audit-log', async (req, res) => {
    const { adv_name, user_id, observation, changes_json, snapshot_date } = req.body;
    
    if (!adv_name || !user_id || !observation || !changes_json || !snapshot_date) {
        return res.status(400).json({ error: 'Données de log d\'audit manquantes (adv_name, user_id, observation, changes_json, snapshot_date).' });
    }
    
    const query = `
        INSERT INTO adv_snapshot_log (adv_name, user_id, observation, changes_json, snapshot_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [adv_name, user_id, observation, JSON.stringify(changes_json), snapshot_date];

    try {
        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Snapshot log recorded', data: result.rows[0] });
    } catch (err) {
        console.error('Erreur insertion adv_snapshot_log:', err.message);
        res.status(500).json({ error: `Erreur serveur lors de l'insertion dans adv_snapshot_log: ${err.message}` });
    }
});
router.get('/adv_snapshot_log/:advName', async (req, res) => {
    const advName = req.params.advName;
    try {
        const query = `
            SELECT id, adv_name, snapshot_date, user_id, observation, changes_json 
            FROM adv_snapshot_log 
            WHERE adv_name = $1 
            ORDER BY snapshot_date DESC;
        `;
        const result = await pool.query(query, [advName]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur de récupération des logs snapshot:', err.message);
        res.status(500).json({ error: `Erreur serveur lors de la récupération des logs snapshot: ${err.message}` });
    }
});
module.exports = router;