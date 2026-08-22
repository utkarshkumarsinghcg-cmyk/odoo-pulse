const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const odooRoutes = require('./routes/odooRoutes');
const exploreRoutes = require('./routes/exploreRoutes');
const aiRoutes = require('./routes/aiRoutes');
const odooController = require('./controllers/odooController');
const { authenticateToken } = require('./middleware/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: '🧵 Welcome to SafarSutra Backend API',
    tagline: 'The thread that guides your journey',
    status: 'online',
    database: 'Neon Cloud PostgreSQL',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login | /api/auth/register',
      trips: '/api/trips',
      explore: '/api/explore/destinations | /api/explore/activities',
      ai: '/api/ai/chat | /api/ai/generate-plan',
      odooStatus: '/api/odoo/status',
    },
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SafarSutra Backend API',
    database: 'Neon Cloud PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/trips/:id/budget', budgetRoutes);
app.post('/api/trips/:id/sync-odoo', authenticateToken, odooController.syncTrip);
app.use('/api/trips', tripRoutes);
app.use('/api/odoo', odooRoutes);


// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
