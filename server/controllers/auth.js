const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Auth = require('../models/auth');
const User = require('../models/user');
const { SECRET } = require('../utils/config');
require("dotenv").config();
const mongoose = require('mongoose');
const cloudinary = require("cloudinary").v2
const {isValidEmail} = require('../utils/functions.js');

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
  secure: true,
})



const loginUser = async (req, res) => {
  const { useremail, password } = req.body;
  const lowerCaseEmail = useremail.toLowerCase();

  const auth = await Auth.findOne({
    userEmail: { $regex: new RegExp('^' + lowerCaseEmail + '$') },
  });

  if (!auth) {
    return res
      .status(400)
      .send({ message: 'No account with this email has been registered.' });
  }

  const credentialsValid = await bcrypt.compare(password, auth.passwordHash);

  if (!credentialsValid) {
    return res.status(401).send({ message: 'Invalid email or password.' });
  }
  const payloadForToken = {
    id: auth._id,
  };


  const token = jwt.sign(payloadForToken, SECRET);

  const user = await User.findOne({ 'data.auth': auth._id })
  .populate([
    { 
      path: 'data.bookmarkedPosts', 
      options: { strictPopulate: false },
      populate: { path: 'user', options: { strictPopulate: false } }
    },
    { 
      path: 'avatar.Followers', 
      options: { strictPopulate: false } 
    },
    { 
      path: 'avatar.posts', 
      options: { strictPopulate: false } 
    },
    { 
      path: 'data.following', 
      options: { strictPopulate: false } 
    }
  ]);
  



  res.status(200).json({
    token,
    userEmail: auth.userEmail,
    user: user,
  });
};

const signupUser = async (req, res) => {
  const { emailUser, password } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();


  const lowerCaseEmail = emailUser.toLowerCase();

  if (!password || password.length < 6) {
    return res
      .status(400)
      .send({ message: 'Password needs to be atleast 6 characters long.' });
  }

  if (!lowerCaseEmail|| !isValidEmail(lowerCaseEmail)) {
    return res
      .status(400)
      .send({ message: 'Email is not valid' });
  }

  const existingAuth = await Auth.findOne({
    userEmail: emailUser,
  });

  if (existingAuth) {
    return res.status(400).send({
      message: `userEmail '${emailUser}' is already in use. Choose another one.`,
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try{
    const auth = new Auth({
      userEmail: lowerCaseEmail,
      passwordHash: passwordHash,
    });
    const savedAuth = await auth.save();
  
    const payloadForToken = {
      id: savedAuth._id,
    };
    const token = jwt.sign(payloadForToken, SECRET);
    
    const user = new User({
      data: {
        auth: savedAuth._id,
      }
    });
    const savedUser = await user.save();
  

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      token,
      userEmail: savedAuth.userEmail,
      user: savedUser,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    return res.status(500).send({ message: 'Server error', error: err });
  }
};


const getSignature = async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp
    },
    cloudinaryConfig.api_secret,
  )
  res.json({ timestamp, signature });
}

module.exports = { loginUser, signupUser, getSignature };
