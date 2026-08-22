const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, travel_preferences } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address (e.g. user@example.com).' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check existing user
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const prefsJson = JSON.stringify(travel_preferences || {});

    // Insert user
    const userRes = await db.query(
      `INSERT INTO users (name, email, password_hash, travel_preferences)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, travel_preferences, created_at`,
      [name.trim(), cleanEmail, passwordHash, prefsJson]
    );

    const user = userRes.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        travelPreferences: user.travel_preferences,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    // Find user
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const user = userRes.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: user.bio || 'Cultural traveler and sacred pilgrimage explorer.',
        language: user.language || 'English / Hindi',
        travelPreferences: user.travel_preferences,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const userRes = await db.query(
      `SELECT id, name, email, avatar_url, bio, language, travel_preferences, created_at FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userRes.rows[0];

    // Stats
    const statsRes = await db.query(
      `SELECT 
        COUNT(DISTINCT t.id) as trips_count,
        COUNT(DISTINCT s.country) as countries_count,
        COUNT(DISTINCT a.id) as activities_count
       FROM trips t
       LEFT JOIN stops s ON s.trip_id = t.id
       LEFT JOIN activities a ON a.stop_id = s.id
       WHERE t.user_id = $1`,
      [userId]
    );

    const stats = statsRes.rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: user.bio || 'Cultural traveler and sacred pilgrimage explorer.',
        language: user.language || 'English / Hindi',
        travelPreferences: user.travel_preferences,
        createdAt: user.created_at,
        countriesVisited: parseInt(stats.countries_count || '0', 10),
        tripsCount: parseInt(stats.trips_count || '0', 10),
        activitiesCount: parseInt(stats.activities_count || '0', 10),
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, email, avatar, bio, language, travel_preferences } = req.body;

    const userRes = await db.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           avatar_url = COALESCE($3, avatar_url),
           bio = COALESCE($4, bio),
           language = COALESCE($5, language),
           travel_preferences = COALESCE($6, travel_preferences)
       WHERE id = $7
       RETURNING id, name, email, avatar_url, bio, language, travel_preferences, created_at`,
      [
        name ? name.trim() : null,
        email ? email.toLowerCase().trim() : null,
        avatar || null,
        bio || null,
        language || null,
        travel_preferences ? JSON.stringify(travel_preferences) : null,
        userId
      ]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userRes.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar_url || avatar,
        bio: user.bio,
        language: user.language,
        travelPreferences: user.travel_preferences,
        createdAt: user.created_at,
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getMe, updateProfile };

