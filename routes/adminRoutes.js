//routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 1. Importez les objets modules complets (nous allons extraire les fonctions)
const Auth = require('../middleware/authMiddleware'); 
const Admin = require('../middleware/adminMiddleware');
router.use(Auth.authenticate);
router.use(Admin.authorizeAdmin);

// Route API pour récupérer les données du tableau de bord
router.get('/users', adminController.getUsersData);

module.exports = router;
