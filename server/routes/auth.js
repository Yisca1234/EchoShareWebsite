const express = require('express');
const { loginUser, signupUser, getSignature, requestPasswordReset, resetPassword } = require('../controllers/auth.js');

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/get-signature', getSignature);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
