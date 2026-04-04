const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/auth/discord', authController.authRedirect);
router.get('/callback', authController.callback);

module.exports = router;
