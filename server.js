const express = require('express');
require('dotenv').config();
const { Client } = require('pg');
const app = express();
const port = 3000;


const client = new Client({
  connectionString: process.env.CONNECTIONSTRING,
  ssl: false,               
});
//ou cette methode:
// const client = new Client({
//   host: process.env.HOSTBDD,
//   port: process.env.PORTBDD,                     
//   user: process.env.USERBDD,                  
//   password: process.env.PASSBDD,         
//   database: process.env.DATABASE
// });



client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL !'))
  .catch(err => console.error('Erreur de connexion', err));




app.use(express.static('public'));


app.get('/api/advBoulogne', async (req, res) => {
  try {
    const result = await client.query('SELECT DISTINCT "ADV", "Latitude", "Longitude"  FROM adv ORDER BY "ADV";');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/voiesBoulogne', async (req, res) =>{
  try{
    const result = await client.query('SELECT DISTINCT voie from voies order by voie');
    res.json(result.rows);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/voiesBoulogne/ecart', async (req,res) => {
  try{
    const result = await client.query('SELECT DISTINCT voie, distance, ecarts_1435 from voies order by voie, distance');
    res.json(result.rows);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/voiesBoulogne/fleche', async (req,res) => {
  try{
    const result = await client.query('SELECT DISTINCT voie, distance, fleches from voies order by voie, distance');
    res.json(result.rows);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/voiesBoulogne/ga', async (req,res) => {
  try{
    const result = await client.query('SELECT DISTINCT voie, distance, ga_arrondi from voies order by voie, distance');
    res.json(result.rows);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});
// Lancement du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur Express en ligne : http://localhost:${port}`);
});
