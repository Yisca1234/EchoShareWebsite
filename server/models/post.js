const mongoose = require('mongoose');



const postSchema = new mongoose.Schema(
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
      likes:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          unique: true,
        },
      ],
      comments:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Comment',
        },
      ],
      qoutes:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post',
        },
      ],
      views:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      bookmark:{
        type: Number,
        default: '0',
      },
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


postSchema.methods.incrementViews = function(userId) {
  this.data.views = [userId, ...this.data.views];
  return this.save();
};


postSchema.methods.incrementBookmark = function() {
  this.data.bookmark += 1;
  return this.save();
};

postSchema.methods.decrementBookmark = function() {
  if (this.data.bookmark > 0) {
    this.data.bookmark -= 1;
  }
  return this.save();
};

module.exports = mongoose.model('Post', postSchema);