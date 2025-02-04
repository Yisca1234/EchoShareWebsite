const express = require('express');
const { auth } = require('../utils/middleware');
const {
  handleAvatar,
  handleFollow,
  getChannelsHome,
  handleBookmark,
  getSearchResults,
} = require('../controllers/user');

const router = express.Router();


router.post('/createAvatar', auth, handleAvatar);
router.put('/updateAvatar', auth, handleAvatar);
router.put('/follow', auth, handleFollow);
router.put('/bookmark', auth, handleBookmark);
router.post('/getChannelsHome',auth, getChannelsHome);
router.get('/search/:query/:userId',auth, getSearchResults);


module.exports = router;
