const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

const mongoose = require('mongoose');



const createNewComment = async (req, res) => {
  const { postId } = req.params;
  const { userId, comment } = req.body;
  const { text } = comment;
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const user = await User.findById(userId);
    const post = await Post.findById(postId);

    const comment = new Comment({
      data: {
        text,
      },
      post: postId,
      user: userId,
    });

    await comment.save();

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { "data.comments": comment._id } },
      { new: true }
    );

    
    await session.commitTransaction();
    session.endSession();
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', '_id avatar');

    res.status(200).json({
      comment: populatedComment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(400)
      .send({ message: `error - create new comment : ${error}` });
  }

};

const getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ post: postId })
      .populate('user', '_id avatar')
      .select('-post')
      .exec();
    
    res.status(200).json({
      comments,
    });
  } catch (err) {
    return res
    .status(400)
    .send({ massage: `error - get comments of the post: ${postId} - ${err}` });
  }
  
}

module.exports = {createNewComment, getComments};