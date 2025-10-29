//server.js
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./config/db'); 

const AuthMiddleware = require('./middleware/authMiddleware');

const voiesRoutes = require('./routes/voies');
const advRoutes = require('./routes/adv');
const b2vRoutes = require('./routes/b2v');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const downloadRoutes = require('./routes/downloadRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(AuthMiddleware.authenticate); 
app.use(AuthMiddleware.checkTokenAndRedirect); 

app.use(express.static('public')); 

app.use('/api', voiesRoutes);
app.use('/api', advRoutes);
app.use('/api', b2vRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/webdav', downloadRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/signup.html'));
});

app.get('/:page', (req, res, next) => {
  if (req.params.page.startsWith('api') || req.params.page === 'auth' || req.params.page === 'admin') {
          return next(); 
      }      
  const filePath = path.join(__dirname, 'public/views', `${req.params.page}.html`);
  res.sendFile(filePath, err => {
    if (err) next(); 
  });
});

app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err.stack);
  res.status(500).send('Erreur interne du serveur');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur lancé sur http://0.0.0.0:${port}`);
});