const express = require("express");
const router = express.Router();
const permissionsController = require("../controllers/permissionsController");

// GET /api/permissions/:userId
router.get("/:userId", permissionsController.getUserPermissions);

// POST /api/permissions/:userId
router.post("/:userId", permissionsController.updateUserPermissions);

module.exports = router;
