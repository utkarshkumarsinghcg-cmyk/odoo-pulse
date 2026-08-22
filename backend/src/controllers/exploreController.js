/**
 * Explore Controller
 * Destinations and Activities search & GPS distance calculation
 */

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const DESTINATIONS = [
  {
    id: 1,
    name: 'Varanasi (Kashi), Uttar Pradesh',
    country: 'India',
    region: 'North India',
    bestTime: 'Oct – Mar',
    priceLevel: '$$',
    category: 'Spiritual',
    badge: 'Sacred Yatra',
    lat: 25.3176,
    lng: 82.9739,
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Ayodhya, Uttar Pradesh',
    country: 'India',
    region: 'North India',
    bestTime: 'Oct – Mar',
    priceLevel: '$$',
    category: 'Spiritual',
    badge: 'Ram Janmabhoomi',
    badgeVariant: 'secondary',
    lat: 26.7922,
    lng: 82.1998,
    image: 'https://images.unsplash.com/photo-1609946782782-96c21e6c3e98?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Jaipur, Rajasthan',
    country: 'India',
    region: 'North India',
    bestTime: 'Nov – Feb',
    priceLevel: '$$$',
    category: 'Heritage',
    badge: 'Pink City',
    lat: 26.9124,
    lng: 75.7873,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Rishikesh & Haridwar, Uttarakhand',
    country: 'India',
    region: 'North India',
    bestTime: 'Sep – Apr',
    priceLevel: '$$',
    category: 'Spiritual',
    badge: 'Yoga Capital',
    lat: 30.0869,
    lng: 78.2676,
    image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: 'Swaraj Dweep (Havelock), Andaman',
    country: 'India',
    region: 'Islands',
    bestTime: 'Oct – May',
    priceLevel: '$$$$',
    category: 'Nature',
    badge: 'Radhanagar Beach',
    badgeVariant: 'secondary',
    lat: 11.9699,
    lng: 92.9841,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
  },
];

const ACTIVITIES = [
  {
    id: 201,
    name: 'Dashashwamedh Ghat Evening Ganga Aarti',
    city: 'Varanasi',
    category: 'Spiritual',
    cost: 0,
    duration: '90',
    description: 'Mesmerizing evening ritual of brass lamps, hymns, and Vedic chants.',
    lat: 25.3057,
    lng: 83.0104,
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 202,
    name: 'Shri Ram Janmabhoomi Mandir Darshan',
    city: 'Ayodhya',
    category: 'Spiritual',
    cost: 0,
    duration: '120',
    description: 'Darshan at the newly consecrated grand temple complex.',
    lat: 26.7922,
    lng: 82.1998,
    image: 'https://images.unsplash.com/photo-1609946782782-96c21e6c3e98?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 203,
    name: 'Amber Fort Light & Sound Show',
    city: 'Jaipur',
    category: 'Heritage',
    cost: 250,
    duration: '60',
    description: 'Relive 600 years of royal Kachwaha Rajput history under starry skies.',
    lat: 26.9855,
    lng: 75.8513,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&auto=format&fit=crop&q=80',
  },
];

async function getDestinations(req, res, next) {
  try {
    const { search, region, price, category, userLat, userLng } = req.query;

    let items = DESTINATIONS.map(d => {
      let distanceKm = null;
      if (userLat && userLng) {
        distanceKm = calculateDistanceKm(Number(userLat), Number(userLng), d.lat, d.lng);
      }
      return { ...d, distanceKm };
    });

    let filtered = items.filter(d => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.country.toLowerCase().includes(search.toLowerCase())) return false;
      if (region && region !== 'All' && d.region !== region) return false;
      if (price && price !== 'All' && d.priceLevel !== price) return false;
      if (category && category !== 'All' && d.category !== category) return false;
      return true;
    });

    if (userLat && userLng) {
      filtered.sort((a, b) => (a.distanceKm || 99999) - (b.distanceKm || 99999));
    }

    res.json({ destinations: filtered });
  } catch (error) {
    next(error);
  }
}

async function getActivities(req, res, next) {
  try {
    const { search, category, city } = req.query;

    let filtered = ACTIVITIES.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.category.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && category !== 'All' && a.category.toLowerCase() !== category.toLowerCase()) return false;
      if (city && a.city.toLowerCase() !== city.toLowerCase()) return false;
      return true;
    });

    res.json({ activities: filtered });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDestinations, getActivities };
