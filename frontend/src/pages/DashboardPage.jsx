import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { mockDestinations } from '../services/mockData';
import AITripGeneratorModal from '../components/AITripGeneratorModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const { trips } = useTrips();
  const navigate = useNavigate();
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [generating] = useState(false);

  const upcomingTrips = trips.filter((t) => t.status === 'upcoming' || t.status === 'planning');

  const handleGenerateIdeas = () => {
    setShowAIGenerator(true);
  };

  // Dynamic budget calculations
  const totalAllocated = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalSpent = trips.reduce((sum, t) => sum + (t.spent || 0), 0);
  const totalDays = trips.reduce((sum, t) => {
    if (!t.startDate || !t.endDate) return sum;
    const diff = Math.abs(new Date(t.endDate) - new Date(t.startDate));
    return sum + Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }, 0);
  const avgCostPerDay = totalDays > 0 ? Math.round(totalSpent / totalDays) : 0;
  const budgetUtilizationPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* ── Left Sidebar ── */}
      <aside className="hidden lg:flex flex-col col-span-3 gap-5">
        {/* Welcome Widget */}
        <div className="bg-white p-6 rounded-2xl shadow-ambient-md border border-[#c3c6d7]/25">
          <h1 className="text-xl font-black text-[#1E1E24] mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-[#666D7A] mb-6">Where is your next destination?</p>
          <div className="flex flex-col gap-3">
            <Link to="/trips" className="w-full bg-[#0288d1] hover:bg-[#01579b] text-white rounded-xl py-3 px-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
              <span className="material-symbols-outlined text-xl">flight_takeoff</span>Plan New Trip
            </Link>
            <Link to="/explore" className="w-full bg-[#e1f5fe] text-[#0288d1] rounded-xl py-3 px-4 text-sm font-bold hover:bg-[#0288d1] hover:text-white transition-all flex items-center justify-center gap-2 border border-[#0288d1]/25">
              <span className="material-symbols-outlined text-xl">explore</span>Explore Destinations
            </Link>
            <Link to="/budget" className="w-full bg-[#eceef0] text-[#666D7A] rounded-xl py-3 px-4 text-sm font-semibold hover:bg-[#e1e2e5] transition-colors flex items-center justify-center gap-2 border border-[#c3c6d7]/50">
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>Check Budget
            </Link>
          </div>
        </div>

        {/* Travel Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-ambient-md border border-[#c3c6d7]/20">
          <h3 className="text-xs font-bold text-[#666D7A] uppercase tracking-wider mb-4">Travel Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#e1f5fe] border border-[#0288d1]/20">
              <span className="text-3xl font-extrabold text-[#0288d1]">{user?.countriesVisited || 0}</span>
              <p className="text-xs font-semibold text-[#666D7A] mt-1">Destinations</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#c3c6d7]/20">
              <span className="text-3xl font-extrabold text-[#1E1E24]">{trips.length}</span>
              <p className="text-xs font-semibold text-[#666D7A] mt-1">Trips Planned</p>
            </div>
          </div>
        </div>

        {/* Budget Highlights Box */}
        <div className="bg-white p-6 rounded-2xl shadow-ambient-md border border-[#c3c6d7]/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-[#666D7A] uppercase tracking-wider">Budget Highlights</h3>
            <Link to="/budget" className="text-xs font-bold text-[#0288d1] hover:underline">Details</Link>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#666D7A]">
              <span>Total Spent: ${totalSpent.toLocaleString()}</span>
              <span>Allocated: ${totalAllocated.toLocaleString()}</span>
            </div>
            <div className="w-full bg-[#e1f5fe] h-2.5 rounded-full overflow-hidden border border-[#0288d1]/20">
              <div
                className="bg-[#0288d1] h-full rounded-full"
                style={{ width: `${Math.min(budgetUtilizationPct, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#666D7A] pt-1">Avg. Cost per day: <strong className="text-[#1E1E24]">${avgCostPerDay}</strong></p>
          </div>
        </div>

        {/* AI Travel Inspiration Box */}
        <div className="bg-gradient-to-br from-[#0288d1] to-[#01579b] p-6 rounded-2xl text-white shadow-ambient-high relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <span className="material-symbols-outlined" style={{ fontSize: 110 }}>temple_hindu</span>
          </div>
          <div className="flex items-center gap-2 text-[#b2ebf2] text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            <span>AI Itinerary Generator</span>
          </div>
          <h4 className="text-base font-bold text-white mb-1.5">Personalized Divine Yatras</h4>
          <p className="text-xs text-white/80 mb-4">
            Let Safar-sutra AI craft the perfect day-by-day temple visits, Aarti timings, and travel routes.
          </p>
          <button
            onClick={handleGenerateIdeas}
            disabled={generating}
            className="bg-white text-[#0288d1] hover:bg-white/90 text-xs font-bold px-4 py-2.5 rounded-full w-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Launch AI Itinerary Builder</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="col-span-1 lg:col-span-9 flex flex-col gap-10">
        {/* Mobile Welcome */}
        <div className="lg:hidden">
          <h1 className="text-3xl font-black text-[#1E1E24]">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-base text-[#666D7A] mt-1">Where is your next destination?</p>
        </div>

        {/* Upcoming Trips */}
        <section>
          <div className="flex justify-between items-end mb-5">
            <h2 className="text-2xl font-black text-[#1E1E24]">Upcoming Trips</h2>
            <Link to="/trips" className="text-sm font-bold text-[#0288d1] hover:underline">View all</Link>
          </div>
          {upcomingTrips.length === 0 ? (
            <div className="bg-white rounded-[28px] border-2 border-dashed border-[#c3c6d7]/50 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-[#666D7A] mb-3 block">flight_takeoff</span>
              <p className="text-[#1e1e24] font-bold text-lg mb-1">No trips planned yet</p>
              <p className="text-[#666d7a] text-sm mb-4">Start planning your first adventure!</p>
              <Link to="/trips" className="inline-flex items-center gap-2 bg-[#0288d1] text-white rounded-full px-5 py-2.5 text-sm font-bold hover:bg-[#01579b] transition-colors">
                <span className="material-symbols-outlined text-lg">add</span>Plan New Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingTrips.slice(0, 4).map(trip => (
                <TripHeroCard key={trip.id} trip={trip} onClick={() => navigate(`/trips/${trip.id}`)} />
              ))}
            </div>
          )}
        </section>

        {/* Recommended Destinations Section */}
        <section>
          <h2 className="text-2xl font-black text-[#1E1E24] mb-5">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mockDestinations.slice(0, 3).map(dest => (
              <DestinationCard key={dest.id} dest={dest} onClick={() => navigate(`/explore?search=${dest.name.split(',')[0]}`)} />
            ))}
          </div>
        </section>
      </main>

      {/* AI Trip Generator Modal */}
      {showAIGenerator && (
        <AITripGeneratorModal
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}

function TripHeroCard({ trip, onClick }) {
  return (
    <div
      className="group relative rounded-[28px] overflow-hidden shadow-ambient-md cursor-pointer h-[300px] hover:shadow-ambient-high transition-shadow"
      onClick={onClick}
    >
      <img
        src={trip.coverImage}
        alt={trip.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Status Badge */}
      <div className="absolute top-4 right-4 bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-bold text-white">
          {trip.daysUntil ? `In ${trip.daysUntil} days` : trip.status}
        </span>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 p-5 w-full">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs font-semibold text-white/80 mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">calendar_today</span>
              {trip.startDate} – {trip.endDate}
            </p>
            <h3 className="text-xl font-bold text-white">{trip.name}</h3>
          </div>
          <button className="w-9 h-9 rounded-full bg-[#0288d1] flex items-center justify-center text-white hover:bg-[#01579b] transition-colors shadow-md">
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-white">
            <span>Planning Progress</span>
            <span>{trip.progress}%</span>
          </div>
          <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0288d1] h-full rounded-full transition-all" style={{ width: `${trip.progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DestinationCard({ dest, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[24px] p-4 shadow-ambient-md border border-[#c3c6d7]/20 hover:-translate-y-1 hover:shadow-ambient-high transition-all duration-300 cursor-pointer"
    >
      <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4">
        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
        {dest.badge && (
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm ${
            dest.badgeVariant === 'secondary' ? 'bg-[#0288d1]/95 text-white' : 'bg-white/95 text-[#1e1e24]'
          }`}>
            {dest.badge}
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-bold text-[#1E1E24]">{dest.name}</h3>
          <p className="text-xs text-[#666D7A] flex items-center gap-1 mt-1 font-semibold">
            <span className="material-symbols-outlined text-sm">wb_sunny</span>Best: {dest.bestTime}
          </p>
        </div>
        <div className="bg-[#e1f5fe] text-[#0288d1] px-2 py-1 rounded-lg text-xs font-extrabold">{dest.priceLevel}</div>
      </div>
    </div>
  );
}
