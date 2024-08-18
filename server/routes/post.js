const express = require('express');
const { auth } = require('../utils/middleware');
const {
  getPosts,
  createNewPost,
  deletePost,
  handlePostLike,
  handleincrementViews,
} = require('../controllers/post');


const router = express.Router();

router.post('/',auth, getPosts);
router.post('/createNewPost', auth, createNewPost);
router.delete('/deletePost/:postId', auth, deletePost);
router.put('/like', auth, handlePostLike);
router.put('/view', auth, handleincrementViews)


module.exports = router;

