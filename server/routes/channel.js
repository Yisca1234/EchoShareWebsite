const express = require('express');
const { auth } = require('../utils/middleware');
const {
  getChannel,
} = require('../controllers/channel');

const router = express.Router();


router.get('/:channelId', auth, getChannel);



module.exports = router;
