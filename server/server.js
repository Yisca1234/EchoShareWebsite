const app = require('./app');
const http = require('http');
const PORT = "5000";
const connectToDB = require('./db');
const setupSocket = require('./socket');

// Connect to MongoDB
connectToDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = setupSocket(server);

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});