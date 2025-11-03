//routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const Auth = require('../middleware/authMiddleware'); 
const Admin = require('../middleware/adminMiddleware');
router.use(Auth.authenticate);
router.use(Admin.authorizeAdmin);

router.get('/users', adminController.getUsersData);
router.get('/pending-requests', adminController.getPendingRequests); 
router.post('/approve-request', adminController.approveRegistration);

module.exports = router;
