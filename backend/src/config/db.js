const { Pool } = require('pg');
require('dotenv').config();

let rawConnectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/safarsutra';

// Clean query params from connection string for standard node-postgres compatibility
const connectionString = rawConnectionString.split('?')[0];
const isNeon = rawConnectionString.includes('neon.tech');

const pool = new Pool({
  connectionString,
  ssl: isNeon || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

let useInMemoryFallback = false;

// Simple, fast in-memory store for zero-friction fallback if DB is unreachable
const memoryStore = {
  users: [
    {
      id: 1,
      name: 'Demo User',
      email: 'demo@safarsutra.com',
      password_hash: '$2a$10$wS4b...demo',
      travel_preferences: { travelStyle: 'adventure' },
      created_at: new Date().toISOString()
    }
  ],
  trips: [
    {
      id: 1,
      user_id: 1,
      name: 'Kyoto Autumn Journey',
      description: 'Temples and tea gardens',
      start_date: '2026-10-15',
      end_date: '2026-10-19',
      cover_photo_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
      is_public: true,
      share_token: 'share_kyoto_demo_123',
      status: 'confirmed',
      created_at: new Date().toISOString()
    }
  ],
  stops: [
    { id: 1, trip_id: 1, city: 'Kyoto', country: 'Japan', order_index: 1, start_date: '2026-10-15' }
  ],
  activities: [
    { id: 1, stop_id: 1, name: 'Kiyomizu-dera Temple', description: 'Historic temple', type: 'sightseeing', cost: 400, duration: '2h', time_slot: '14:00', address: 'Higashiyama, Kyoto' }
  ],
  budget: [
    { id: 1, trip_id: 1, total_budget: 60000, spent_so_far: 40400, currency: '₹' }
  ],
  cost_breakdown: [
    { id: 1, trip_id: 1, category: 'stay', estimated_cost: 25000, actual_cost: 22000 },
    { id: 1, trip_id: 1, category: 'food', estimated_cost: 15000, actual_cost: 12000 }
  ],
  odoo_sync: []
};

let userCounter = 2;
let tripCounter = 2;
let stopCounter = 2;
let activityCounter = 2;

async function query(text, params = []) {
  if (!useInMemoryFallback) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
        if (!useInMemoryFallback) {
          console.warn('[Database] PostgreSQL connection unavailable. Switching to in-memory demo store.');
          useInMemoryFallback = true;
        }
      } else {
        throw err;
      }
    }
  }

  // In-Memory Fallback Executor
  const normalizedText = text.trim().toUpperCase();

  if (normalizedText.includes('INSERT INTO USERS')) {
    const user = {
      id: userCounter++,
      name: params[0],
      email: params[1],
      password_hash: params[2],
      travel_preferences: JSON.parse(params[3] || '{}'),
      created_at: new Date().toISOString()
    };
    memoryStore.users.push(user);
    return { rows: [user] };
  }

  if (normalizedText.includes('SELECT * FROM USERS WHERE EMAIL =') || normalizedText.includes('SELECT ID FROM USERS WHERE EMAIL =')) {
    const found = memoryStore.users.filter(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
    return { rows: found };
  }

  if (normalizedText.includes('INSERT INTO TRIPS')) {
    const trip = {
      id: tripCounter++,
      user_id: params[0],
      name: params[1],
      description: params[2],
      start_date: params[3],
      end_date: params[4],
      cover_photo_url: params[5],
      is_public: false,
      status: params[6] || 'draft',
      created_at: new Date().toISOString()
    };
    memoryStore.trips.push(trip);
    return { rows: [trip] };
  }

  if (normalizedText.includes('SELECT T.*, B.TOTAL_BUDGET')) {
    let matchedTrips = memoryStore.trips;
    if (normalizedText.includes('WHERE T.USER_ID =')) {
      const userId = params[0];
      if (userId) matchedTrips = memoryStore.trips.filter(t => t.user_id === Number(userId));
    } else {
      const tripId = params[0];
      if (tripId) matchedTrips = memoryStore.trips.filter(t => t.id === Number(tripId));
    }
    const result = matchedTrips.map(t => {
      const b = memoryStore.budget.find(bg => bg.trip_id === t.id) || { total_budget: 60000, spent_so_far: 0, currency: '₹' };
      return { ...t, ...b };
    });
    return { rows: result };
  }

  if (normalizedText.includes('SELECT * FROM TRIPS WHERE ID =')) {
    const found = memoryStore.trips.filter(t => t.id === Number(params[0]));
    return { rows: found };
  }

  if (normalizedText.includes('INSERT INTO BUDGET')) {
    const b = { id: Date.now(), trip_id: params[0], total_budget: params[1], spent_so_far: params[2], currency: params[3] };
    memoryStore.budget.push(b);
    return { rows: [b] };
  }

  if (normalizedText.includes('UPDATE BUDGET SET SPENT_SO_FAR =')) {
    const bg = memoryStore.budget.find(b => b.trip_id === Number(params[1]));
    if (bg) bg.spent_so_far = params[0];
    return { rows: bg ? [bg] : [] };
  }

  if (normalizedText.includes('INSERT INTO STOPS')) {
    const stop = { id: stopCounter++, trip_id: params[0], city: params[1], country: params[2], start_date: params[3], order_index: params[4] };
    memoryStore.stops.push(stop);
    return { rows: [stop] };
  }

  if (normalizedText.includes('INSERT INTO ACTIVITIES')) {
    const act = { id: activityCounter++, stop_id: params[0], name: params[1], description: params[2], type: params[3], cost: params[4], duration: params[5], time_slot: params[6], address: params[7] };
    memoryStore.activities.push(act);
    return { rows: [act] };
  }

  if (normalizedText.includes('SELECT * FROM STOPS WHERE TRIP_ID =')) {
    const stops = memoryStore.stops.filter(s => s.trip_id === Number(params[0]));
    return { rows: stops };
  }

  if (normalizedText.includes('SELECT * FROM ACTIVITIES WHERE STOP_ID =')) {
    const acts = memoryStore.activities.filter(a => a.stop_id === Number(params[0]));
    return { rows: acts };
  }

  if (normalizedText.includes('DELETE FROM STOPS WHERE TRIP_ID =')) {
    memoryStore.stops = memoryStore.stops.filter(s => s.trip_id !== Number(params[0]));
    return { rows: [] };
  }

  if (normalizedText.includes('INSERT INTO ODOO_SYNC')) {
    const sync = { id: Date.now(), trip_id: params[0], odoo_record_id: params[1], odoo_record_type: params[2], sync_status: params[3], error_message: params[4], last_sync_at: new Date().toISOString() };
    memoryStore.odoo_sync.push(sync);
    return { rows: [sync] };
  }

  if (normalizedText.includes('SELECT * FROM ODOO_SYNC WHERE TRIP_ID =')) {
    const syncs = memoryStore.odoo_sync.filter(s => s.trip_id === Number(params[0]));
    return { rows: syncs };
  }

  if (normalizedText.includes('SELECT * FROM BUDGET WHERE TRIP_ID =')) {
    const b = memoryStore.budget.filter(bg => bg.trip_id === Number(params[0]));
    return { rows: b };
  }

  if (normalizedText.includes('SELECT * FROM COST_BREAKDOWN WHERE TRIP_ID =')) {
    const cb = memoryStore.cost_breakdown.filter(c => c.trip_id === Number(params[0]));
    return { rows: cb };
  }

  return { rows: [] };
}

module.exports = {
  query,
  pool,
  getInMemoryStore: () => memoryStore,
};
