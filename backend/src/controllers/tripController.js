const crypto = require('crypto');
const db = require('../config/db');
const { generateItinerary } = require('../services/geminiService');

/**
 * GET /api/trips
 * Fetch trips for authenticated user
 */
async function getTrips(req, res, next) {
  try {
    const userId = req.user.id;
    const tripsRes = await db.query(
      `SELECT t.*, b.total_budget, b.spent_so_far, b.currency
       FROM trips t
       LEFT JOIN budget b ON b.trip_id = t.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    const trips = [];
    for (let row of tripsRes.rows) {
      const stopsRes = await db.query(
        `SELECT * FROM stops WHERE trip_id = $1 ORDER BY order_index ASC`,
        [row.id]
      );
      const stops = stopsRes.rows;
      for (let stop of stops) {
        const actRes = await db.query(
          `SELECT * FROM activities WHERE stop_id = $1 ORDER BY time_slot ASC`,
          [stop.id]
        );
        stop.activities = actRes.rows;
      }
      trips.push({ ...row, stops });
    }

    res.json({
      trips,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/trips
 * Create new trip
 */
async function createTrip(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, description, start_date, end_date, budget = 60000, currency = '₹', cover_photo_url } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Trip name, start_date, and end_date are required.' });
    }

    const tripRes = await db.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, name.trim(), description || '', start_date, end_date, cover_photo_url || null, 'draft']
    );
    const trip = tripRes.rows[0];

    // Create associated budget row
    await db.query(
      `INSERT INTO budget (trip_id, total_budget, spent_so_far, currency)
       VALUES ($1, $2, $3, $4)`,
      [trip.id, Number(budget) || 60000, 0, currency]
    );

    res.status(201).json({
      message: 'Trip created successfully',
      trip: {
        ...trip,
        total_budget: Number(budget),
        spent_so_far: 0,
        currency,
        stops: []
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trips/:id
 * Get full itinerary details (trip + stops + activities + budget + sync status)
 */
async function getTripById(req, res, next) {
  try {
    const tripId = req.params.id;

    // Fetch trip & budget
    const tripRes = await db.query(
      `SELECT t.*, b.total_budget, b.spent_so_far, b.currency
       FROM trips t
       LEFT JOIN budget b ON b.trip_id = t.id
       WHERE t.id = $1`,
      [tripId]
    );

    if (tripRes.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }
    const trip = tripRes.rows[0];

    // Check ownership if user logged in
    if (req.user && trip.user_id !== req.user.id && !trip.is_public) {
      return res.status(403).json({ error: 'Access denied to this trip.' });
    }

    // Fetch stops
    const stopsRes = await db.query(
      `SELECT * FROM stops WHERE trip_id = $1 ORDER BY order_index ASC, start_date ASC`,
      [tripId]
    );

    // Fetch activities for all stops
    const stops = stopsRes.rows;
    for (let stop of stops) {
      const activitiesRes = await db.query(
        `SELECT * FROM activities WHERE stop_id = $1 ORDER BY time_slot ASC`,
        [stop.id]
      );
      stop.activities = activitiesRes.rows;
    }

    // Fetch budget cost breakdown
    const breakdownRes = await db.query(
      `SELECT * FROM cost_breakdown WHERE trip_id = $1`,
      [tripId]
    );

    // Fetch latest Odoo sync status
    const syncRes = await db.query(
      `SELECT * FROM odoo_sync WHERE trip_id = $1 ORDER BY last_sync_at DESC LIMIT 1`,
      [tripId]
    );

    res.json({
      trip: {
        ...trip,
        stops,
        cost_breakdown: breakdownRes.rows,
        odoo_sync: syncRes.rows[0] || null,
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/trips/:id
 */
async function updateTrip(req, res, next) {
  try {
    const tripId = req.params.id;
    const userId = req.user.id;
    const { name, description, start_date, end_date, cover_photo_url, is_public, status, days } = req.body;

    const check = await db.query('SELECT user_id FROM trips WHERE id = $1', [tripId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Trip not found.' });
    if (check.rows[0].user_id !== userId) return res.status(403).json({ error: 'Not authorized.' });

    const updated = await db.query(
      `UPDATE trips
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           cover_photo_url = COALESCE($5, cover_photo_url),
           is_public = COALESCE($6, is_public),
           status = COALESCE($7, status)
       WHERE id = $8 RETURNING *`,
      [name, description, start_date, end_date, cover_photo_url, is_public, status, tripId]
    );

    if (days && Array.isArray(days)) {
      // Clear existing stops and activities
      await db.query('DELETE FROM stops WHERE trip_id = $1', [tripId]);
      
      let totalSpent = 0;
      for (let dayData of days) {
        const stopRes = await db.query(
          `INSERT INTO stops (trip_id, city, country, start_date, order_index)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [tripId, dayData.city, 'Global', dayData.date || start_date || '2026-10-15', dayData.day]
        );
        const stopId = stopRes.rows[0].id;

        if (dayData.activities && Array.isArray(dayData.activities)) {
          for (let act of dayData.activities) {
            const costVal = Number(act.cost) || 0;
            totalSpent += costVal;
            await db.query(
              `INSERT INTO activities (stop_id, name, description, type, cost, duration, time_slot, address)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [stopId, act.name, act.notes || act.description || '', act.category || act.type || 'Spiritual', costVal, '1.5h', act.time || act.time_slot || '10:00', dayData.city]
            );
          }
        }
      }
      
      // Update budget spent
      await db.query(
        `UPDATE budget SET spent_so_far = $1 WHERE trip_id = $2`,
        [totalSpent, tripId]
      );
    }

    res.json({ message: 'Trip updated successfully', trip: updated.rows[0] });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/trips/:id
 */
async function deleteTrip(req, res, next) {
  try {
    const tripId = req.params.id;
    const userId = req.user.id;

    const check = await db.query('SELECT user_id FROM trips WHERE id = $1', [tripId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Trip not found.' });
    if (check.rows[0].user_id !== userId) return res.status(403).json({ error: 'Not authorized.' });

    await db.query('DELETE FROM trips WHERE id = $1', [tripId]);
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/trips/:id/generate
 * Generate AI itinerary using Gemini Flash-Lite and save stops/activities
 */
async function generateTripItinerary(req, res, next) {
  try {
    const tripId = req.params.id;
    const { destination, days = 3, interests = [], budget = 60000 } = req.body;

    const tripRes = await db.query('SELECT * FROM trips WHERE id = $1', [tripId]);
    if (tripRes.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const trip = tripRes.rows[0];
    const targetDestination = destination || trip.name || 'Kyoto, Japan';

    // Call Gemini AI service (or fallback)
    const aiResult = await generateItinerary({
      destination: targetDestination,
      days: Number(days) || 3,
      budget: Number(budget) || 60000,
      interests
    });

    // Clear existing stops/activities for clean regeneration
    await db.query('DELETE FROM stops WHERE trip_id = $1', [tripId]);

    // Insert stops and activities into database
    let totalSpent = 0;
    for (let dayData of aiResult.days) {
      const stopRes = await db.query(
        `INSERT INTO stops (trip_id, city, country, start_date, order_index)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          tripId,
          aiResult.destination.split(',')[0].trim(),
          aiResult.destination.split(',')[1]?.trim() || 'Global',
          trip.start_date,
          dayData.dayNumber
        ]
      );
      const stopId = stopRes.rows[0].id;

      for (let act of dayData.activities) {
        const costVal = Number(act.cost) || 0;
        totalSpent += costVal;
        await db.query(
          `INSERT INTO activities (stop_id, name, description, type, cost, duration, time_slot, address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [stopId, act.name, act.description, act.type || 'sightseeing', costVal, act.duration || '1.5h', act.time_slot || '10:00', act.address || targetDestination]
        );
      }
    }

    // Update budget spent
    await db.query(
      `UPDATE budget SET spent_so_far = $1 WHERE trip_id = $2`,
      [totalSpent, tripId]
    );

    // Update trip status to confirmed
    await db.query(`UPDATE trips SET status = 'confirmed' WHERE id = $1`, [tripId]);

    // Return populated itinerary
    const finalTrip = await getTripByIdInternal(tripId);
    res.json({
      message: 'Itinerary generated successfully',
      isFallback: aiResult.isFallback,
      itinerary: finalTrip
    });

  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/trips/:id/reorder
 * Reorder stops or activities for drag-and-drop
 */
async function reorderTrip(req, res, next) {
  try {
    const tripId = req.params.id;
    const { stopsOrder, activitiesOrder } = req.body;

    if (stopsOrder && Array.isArray(stopsOrder)) {
      for (let i = 0; i < stopsOrder.length; i++) {
        await db.query(
          'UPDATE stops SET order_index = $1 WHERE id = $2 AND trip_id = $3',
          [i + 1, stopsOrder[i], tripId]
        );
      }
    }

    if (activitiesOrder && Array.isArray(activitiesOrder)) {
      for (let i = 0; i < activitiesOrder.length; i++) {
        await db.query(
          'UPDATE activities SET time_slot = $1 WHERE id = $2',
          [`Slot ${i + 1}`, activitiesOrder[i]]
        );
      }
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/trips/:id/share
 * Generate public share link token
 */
async function shareTrip(req, res, next) {
  try {
    const tripId = req.params.id;
    const token = `share_${crypto.randomBytes(8).toString('hex')}`;

    await db.query(
      `UPDATE trips SET is_public = true, share_token = $1 WHERE id = $2`,
      [token, tripId]
    );

    res.json({
      message: 'Share link generated',
      shareToken: token,
      shareUrl: `/itinerary/view?token=${token}`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trips/share/:token
 */
async function getSharedTrip(req, res, next) {
  try {
    const token = req.params.token;
    const tripRes = await db.query('SELECT id FROM trips WHERE share_token = $1 AND is_public = true', [token]);

    if (tripRes.rows.length === 0) {
      return res.status(404).json({ error: 'Shared itinerary not found or made private.' });
    }

    req.params.id = tripRes.rows[0].id;
    return getTripById(req, res, next);
  } catch (error) {
    next(error);
  }
}

// Internal helper for fetching full trip object
async function getTripByIdInternal(tripId) {
  const tripRes = await db.query(
    `SELECT t.*, b.total_budget, b.spent_so_far, b.currency
     FROM trips t LEFT JOIN budget b ON b.trip_id = t.id WHERE t.id = $1`,
    [tripId]
  );
  const trip = tripRes.rows[0];
  const stopsRes = await db.query(`SELECT * FROM stops WHERE trip_id = $1 ORDER BY order_index ASC`, [tripId]);
  const stops = stopsRes.rows;
  for (let stop of stops) {
    const actRes = await db.query(`SELECT * FROM activities WHERE stop_id = $1`, [stop.id]);
    stop.activities = actRes.rows;
  }
  return { ...trip, stops };
}

module.exports = {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  generateTripItinerary,
  reorderTrip,
  shareTrip,
  getSharedTrip,
};
