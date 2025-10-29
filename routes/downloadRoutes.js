// routes/downloadRoutes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const Auth = require('../middleware/authMiddleware');

router.use(Auth.authenticate);

router.get('/list', documentController.listDocuments);
router.get('/download/:id', documentController.downloadDocument);

module.exports = router;