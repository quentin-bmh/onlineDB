// routes/downloadRoutes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { upload } = require('../config/multerConfig');

router.get("/list", documentController.listDocuments);
router.get("/open/:filename", documentController.openDocument);
router.post('/upload_plan', upload.single('plan'), documentController.uploadPlan);

module.exports = router;