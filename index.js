// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', require('./routes/auth'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(5000, () => console.log('Server running on port 5000'));
    }).catch((err) => console.error(err));
