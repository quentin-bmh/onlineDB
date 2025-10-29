const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/list', authMiddleware.authenticate, documentController.listAvailableDocuments);
router.get('/download/:docId', authMiddleware.authenticate, documentController.downloadDocument);

module.exports = router;