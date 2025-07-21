const express = require('express');
const path = require('path');
require('dotenv').config();

// Initialise la connexion DB
require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques (accessible via /public/...)
app.use(express.static('public'));

// Routes API (ex: /api/advBoulogne)
const voiesRoutes = require('./routes/voies');
const advRoutes = require('./routes/adv');
const b2vRoutes = require('./routes/b2v');

app.use('/api', voiesRoutes);
app.use('/api', advRoutes);
app.use('/api', b2vRoutes);


// Redirection de "/" vers index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

// Routes dynamiques pour les pages HTML (sans extension)
app.get('/:page', (req, res, next) => {
  if (req.params.page.startsWith('api')) return next(); // ne pas interférer avec les routes /api/*
  const filePath = path.join(__dirname, 'public/views', `${req.params.page}.html`);
  res.sendFile(filePath, err => {
    if (err) next(); // passe au middleware suivant (404)
  });
});

// Middleware d'erreur générique
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err.stack);
  res.status(500).send('Erreur interne du serveur');
});

// Lancement du serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur lancé sur http://0.0.0.0:${port}`);
});
