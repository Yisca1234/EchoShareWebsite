const mongoose = require('mongoose');
const url= "mongodb+srv://gyisca:lokhkU8EeNLQMLVO@cluster2.0e1zr2d.mongodb.net/?retryWrites=true&w=majority";

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