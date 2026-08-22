import { createContext, useContext, useState, useEffect } from 'react';
import { tripsApi } from '../services/api';
import { useAuth } from './AuthContext';

const TripContext = createContext(null);

const mapBackendTripToFrontend = (backendTrip) => {
  if (!backendTrip) return null;
  return {
    ...backendTrip,
    startDate: backendTrip.start_date,
    endDate: backendTrip.end_date,
    budget: Number(backendTrip.total_budget) || Number(backendTrip.budget) || 0,
    spent: Number(backendTrip.spent_so_far) || Number(backendTrip.spent) || 0,
    coverImage: backendTrip.cover_photo_url || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=60',
    progress: backendTrip.progress !== undefined ? backendTrip.progress : 15,
    daysUntil: backendTrip.start_date ? Math.ceil((new Date(backendTrip.start_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
    stops: backendTrip.stops?.map(s => s.city) || [],
    days: backendTrip.stops?.map(stop => ({
      day: stop.order_index,
      city: stop.city,
      date: stop.start_date,
      activities: stop.activities?.map(act => ({
        id: act.id,
        name: act.name,
        time: act.time_slot,
        cost: Number(act.cost) || 0,
        category: act.type,
        notes: act.description
      })) || []
    })) || []
  };
};

export function TripProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  // Load trips from backend when user changes
  useEffect(() => {
    async function fetchTrips() {
      if (!user) {
        setTrips([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await tripsApi.getAll();
        if (Array.isArray(data.trips)) {
          const mappedTrips = data.trips.map(mapBackendTripToFrontend);
          setTrips(mappedTrips);
        } else {
          setTrips([]);
        }
      } catch (err) {
        console.warn('Failed to fetch trips, falling back to empty list', err);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addTrip = async (tripData) => {
    try {
      const backendData = {
        name: tripData.name,
        description: tripData.description,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        budget: tripData.budget || 60000,
        cover_photo_url: tripData.coverImage
      };
      const res = await tripsApi.create(backendData);
      if (res.trip) {
        const createdTrip = mapBackendTripToFrontend(res.trip);
        setTrips(prev => [createdTrip, ...prev]);
        showToast('Trip created successfully!');
        return createdTrip;
      }
    } catch (err) {
      console.error('Failed to create trip on backend:', err);
      showToast('Failed to create trip', 'error');
    }
  };

  const updateTrip = async (id, updates) => {
    try {
      // Map update fields to backend expectations
      const backendUpdates = {
        name: updates.name,
        description: updates.description,
        start_date: updates.startDate,
        end_date: updates.endDate,
        cover_photo_url: updates.coverImage,
        status: updates.status,
        days: updates.days // Supports stop/activities update in tripController
      };
      
      // Clean undefined keys
      Object.keys(backendUpdates).forEach(key => backendUpdates[key] === undefined && delete backendUpdates[key]);

      const res = await tripsApi.update(id, backendUpdates);
      if (res.trip) {
        // Fetch stops and activities to update frontend fully
        const fullTripRes = await tripsApi.getById(id);
        const updatedTrip = mapBackendTripToFrontend(fullTripRes.trip);
        setTrips(prev => prev.map(t => t.id === id ? updatedTrip : t));
        showToast('Trip updated!');
        return updatedTrip;
      }
    } catch (err) {
      console.error('Failed to update trip:', err);
      showToast('Failed to update trip', 'error');
    }
  };

  const deleteTrip = async (id) => {
    try {
      await tripsApi.delete(id);
      setTrips(prev => prev.filter(t => t.id !== id));
      showToast('Trip deleted.', 'info');
    } catch (err) {
      console.error('Failed to delete trip:', err);
      showToast('Failed to delete trip', 'error');
    }
  };

  const generateAiItinerary = async (id, params) => {
    try {
      const res = await tripsApi.generateItinerary(id, params);
      if (res.itinerary) {
        const mappedTrip = mapBackendTripToFrontend(res.itinerary);
        setTrips(prev => prev.map(t => t.id === id ? mappedTrip : t));
        showToast('Itinerary generated successfully!');
        return mappedTrip;
      }
    } catch (err) {
      console.error('Failed to generate AI itinerary:', err);
      showToast('Failed to generate itinerary', 'error');
    }
  };

  const addActivity = (tripId, dayIndex, activity) => {
    // Left for temporary optimistic UI update, but real edits go via updateTrip in builder
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const days = [...(t.days || [])];
      if (!days[dayIndex]) {
        days[dayIndex] = { day: dayIndex + 1, date: '', city: '', activities: [] };
      }
      days[dayIndex] = {
        ...days[dayIndex],
        activities: [...(days[dayIndex].activities || []), { id: Date.now(), ...activity }],
      };
      return { ...t, days };
    }));
  };

  const removeActivity = (tripId, dayIndex, activityId) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const days = [...(t.days || [])];
      if (days[dayIndex]) {
        days[dayIndex] = {
          ...days[dayIndex],
          activities: days[dayIndex].activities.filter(a => a.id !== activityId),
        };
      }
      return { ...t, days };
    }));
  };

  const getTripById = (id) => trips.find(t => t.id === Number(id));

  return (
    <TripContext.Provider value={{
      trips, loading, addTrip, updateTrip, deleteTrip,
      addActivity, removeActivity, getTripById, generateAiItinerary, toast,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTrips = () => useContext(TripContext);
