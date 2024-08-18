const mongoose = require('mongoose');
const user = require('./user');
const post = require('./post');

const { type } = require('os');

const commentSchema = new mongoose.Schema(
  {
    data:{
      text: {
        type: String,
        trim: true,
        default: 'null',
      },
      img:{
        exists: {
          type: Boolean,
          default: 'false',
        },
        imageLink: {
          type: String,
          trim: true,
          default: 'null',
        },
      },
      likes:{
        type: Number,
        default: '0',
      },
    },
    post:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
  { versionKey: false },
);



module.exports = mongoose.model('Comment', commentSchema);