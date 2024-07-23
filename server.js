const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const plotRoutes = require('./routes/plots');
const itemRoutes = require('./routes/items');
const rankRoutes = require('./routes/ranks');
const userCategoriesRoutes = require('./routes/userCategories');

// Express application setup
const app = express();
const port = process.env.PORT || 80;

// Middleware setup
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://kcloudvpn.kaist.ac.kr'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') {
    console.log(`${req.method} request to ${req.url} at ${new Date().toISOString()}`);
  }
  next();
});

app.options('*', cors());

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/ranks', rankRoutes);
app.use('/api', userCategoriesRoutes);

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
