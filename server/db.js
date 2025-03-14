const mongoose = require('mongoose');
const url = process.env.MONGO_URL;
const connectToDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoCreate: true,
    });

    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error(`Error while connecting to MongoDB: `, error.message);
  }

};

module.exports = connectToDB;