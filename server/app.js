require('dotenv').config();
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');

const app = express();

const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // List the allowed methods
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 600, // Cache the preflight response for 10 minutes
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/user', userRoutes);

app.use(express.static(path.resolve(__dirname, './public/')));
app.get(/.*/, (req, res) => res.sendFile(path.resolve(__dirname, './public/index.html')));

module.exports = app;
