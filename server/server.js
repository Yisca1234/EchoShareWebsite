const app = require('./app');
const http = require('http');
const PORT = "5000";
const connectToDB = require('./db');
const mongoose = require('mongoose'); //for the all application


connectToDB()

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});