const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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
    //console.log(err);
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

const requestPasswordReset = async (req, res) => {
  const { email, newPassword } = req.body;
  const lowerCaseEmail = email.toLowerCase();
  const auth = await Auth.findOne({
    userEmail: lowerCaseEmail,
  });
  if (!auth) {
    return res.status(404).send({ message: 'User not found' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).send({ message: 'Password needs to be atleast 6 characters long.' });
  }

  const saltRounds = 10;
  const tempPasswordHash = await bcrypt.hash(newPassword, saltRounds);
  const confirmationToken = crypto.randomBytes(32).toString("hex");
  const expiration = new Date(Date.now() + 3600000);

  auth.tempPasswordHash = tempPasswordHash;
  auth.confirmationToken = confirmationToken;
  auth.expirationToken = expiration;
  await auth.save();


  const resetLink = `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : 'https://app.echo-share.click'}/confirmation-reset?token=${confirmationToken}`;

  const transporter = await nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'echoshareweb@gmail.com', // Your Gmail address
      pass: process.env.APP_GMAIL_PASSWORD 
    }
  });
  
  const emailOptions = {
    from: 'echoshareweb@gmail.com',
    to: email,
    subject: 'Password Reset Confirmation',  
    html: `
      <p>Hello,</p>
      <p>You are receiving this email because you have requested a password reset for your account.</p>
      <p>Please click the link below to confirm the reset of your password:</p>
      <a href="${resetLink}">Confirm Password Reset</a>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Thanks,</p>
      <p>The EchoShare Team</p>
    `
  };

  await transporter.sendMail(emailOptions);

  res.status(200).send({ message: 'Password reset email has been sent. Please check your inbox.' });

}


const resetPassword = async (req, res) => {
  const token = req.query.token;

  // console.log(token);
  const auth = await Auth.findOne({
    confirmationToken: token,
    expirationToken: { $gt: new Date() },
  });
  if (!auth) {
    return res.status(404).send({ message: 'Invalid or expired token' });
  }


  auth.passwordHash = auth.tempPasswordHash;
  auth.tempPasswordHash = null;
  auth.confirmationToken = null;
  auth.expirationToken = null;
  await auth.save();

  res.status(200).send({ message: 'Your password has been successfully updated. You can now log in.' });
}


module.exports = { loginUser, signupUser, getSignature, requestPasswordReset, resetPassword };
