const express = require('express');
const { loginUser, signupUser, getSignature } = require('../controllers/auth.js');

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/get-signature', getSignature);


module.exports = router;
