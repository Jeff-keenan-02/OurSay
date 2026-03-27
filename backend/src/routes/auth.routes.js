const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const requireAuth = require('../middleware/auth.middleware');

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.patch('/change-password', requireAuth, controller.changePassword);

module.exports = router;