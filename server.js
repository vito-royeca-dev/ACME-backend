require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const socketIo = require('socket.io');
const { setupSocket } = require('./socket');
const app = express();
const PORT = process.env.PORT || 5000;

const uri = "mongodb+srv://timm911:4VgZHpFaChr19vCd@acme-cluster.1w02jwz.mongodb.net/?retryWrites=true&w=majority&appName=ACME-Cluster";

mongoose.connect(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const io = socketIo(server);

app.use('/api/tunnels', require('./routes/tunnels')(io));
app.use('/api/zones', require('./routes/zones')(io));
app.use('/api/users', require('./routes/users')(io));
app.use('/api/messages', require('./routes/messages')(io));
app.use('/api/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth'));

setupSocket(io);

module.exports = { server, app };