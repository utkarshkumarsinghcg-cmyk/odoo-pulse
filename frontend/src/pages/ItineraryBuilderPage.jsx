import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { mockActivities } from '../services/mockData';

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTripById, updateTrip, generateAiItinerary } = useTrips();
  const trip = getTripById(id);

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [newCityName, setNewCityName] = useState('');
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '', time: '09:00', cost: 0, category: 'Spiritual', notes: '' });
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!trip) return;
    setAiGenerating(true);
    await generateAiItinerary(trip.id, {
      destination: trip.stops?.[0] || trip.name,
      days: 3,
      budget: trip.budget || 60000,
      interests: ['sightseeing', 'culture', 'food']
    });
    setAiGenerating(false);
  };


  if (!trip) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-[#2A180C]">Trip Not Found</h2>
        <button onClick={() => navigate('/trips')} className="mt-4 px-4 py-2 bg-[#4A2E18] text-white rounded-xl text-xs font-bold">
          Back to My Trips
        </button>
      </div>
    );
  }

  const days = trip.days || [];
  const currentDay = days[activeDayIndex] || { day: 1, city: trip.stops?.[0] || 'City', activities: [] };

  const handleAddStop = (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    const newDayNum = days.length + 1;
    const updatedDays = [
      ...days,
      { day: newDayNum, date: trip.startDate, city: newCityName.trim(), activities: [] },
    ];
    const updatedStops = Array.from(new Set([...(trip.stops || []), newCityName.trim()]));
    updateTrip(trip.id, { days: updatedDays, stops: updatedStops });
    setNewCityName('');
    setShowAddCityModal(false);
    setActiveDayIndex(updatedDays.length - 1);
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.name.trim()) return;
    const act = {
      id: Date.now(),
      name: newActivity.name.trim(),
      time: newActivity.time,
      cost: Number(newActivity.cost) || 0,
      category: newActivity.category,
      notes: newActivity.notes,
    };

    const updatedDays = [...days];
    if (!updatedDays[activeDayIndex]) {
      updatedDays[activeDayIndex] = { day: activeDayIndex + 1, city: trip.stops?.[0] || 'City', activities: [] };
    }
    updatedDays[activeDayIndex].activities = [...(updatedDays[activeDayIndex].activities || []), act];
    updateTrip(trip.id, { days: updatedDays });
    setNewActivity({ name: '', time: '09:00', cost: 0, category: 'Spiritual', notes: '' });
    setShowAddActivityModal(false);
  };

  const handleDeleteActivity = (actId) => {
    const updatedDays = [...days];
    if (updatedDays[activeDayIndex]) {
      updatedDays[activeDayIndex].activities = updatedDays[activeDayIndex].activities.filter((a) => a.id !== actId);
      updateTrip(trip.id, { days: updatedDays });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-12 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-warm-md">
        <div className="flex items-center gap-4">
          <img src={trip.coverImage} alt={trip.name} className="w-16 h-16 rounded-2xl object-cover border border-[#EADBCE]" />
          <div>
            <span className="text-[11px] font-bold text-[#C88A4B] uppercase tracking-wider">Itinerary Builder</span>
            <h1 className="text-2xl font-extrabold text-[#2A180C] leading-tight">{trip.name}</h1>
            <p className="text-xs text-[#8A715F]">{trip.startDate} to {trip.endDate} • {trip.stops?.join(', ')}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleAiGenerate}
            disabled={aiGenerating}
            className="bg-[#0057d9] hover:bg-[#0041a7] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${aiGenerating ? 'animate-spin' : ''}`}>
              {aiGenerating ? 'progress_activity' : 'auto_awesome'}
            </span>
            <span>{aiGenerating ? 'Generating...' : 'AI Auto-Generate'}</span>
          </button>
          <button
            onClick={() => setShowAddCityModal(true)}
            className="bg-[#FAF7F2] hover:bg-[#F5ECE1] text-[#4A2E18] border border-[#D8C6B6] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#C88A4B]">add_location_alt</span>
            <span>Add City / Stop</span>
          </button>
          <button
            onClick={() => navigate(`/trips/${trip.id}`)}
            className="bg-[#4A2E18] hover:bg-[#341F0E] text-[#FFFDF9] px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#E8C59A]">visibility</span>
            <span>View Itinerary</span>
          </button>
        </div>

      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Day / Stop Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#EADBCE] shadow-warm-md">
            <h2 className="text-sm font-bold text-[#2A180C] uppercase tracking-wider mb-3">Day by Day Stops</h2>
            <div className="space-y-2">
              {days.map((d, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDayIndex(index)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${
                    activeDayIndex === index
                      ? 'bg-[#4A2E18] text-[#FFFDF9] border-[#4A2E18] shadow-sm'
                      : 'bg-[#FAF7F2] text-[#5A4536] border-[#EADBCE] hover:border-[#4A2E18]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                      activeDayIndex === index ? 'bg-[#E8C59A] text-[#2A180C]' : 'bg-white text-[#4A2E18]'
                    }`}>
                      {d.day}
                    </span>
                    <div>
                      <p className="text-xs font-bold">{d.city || `Day ${d.day}`}</p>
                      <p className={`text-[10px] ${activeDayIndex === index ? 'text-[#EADBCE]' : 'text-[#8A715F]'}`}>
                        {d.activities?.length || 0} activities planned
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Day Activities List & Add Actions (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-warm-md">
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-[#EADBCE]">
            <div>
              <span className="text-[11px] font-bold text-[#C88A4B] uppercase tracking-wider">Day {currentDay.day} Timeline</span>
              <h2 className="text-xl font-bold text-[#2A180C]">{currentDay.city || 'Select City'}</h2>
            </div>
            <button
              onClick={() => setShowAddActivityModal(true)}
              className="bg-[#4A2E18] hover:bg-[#341F0E] text-[#FFFDF9] px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#E8C59A]">add</span>
              <span>Add Activity</span>
            </button>
          </div>

          {/* Activities list */}
          {(!currentDay.activities || currentDay.activities.length === 0) ? (
            <div className="text-center py-12 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#D8C6B6]">
              <span className="material-symbols-outlined text-4xl text-[#8A715F] mb-2">playlist_add</span>
              <p className="text-xs font-bold text-[#5A4536]">No activities added for Day {currentDay.day} yet.</p>
              <p className="text-[11px] text-[#8A715F] mt-1">Click "+ Add Activity" to schedule temple Darshan, tours, or meals.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {currentDay.activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] hover:border-[#4A2E18] transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#4A2E18]">
                      <span className="material-symbols-outlined text-xl">temple_hindu</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#C88A4B] bg-white border border-[#EADBCE] px-2 py-0.5 rounded">
                          {act.time}
                        </span>
                        <h4 className="text-xs font-bold text-[#2A180C]">{act.name}</h4>
                      </div>
                      {act.notes && <p className="text-[11px] text-[#6B5646] mt-0.5">{act.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#4A2E18]">
                      {act.cost > 0 ? `$${act.cost}` : 'Free'}
                    </span>
                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove activity"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add City / Stop */}
      {showAddCityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#EADBCE] shadow-2xl">
            <h3 className="text-lg font-bold text-[#2A180C] mb-1">Add City / Stop</h3>
            <p className="text-xs text-[#8A715F] mb-4">Enter the destination city name to append to the itinerary.</p>
            <form onSubmit={handleAddStop} className="space-y-4">
              <input
                type="text"
                placeholder="e.g. Varanasi, Rishikesh, Jaipur..."
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4A2E18]/15"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCityModal(false)}
                  className="px-4 py-2 bg-[#FAF7F2] text-[#5A4536] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A2E18] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Activity */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#EADBCE] shadow-2xl">
            <h3 className="text-lg font-bold text-[#2A180C] mb-1">Add Activity to Day {currentDay.day}</h3>
            <p className="text-xs text-[#8A715F] mb-4">Schedule a temple visit, Aarti, boat tour, or dining experience.</p>
            <form onSubmit={handleAddActivity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#5A4536] mb-1">Activity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Morning Aarti at Temple"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5A4536] mb-1">Time</label>
                  <input
                    type="time"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity((p) => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A4536] mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    value={newActivity.cost}
                    onChange={(e) => setNewActivity((p) => ({ ...p, cost: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4536] mb-1">Category</label>
                <select
                  value={newActivity.category}
                  onChange={(e) => setNewActivity((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C]"
                >
                  {['Spiritual', 'Heritage', 'Culture', 'Nature', 'Food & Dining', 'Adventure'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4536] mb-1">Notes / Description</label>
                <textarea
                  rows="2"
                  placeholder="Dress code, ticket info, or meeting point..."
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 bg-[#FAF7F2] text-[#5A4536] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A2E18] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
