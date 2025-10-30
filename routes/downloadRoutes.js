// routes/downloadRoutes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

router.get("/list", documentController.listDocuments);
router.get("/open/:filename", documentController.openDocument);

module.exports = router;