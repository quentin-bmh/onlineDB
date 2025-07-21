const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Import des routes API
const voiesRoutes = require('./routes/voies');
const advRoutes = require('./routes/adv');
const b2vRoutes = require('./routes/b2v');

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(voiesRoutes);
app.use(advRoutes);
app.use(b2vRoutes);
// Fichiers statiques
app.use(express.static('public'));

// Redirection de "/" vers index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

// URL propres pour les pages HTML (ex: /advBoulogne => views/advBoulogne.html)
app.get('/:page', (req, res, next) => {
  const filePath = path.join(__dirname, 'public/views', `${req.params.page}.html`);
  res.sendFile(filePath, err => {
    if (err) next(); // passe au middleware suivant en cas d'erreur (404)
  });
});

// Lancement du serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur lancé sur http://0.0.0.0:${port}`);
});





