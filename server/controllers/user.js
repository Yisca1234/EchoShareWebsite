const Auth = require('../models/auth');
const User = require('../models/user');
const Post = require('../models/post');
const mongoose = require('mongoose');
//getting the sepecific user without any checks (that are made in the server)
const getUser = async (req, res) => {
  const username = req.params.username;



  const user = await User.findOne({
    'avatar.username': { $regex: new RegExp('^' + username + '$') },
  }).populate('posts');

  res.status(200).json({
    user: user,
  });

};

const createUser = async (req, res) => {
  const username = req.params.username;

  const session = await mongoose.startSession();
  session.startTransaction();

  try{
    const newUser = new User({
      avatar: {
        username,
        email: req.body.formData.email,
      },
    });
    newUser.save()
    const auth = await Auth.findOne({
      username: { $regex: new RegExp('^' + username + '$') },
    });
    auth.userExists= true;
    await auth.save;

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .send({ user: newUser });

  } catch (err){
    await session.abortTransaction();
    session.endSession();
    return res.status(500).send({ message: 'Server error', error: err });
  }

  
}

const handleAvatar = async (req, res) => {
  const { formData, userId, creation } = req.body;
  const { username, image, description, phone } = formData;
  let user;
  try {
    if(creation){
      user = await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            'data.avatarExists': true,
            'avatar.username': username,
            'avatar.imageLink': image && image.public_id,
            'avatar.description': description,
            'avatar.phone': phone,
            'avatar.avatarSetDate': new Date(),
          },
        },
        { new: true, upsert: true }
      );    
    } else {
      user = await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            'data.avatarExists': true,
            'avatar.username': username,
            'avatar.imageLink': image && image.public_id,
            'avatar.description': description,
            'avatar.phone': phone,
          },
        },
        { new: true, upsert: true }
      );    
    } 

    if (!user) {
      return res.status(400).send({ message: 'Cannot find the user' });
    }

    return res.status(200).send({
      avatar: {
        username: user.avatar.username,
        imageLink: user.avatar.imageLink,
        description: user.avatar.description,
        phone: user.avatar.phone,
        avatarSetDate: user.avatar.avatarSetDate,
      },
    });
  } catch (err) {
    return res.status(500).send({ message: 'Server error', error: err.message });
  }
};


const handleFollow = async (req, res) => {
  const { idFollower, idChannel, follow } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let updatedChannelUser;
    if (follow) {
      updatedChannelUser = await User.findOneAndUpdate(
        { _id: idChannel },
        { $addToSet: { "avatar.Followers": idFollower } },
        { new: true, session }
      );

      if (!updatedChannelUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ message: 'Failed to update followers' });
      }

      const updatedUserFollowing = await User.findOneAndUpdate(
        { _id: idFollower },
        { $addToSet: { "data.following": idChannel } },
        { new: true, session }
      );

      if (!updatedUserFollowing) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ message: 'Failed to update following' });
      }
    } else {
      updatedChannelUser = await User.findOneAndUpdate(
        { _id: idChannel },
        { $pull: { "avatar.Followers": idFollower } },
        { new: true, session }
      );

      if (!updatedChannelUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ message: 'Failed to delete one of the followers' });
      }

      const updatedUserFollowing = await User.findOneAndUpdate(
        { _id: idFollower },
        { $pull: { "data.following": idChannel } },
        { new: true, session }
      );

      if (!updatedUserFollowing) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ message: 'Failed to delete one of the following' });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).send({ message: 'Action succeeded', channel: updatedChannelUser });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).send({ message: 'Server error', error: err });
  }
};

const getChannelsHome = async (req, res) => {
  try {
    const { userId } = req.body;


    const user = await User.findById(userId).select('data.following').exec();
    const followingList = user.data.following;
    const totalUsers = await User.countDocuments();
    const top25PercentCount = Math.ceil(totalUsers * 0.25);
    
    const topUsersByFollowers = await User.aggregate([
      {
        $match: {
          'data.avatarExists': true,
          _id: { $ne: new mongoose.Types.ObjectId(userId) },
          _id: { $nin: followingList },
        },
      },
      {
        $project: {
          avatar: 1,
          followersCount: { $size: "$avatar.Followers" }
        }
      },
      { $sort: { followersCount: -1 } },
      { $limit: top25PercentCount }
    ]);
    
    const randomTopUsers = await topUsersByFollowers.sort(() => 0.5 - Math.random()).slice(0, 4);
    
    const usersWithAvatars = await User.aggregate([
      {
        $match: {
          'data.avatarExists': true,
          _id: { $ne: new mongoose.Types.ObjectId(userId) },
          _id: { $nin: [...randomTopUsers.map((obj => obj._id)), ...followingList] },
        }
      },
      { $sample: { size: 4 } },
      {
        $project: {
          avatar: 1
        }
      }
    ]);
    res.status(200).json({
      popularChannels: randomTopUsers,
      randomChannels: usersWithAvatars,
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const handleBookmark = async (req, res) => {
  const { userId, postId, isBookmarked, idChannel } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const post = await Post.findById(postId).populate('user', '_id avatar');
    if(isBookmarked){
      await post.decrementBookmark();
      const updatedChannelUser = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { "data.bookmarkedPosts": postId } },
        { new: true }
      );      
    } if(!isBookmarked) {
      await post.incrementBookmark();
      const updatedChannelUser = await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { "data.bookmarkedPosts": postId } },
        { new: true }
      );
      
    }
    
    await session.commitTransaction();
    session.endSession();
    
    return res.status(200).send({ message: 'Action succeeded',  post});
  } catch(err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).send({ message: 'Server error', error: err });
  }


}


module.exports = { getUser, createUser ,handleAvatar,handleFollow, getChannelsHome, handleBookmark};


