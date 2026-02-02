const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middleware/auth');

const adminController = require('../controllers/adminController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/stats', dataController.getGlobalStats);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.get('/history', authMiddleware, dataController.getHistory);
router.get('/ranking/:turma', authMiddleware, dataController.getRanking);
router.post('/redeem', authMiddleware, dataController.redeemAward);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/profile', authMiddleware, authController.updateProfile);

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Admin routes (simplified for this plan)
router.post('/admin/update-coins', adminController.updateCoins);
router.post('/admin/update-coins-bulk', adminController.updateCoinsBulk);
router.post('/admin/delete-user', adminController.deleteUser);
router.get('/admin/users/:turma', adminController.getAllUsersByClass);
router.get('/admin/history/:email', adminController.getUserHistory);

module.exports = router;
