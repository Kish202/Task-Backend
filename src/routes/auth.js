const express = require('express');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { register, login, logout, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', auth, getProfile);

module.exports = router;