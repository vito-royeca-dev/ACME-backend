require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost/acme-maps', {});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false,
}));
  
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: '*', // Specify allowed origins
  optionsSuccessStatus: 200, // Optional: HTTP status code for successful preflight requests
};

app.use(cors(corsOptions));

// Middleware: Passport initialization
app.use('/api/tunnels', require('./routes/tunnels'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth'));

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

module.exports = { app, io };
