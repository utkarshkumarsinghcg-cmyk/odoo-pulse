import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { ClipLoader } from 'react-spinners';

export default function MyTripsPage() {
  const { trips, loading, deleteTrip } = useTrips();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const filteredTrips = trips.filter((t) => filterStatus === 'all' || t.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader color="#4A2E18" loading={true} size={50} />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-12 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2A180C] tracking-tight">My Yatras & Trips</h1>
          <p className="text-sm text-[#6B5646] mt-1">Manage and review all your planned spiritual and holiday itineraries.</p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white p-1 rounded-2xl border border-[#EADBCE] shadow-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-[#4A2E18] text-[#FFFDF9]' : 'text-[#6B5646]'
            }`}
            title="Grid View"
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-[#4A2E18] text-[#FFFDF9]' : 'text-[#6B5646]'
            }`}
            title="List View"
          >
            <span className="material-symbols-outlined text-lg">view_list</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {['all', 'upcoming', 'planning', 'idea'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === st
                ? 'bg-[#4A2E18] text-[#FFFDF9] shadow-xs'
                : 'bg-white text-[#6B5646] border border-[#EADBCE] hover:border-[#4A2E18]'
            }`}
          >
            {st} ({trips.filter((t) => st === 'all' || t.status === st).length})
          </button>
        ))}
      </div>

      {/* Content Rendering */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-[#D8C6B6]">
          <span className="material-symbols-outlined text-5xl text-[#8A715F] mb-3">luggage</span>
          <h3 className="text-base font-bold text-[#2A180C]">No trips found for this category</h3>
          <p className="text-xs text-[#8A715F] mt-1">Start planning your next sacred yatra or adventure!</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#EADBCE] shadow-warm-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={trip.coverImage}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/50 text-white backdrop-blur-md">
                    {trip.status}
                  </span>
                  <p className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#E8C59A]">calendar_today</span>
                    {trip.startDate} – {trip.endDate}
                  </p>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-bold text-[#2A180C] mb-1 leading-snug">{trip.name}</h3>
                  <p className="text-xs text-[#6B5646] line-clamp-2 mb-3">{trip.description}</p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-[#8A715F] font-medium">
                    <span className="material-symbols-outlined text-sm text-[#C88A4B]">location_on</span>
                    <span>{trip.stops?.length || 0} Destinations: {trip.stops?.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-[#EADBCE]/60 flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => navigate(`/trips/${trip.id}/builder`)}
                  className="bg-[#FAF7F2] hover:bg-[#F5ECE1] border border-[#D8C6B6] text-[#4A2E18] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm text-[#C88A4B]">edit_calendar</span>
                  <span>Builder</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="bg-[#4A2E18] hover:bg-[#341F0E] text-[#FFFDF9] px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Trip"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-warm-md divide-y divide-[#EADBCE]">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={trip.coverImage} alt={trip.name} className="w-16 h-16 rounded-2xl object-cover border border-[#EADBCE]" />
                <div>
                  <h3 className="text-sm font-bold text-[#2A180C]">{trip.name}</h3>
                  <p className="text-xs text-[#8A715F]">{trip.startDate} to {trip.endDate} • {trip.stops?.join(', ')}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EADBCE] text-[#C88A4B] uppercase">
                    {trip.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/trips/${trip.id}/builder`)}
                  className="px-3.5 py-1.5 bg-[#FAF7F2] text-[#4A2E18] border border-[#D8C6B6] rounded-xl text-xs font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="px-4 py-1.5 bg-[#4A2E18] text-white rounded-xl text-xs font-bold"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
