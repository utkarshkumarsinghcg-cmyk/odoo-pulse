/**
 * Centralized API Client Service for GlobeTrotter Frontend
 * Connects React frontend to SafarSutra Express backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('gt_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.warn(`API Request failed for [${endpoint}]:`, error.message);
    throw error;
  }
}

export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, travel_preferences) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, travel_preferences }) }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
};

export const tripsApi = {
  getAll: () => request('/trips', { method: 'GET' }),
  getById: (id) => request(`/trips/${id}`, { method: 'GET' }),
  create: (tripData) => request('/trips', { method: 'POST', body: JSON.stringify(tripData) }),
  update: (id, updates) => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  generateItinerary: (id, params) => request(`/trips/${id}/generate`, { method: 'POST', body: JSON.stringify(params) }),
  reorder: (id, orderData) => request(`/trips/${id}/reorder`, { method: 'PUT', body: JSON.stringify(orderData) }),
  share: (id) => request(`/trips/${id}/share`, { method: 'POST' }),
  getShared: (token) => request(`/trips/share/${token}`, { method: 'GET' }),
  
  // Stops & Activities
  addStop: (tripId, stopData) => request(`/trips/${tripId}/stops`, { method: 'POST', body: JSON.stringify(stopData) }),
  deleteStop: (tripId, stopId) => request(`/trips/${tripId}/stops/${stopId}`, { method: 'DELETE' }),
  addActivity: (tripId, stopId, activityData) => request(`/trips/${tripId}/stops/${stopId}/activities`, { method: 'POST', body: JSON.stringify(activityData) }),
  deleteActivity: (activityId) => request(`/trips/activities/${activityId}`, { method: 'DELETE' }),
};

export const budgetApi = {
  get: (tripId) => request(`/trips/${tripId}/budget`, { method: 'GET' }),
  update: (tripId, budgetData) => request(`/trips/${tripId}/budget`, { method: 'PUT', body: JSON.stringify(budgetData) }),
};

export const exploreApi = {
  getDestinations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/explore/destinations${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/explore/activities${query ? `?${query}` : ''}`, { method: 'GET' });
  },
};

export const odooApi = {
  syncTrip: (tripId) => request(`/trips/${tripId}/sync-odoo`, { method: 'POST' }),
  getStatus: () => request('/odoo/status', { method: 'GET' }),
};

export const aiApi = {
  chat: (message, conversationHistory) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ message, conversationHistory }) }),
  generatePlan: (params) => request('/ai/generate-plan', { method: 'POST', body: JSON.stringify(params) }),
};

