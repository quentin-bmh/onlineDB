// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const Auth = require('../middleware/authMiddleware'); // ⬅️ 1. Importation du middleware d'authentification

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', Auth.authenticate, authController.getProfile); // ⬅️ 2. Décommenté et corrigé

module.exports = router;