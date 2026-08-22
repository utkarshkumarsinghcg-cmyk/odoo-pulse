import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { tripsApi } from '../services/api';

export default function SharedItineraryPage() {
  const { id, token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  const token = routeToken || queryToken;

  const { getTripById } = useTrips();
  const localTrip = getTripById(id);

  const [trip, setTrip] = useState(localTrip);
  const [loading, setLoading] = useState(!localTrip);

  useEffect(() => {
    async function loadSharedTrip() {
      if (token) {
        setLoading(true);
        try {
          const res = await tripsApi.getShared(token);
          if (res.trip) {
            setTrip({
              id: res.trip.id,
              name: res.trip.name,
              description: res.trip.description,
              startDate: res.trip.start_date,
              endDate: res.trip.end_date,
              coverImage: res.trip.cover_photo_url || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
              status: res.trip.status || 'confirmed',
              stops: (res.trip.stops || []).map(s => s.city),
              days: (res.trip.stops || []).map((s, idx) => ({
                day: idx + 1,
                city: s.city,
                activities: (s.activities || []).map(a => ({
                  id: a.id,
                  name: a.name,
                  time: a.time_slot || '10:00',
                  cost: Number(a.cost) || 0,
                  category: a.type || 'Sightseeing',
                }))
              }))
            });
          }
        } catch (err) {
          console.warn('Could not load trip from token API, fallback to local:', err.message);
        } finally {
          setLoading(false);
        }
      } else if (localTrip) {
        setTrip(localTrip);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }

    loadSharedTrip();
  }, [token, id, localTrip]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Public link copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: trip?.name, url: window.location.href });
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4 bg-[#FAF7F2]">
        <span className="material-symbols-outlined text-4xl text-[#4A2E18] animate-spin">progress_activity</span>
        <p className="text-xs text-[#8A715F] font-bold">Loading public itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4 bg-[#FAF7F2]">
        <span className="material-symbols-outlined text-6xl text-[#8A715F]">temple_hindu</span>
        <p className="text-[#6B5646] font-bold">Itinerary not found or link has expired.</p>
        <Link to="/login" className="text-[#4A2E18] underline text-xs font-bold">Go to GlobeTrotter Home</Link>
      </div>
    );
  }

  const totalCost = (trip.days || []).reduce((sum, d) => sum + (d.activities || []).reduce((s, a) => s + (a.cost || 0), 0), 0);
  const totalActivities = (trip.days || []).reduce((s, d) => s + (d.activities?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Public Header */}
      <header className="bg-white border-b border-[#EADBCE] px-4 md:px-12 py-4 flex items-center justify-between max-w-[1440px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0057d9] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
          </div>
          <div>
            <span className="text-xl font-black text-[#191c1e] tracking-tight">GlobeTrotter</span>
            <p className="text-[10px] text-[#8A715F] font-semibold">Public Shared Itinerary</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs text-[#0057d9] font-bold hover:underline">Sign In</Link>
          <Link to="/signup" className="bg-[#0057d9] hover:bg-[#0041a7] text-white rounded-xl px-4 py-2 text-xs font-bold shadow-xs">
            Join Free
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-80 mb-8 border border-[#EADBCE] shadow-warm-lg">
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white">
            <div>
              <span className="bg-[#fe7944] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                {trip.status}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FFFDF9]">{trip.name}</h1>
              <p className="text-xs text-[#EADBCE] mt-1">{trip.startDate} – {trip.endDate} • {trip.stops?.join(', ')}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold border border-white/30 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Duration', value: `${trip.days?.length || 0} Days`, icon: 'calendar_month' },
            { label: 'Destinations', value: `${trip.stops?.length || 0} Cities`, icon: 'location_on' },
            { label: 'Activities', value: `${totalActivities} Items`, icon: 'attractions' },
            { label: 'Est. Budget', value: `$${totalCost.toLocaleString()}`, icon: 'payments' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-3xl p-4 border border-[#EADBCE] shadow-warm-md text-center">
              <span className="material-symbols-outlined text-[#0057d9] text-2xl">{icon}</span>
              <p className="text-xl font-bold text-[#2A180C] mt-1">{value}</p>
              <p className="text-xs text-[#8A715F]">{label}</p>
            </div>
          ))}
        </div>

        {/* Copy This Trip CTA */}
        <div className="bg-gradient-to-br from-[#0057d9] to-[#002b75] rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-white shadow-warm-lg">
          <div>
            <h3 className="text-lg font-bold text-[#FFFDF9]">Inspired by this itinerary?</h3>
            <p className="text-xs text-[#EADBCE] mt-0.5">Copy this exact itinerary to your GlobeTrotter account and personalize it!</p>
          </div>
          <Link
            to="/signup"
            className="bg-[#fe7944] hover:bg-[#e26431] text-white font-bold px-5 py-2.5 rounded-xl text-xs whitespace-nowrap shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">content_copy</span>
            <span>Copy This Trip</span>
          </Link>
        </div>

        {/* Day by Day */}
        <div className="space-y-6">
          {(trip.days || []).map((dayBlock) => (
            <div key={dayBlock.day} className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCE] shadow-warm-md">
              <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-[#EADBCE]">
                <div className="w-11 h-11 rounded-2xl bg-[#0057d9] text-white flex flex-col items-center justify-center font-bold">
                  <span className="text-[9px] text-white/80">Day</span>
                  <span className="text-sm leading-none">{dayBlock.day}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#191c1e]">{dayBlock.city || `Day ${dayBlock.day}`}</h3>
                  <p className="text-xs text-[#8A715F]">{dayBlock.activities?.length || 0} activities scheduled</p>
                </div>
              </div>

              <div className="space-y-3">
                {(dayBlock.activities || []).map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-3 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE]/80">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#fe7944] bg-white border border-[#EADBCE] px-2 py-0.5 rounded">
                        {act.time}
                      </span>
                      <span className="text-xs font-bold text-[#191c1e]">{act.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0057d9]">{act.cost > 0 ? `$${act.cost}` : 'Free'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
