const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const guestRoutes = require('./routes/guestRoutes');  // Adjusted the path to match your routes directory
require('dotenv').config();

const app = express();
connectDB();

app.use(bodyParser.json());

app.use('/api/guests', guestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
