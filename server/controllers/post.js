const Post = require('../models/post');
const User = require('../models/user');
const mongoose = require('mongoose');

const populateComments = async (posts) => {
  
  return populatedPosts;
};

const createNewPost = async (req, res) => {
  const { username, postContent, photoData } = req.body;

  const publicId = photoData?.public_id ? photoData.public_id : null;

  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const user = await User.findOne({ 'avatar.username': username });
    //need to check that the public id is valid using the signature
    const post = new Post({
      data: {
        text: postContent,
        img: {
          exists: !!publicId,
          imageLink: publicId || null,
        },
      },
      user: user._id,
    });

    await post.save();

    const updatedUser = await User.findOneAndUpdate(
      { 'avatar.username': username }, 
      { 
        $push: { 
          'avatar.posts': { 
            $each: [post], 
            $position: 0 
          } 
        } 
      },
      { new: true } 
    );

    
    await session.commitTransaction();
    session.endSession();


    res.status(200).json({
      post: post
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(400)
      .send({ massage: `error - create new post : ${error}` });
  }





};

const getPosts = async (req, res) => {
  const {userId, limit, exclude, typeOfSort} = req.body;

  const excludeIds = !!exclude ? exclude.split(',') : [];
  if(typeOfSort==='foryou'){
    const posts = await Post.aggregate([
      { 
        $match: { 
          _id: { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) },
          user: { $ne: new mongoose.Types.ObjectId(userId) },
        } 
      },
      { $sample: { size: parseInt(limit, 10) } },
      {
        $lookup: {
          from: 'users', 
          localField: 'user', 
          foreignField: '_id', 
          as: 'user' 
        }
      }    
    ]);
    return res
      .status(200)
      .send({
        listOfPosts: posts,
        });
    
  } 
  if(typeOfSort==='following') {
    const user = await User.findById(userId).select('data.following').lean();
    const followingIds = user.data.following;
    const posts = await Post.aggregate([
      { 
        $match: { 
          _id: { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) },
          user: { $in: followingIds.map(id => new mongoose.Types.ObjectId(id)) }  // Exclude posts created by the specific user
        } 
      },
      { $sample: { size: parseInt(limit, 10) } },
      {
        $lookup: {
          from: 'users', 
          localField: 'user', 
          foreignField: '_id', 
          as: 'user' 
        }
      },    
    ]);
    return res
      .status(200)
      .send({
        listOfPosts: posts,
        });
  }
  return res.status(400).send({message:  `type of sort is not valid: ${typeOfSort}`})

      
}



const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findOneAndDelete(
      { _id: postId }
    );

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
}

const handlePostLike = async (req, res) => {
  const {postId, userId, pressLike} = req.body;

  if(pressLike){
    const post = await Post.findOneAndUpdate(
      { _id: postId },
      { $addToSet: { "data.likes": userId } },
      { new: true }
    );
    return res.status(200).json({ message: 'success' });
  } else {
    const post = await Post.findOneAndUpdate(
      { _id: postId },
      { $pull: { "data.likes": userId } },
      { new: true }
    );
    
    return res.status(200).json({ message: 'success' });
  }

}



const handleincrementViews = async (req, res) => {
  
  const {userId, viewedPosts} = req.body;
  viewedPosts.filter( async (postId)=> {
    try{
      const post = await Post.findById(postId);
      await post.incrementViews(userId);
      return true;
    } catch{
      return false;
    }
  })
  res.send({ viewedPosts:  viewedPosts});

}

module.exports = { 
  createNewPost,
  getPosts,
  deletePost,
  handlePostLike,
  handleincrementViews,
};