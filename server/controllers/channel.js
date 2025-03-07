
const User = require('../models/user');

const getChannel = async (req, res) => {
  const { channelId } = req.params;
  // //console.log(channelId);
  try {
    // Find user by ID and populate Followers and Posts
    const channel = await User.findById(channelId)
      .populate({
        path: 'avatar.Followers',
        select: '_id',
        populate: {
          path: 'avatar',
          select: 'username imageLink -_id' // Get ONLY username & imageLink, exclude _id and all other fields
        }
      })     
      .populate({
        path: 'avatar.posts',
        select: '-__v -updatedAt -user', // Select all fields for Posts except the version key
      });

    if (!channel) {
      throw new Error('Channel not found');
    }

    // Calculate the number of followers
    res.json({
      // channel,
      channel: {
        _id: channel._id,
        following: [...channel.data.following],
        name: channel.avatar.username,
        imageLink: channel.avatar.imageLink,
        description: channel.avatar.description,  
        Followers: [...channel.avatar.Followers],
        posts: [...channel.avatar.posts],
      },
    });
    // Return the relevant data
    
  } catch (error) {
    console.error('Error fetching channel details:', error);
    throw error;
  }

}



module.exports = { 
  getChannel,
};