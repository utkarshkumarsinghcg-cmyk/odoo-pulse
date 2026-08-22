import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockDestinations } from '../services/mockData';

const PRESET_AVATARS = [
  { label: 'Spiritual Pilgrim', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { label: 'Mountain Explorer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Cultural Traveler', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: 'Global Explorer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { label: 'Yatra Seeker', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { label: 'Royal Traveler', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || 'Alex Johnson',
    email: user?.email || 'alex.traveler@gmail.com',
    language: 'English / Hindi',
    bio: user?.bio || 'Cultural traveler and sacred pilgrimage explorer.',
    avatar: user?.avatar || PRESET_AVATARS[2].url,
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  
  // Drag and Drop States
  const [isDragging, setIsDragging] = useState(false);
  const [modalDragging, setModalDragging] = useState(false);

  // Helper to process uploaded or dropped image file
  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result;
      if (base64Url) {
        setForm((prev) => ({ ...prev, avatar: base64Url }));
        updateUser({ avatar: base64Url });
        setShowPhotoModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle direct file input selection
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag and Drop Handlers for Main Profile Avatar Card
  const handleMainDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleMainDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleMainDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag and Drop Handlers for Modal Upload Area
  const handleModalDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalDragging(true);
  };

  const handleModalDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalDragging(false);
  };

  const handleModalDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSelectPreset = (url) => {
    setForm((prev) => ({ ...prev, avatar: url }));
    updateUser({ avatar: url });
    setShowPhotoModal(false);
  };

  const handleCustomUrlSubmit = (e) => {
    e.preventDefault();
    if (customPhotoUrl.trim()) {
      setForm((prev) => ({ ...prev, avatar: customPhotoUrl.trim() }));
      updateUser({ avatar: customPhotoUrl.trim() });
      setCustomPhotoUrl('');
      setShowPhotoModal(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#2A180C] tracking-tight">Profile & Preferences</h1>
        <p className="text-sm text-[#6B5646] mt-1">Manage your personal traveler information, photo, and privacy settings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 border-b border-[#EADBCE] pb-3">
        {[
          { key: 'profile', label: 'User Profile & Bio' },
          { key: 'saved', label: 'Saved Destinations Wishlist' },
          { key: 'preferences', label: 'Preferences & Notifications' },
          { key: 'privacy', label: 'Privacy & Security' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === t.key
                ? 'bg-[#4A2E18] text-[#FFFDF9] shadow-xs'
                : 'text-[#6B5646] hover:bg-[#FAF7F2]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-warm-md">
            {/* Profile Avatar Header with Drag & Drop */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-6 pb-6 border-b border-[#EADBCE]">
              <div className="flex items-center gap-5">
                <div
                  onDragOver={handleMainDragOver}
                  onDragLeave={handleMainDragLeave}
                  onDrop={handleMainDrop}
                  className={`relative group rounded-3xl p-1 transition-all ${
                    isDragging ? 'ring-4 ring-[#0057d9] bg-[#0057d9]/10 scale-105' : ''
                  }`}
                >
                  <img
                    src={form.avatar || user?.avatar || PRESET_AVATARS[2].url}
                    alt={user?.name}
                    className="w-24 h-24 rounded-3xl object-cover border-3 border-[#D4A373] shadow-md transition-transform group-hover:scale-102"
                  />
                  
                  {/* Hover or Drag Overlay */}
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className={`absolute inset-0 bg-black/50 rounded-3xl flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-xs font-bold ${
                      isDragging ? 'opacity-100 bg-[#0057d9]/80' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl mb-0.5">
                      {isDragging ? 'cloud_upload' : 'photo_camera'}
                    </span>
                    <span>{isDragging ? 'Drop Photo Here' : 'Change'}</span>
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#2A180C]">{user?.name}</h2>
                  <p className="text-xs text-[#8A715F]">{user?.email}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowPhotoModal(true)}
                      className="bg-[#FAF7F2] hover:bg-[#F5ECE1] text-[#4A2E18] border border-[#D8C6B6] px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-sm text-[#C88A4B]">add_a_photo</span>
                      <span>Change Photo</span>
                    </button>
                    <span className="text-[11px] text-[#8A715F] italic hidden sm:inline-block">
                      (or drag & drop an image onto photo)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 text-right">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EADBCE] text-[#C88A4B]">
                  Safar-sutra Explorer
                </span>
                <span className="text-xs text-[#8A715F]">Joined Aug 2026</span>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5A4536] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4A2E18]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A4536] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4A2E18]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4536] mb-1">Language Preference</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C]"
                >
                  {['English / Hindi', 'Hindi (हिंदी)', 'English', 'Sanskrit (संस्कृतम्)', 'Tamil', 'Bengali'].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4536] mb-1">Traveler Bio</label>
                <textarea
                  rows="3"
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4A2E18]/15"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-[#4A2E18] hover:bg-[#341F0E] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#4A2E18]/25 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm text-[#E8C59A]">save</span>
                  <span>{saved ? 'Changes Saved!' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Saved Wishlist */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mockDestinations.slice(0, 3).map((dest) => (
            <div key={dest.id} className="bg-white rounded-3xl p-4 border border-[#EADBCE] shadow-warm-md flex flex-col justify-between">
              <div>
                <img src={dest.image} alt={dest.name} className="w-full h-36 rounded-2xl object-cover mb-3" />
                <h3 className="text-sm font-bold text-[#2A180C]">{dest.name}</h3>
                <p className="text-xs text-[#8A715F]">{dest.state}, {dest.country}</p>
              </div>
              <button
                onClick={() => navigate('/explore')}
                className="mt-3 w-full bg-[#FAF7F2] hover:bg-[#F5ECE1] border border-[#D8C6B6] text-[#4A2E18] py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Plan Itinerary Here
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-warm-md space-y-4">
          <h3 className="text-base font-bold text-[#2A180C] mb-4">Notification & Journey Preferences</h3>
          {[
            'Aarti & Temple Darshan reminders',
            'Trip budget alerts when over 80%',
            'Weekly pilgrimage & travel recommendations',
            'Weather and best-time advisories',
          ].map((item) => (
            <div key={item} className="flex justify-between items-center py-2.5 border-b border-[#EADBCE]/50 last:border-none">
              <span className="text-xs font-semibold text-[#5A4536]">{item}</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#4A2E18] cursor-pointer" />
            </div>
          ))}
        </div>
      )}

      {/* Tab: Privacy */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-warm-md space-y-5">
          <h3 className="text-base font-bold text-[#2A180C]">Privacy & Account Management</h3>
          <div className="p-4 bg-[#FFF5F2] border border-[#F4C2B8] rounded-2xl text-xs text-[#93000A] flex justify-between items-center">
            <div>
              <p className="font-bold">Delete Account</p>
              <p className="text-[11px] text-[#7A1F1D]">Permanently delete your account and all associated itineraries.</p>
            </div>
            <button className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer">
              Delete
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-[#FAF7F2] hover:bg-[#F5ECE1] border border-[#D8C6B6] text-[#4A2E18] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Log out of Safar-sutra</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Change Profile Photo ── */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#EADBCE] shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#EADBCE]">
              <div>
                <span className="text-[10px] font-bold text-[#C88A4B] uppercase tracking-wider">Customize Identity</span>
                <h3 className="text-lg font-bold text-[#2A180C]">Change Profile Photo</h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#FAF7F2] text-[#8A715F] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Option 1: Direct File Upload & Drag-and-Drop Area */}
            <div>
              <label className="block text-xs font-bold text-[#5A4536] mb-2">Upload from Computer</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <div
                onDragOver={handleModalDragOver}
                onDragLeave={handleModalDragLeave}
                onDrop={handleModalDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-6 px-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  modalDragging
                    ? 'border-[#0057d9] bg-[#0057d9]/10 text-[#0057d9] scale-102 ring-2 ring-[#0057d9]/20'
                    : 'border-[#D4A373] hover:border-[#4A2E18] bg-[#FAF7F2] hover:bg-[#F5ECE1] text-[#4A2E18]'
                }`}
              >
                <span className={`material-symbols-outlined text-4xl transition-transform ${modalDragging ? 'scale-125 text-[#0057d9]' : 'text-[#C88A4B]'}`}>
                  {modalDragging ? 'file_download' : 'cloud_upload'}
                </span>
                <div className="text-center">
                  <span className="text-xs font-bold block">
                    {modalDragging ? 'Drop your image file now!' : 'Drag & drop image file here, or click to browse'}
                  </span>
                  <span className="text-[10px] text-[#8A715F] mt-0.5 block">
                    Supports PNG, JPG, WebP, GIF (Instant Base64 update & cloud persistence)
                  </span>
                </div>
              </div>
            </div>

            {/* Option 2: Choose from Curated Avatar Presets */}
            <div>
              <label className="block text-xs font-bold text-[#5A4536] mb-2">Or Select Curated Traveler Avatar</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {PRESET_AVATARS.map((av) => (
                  <div
                    key={av.url}
                    onClick={() => handleSelectPreset(av.url)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                      form.avatar === av.url ? 'border-[#4A2E18] ring-2 ring-[#4A2E18]/20 scale-95' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-16 object-cover" />
                    {form.avatar === av.url && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#4A2E18] text-[#E8C59A] flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Option 3: Image URL */}
            <form onSubmit={handleCustomUrlSubmit} className="pt-2 border-t border-[#EADBCE] flex gap-2">
              <input
                type="url"
                placeholder="Or paste an image web link (https://...)"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-[#FAF7F2] border border-[#D8C6B6] rounded-xl text-xs text-[#2A180C]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#4A2E18] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Apply
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
