const express = require('express');
const { auth } = require('../utils/middleware');
const {
  createNewComment,
  getComments,
} = require('../controllers/comment');


const router = express.Router();

router.post('/:postId',auth, createNewComment);
router.get('/:postId', auth, getComments);
// router.delete('/deleteComment/:commentId', auth, deleteComment);
// router.put('/like', auth, handleCommentLike);
// router.put('/view', auth, handleincrementViews)


module.exports = router;

