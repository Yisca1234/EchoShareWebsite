const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');



const authSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      unique: true,
    },
  },  
  {
    timestamps: true,
    versionKey: false,
  },
);

authSchema.plugin(uniqueValidator);




module.exports = mongoose.model('Auth', authSchema);
