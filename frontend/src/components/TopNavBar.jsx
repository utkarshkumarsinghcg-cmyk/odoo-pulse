import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/trips', label: 'My Trips', icon: 'luggage' },
  { to: '/explore', label: 'Explore', icon: 'explore' },
  { to: '/calendar', label: 'Calendar', icon: 'calendar_month' },
  { to: '/budget', label: 'Budget', icon: 'account_balance_wallet' },
  { to: '/admin', label: 'Analytics', icon: 'insights' },
];

export default function TopNavBar({ onPlanTrip }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchVal, setSearchVal] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchVal)}`);
    }
  };

  return (
    <nav className="hidden md:flex justify-between items-center w-full px-4 lg:px-8 xl:px-10 h-20 max-w-[1440px] mx-auto z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EADBCE] sticky top-0">
      {/* ── Left Side: Brand Logo + Nav Links ── */}
      <div className="flex items-center gap-3 lg:gap-6 shrink-0">
        {/* Brand Logo & Name */}
        <Link
          to="/dashboard"
          className="text-xl lg:text-2xl font-black text-[#4A2E18] tracking-tight flex items-center gap-2.5 shrink-0 whitespace-nowrap hover:opacity-90 transition-opacity mr-1 lg:mr-2"
        >
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#4A2E18] flex items-center justify-center text-[#E8C59A] shadow-md shadow-[#4A2E18]/25 shrink-0">
            <span className="material-symbols-outlined text-xl lg:text-2xl">temple_hindu</span>
          </div>
          <span className="font-extrabold tracking-tight whitespace-nowrap">Safar-sutra</span>
        </Link>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 xl:gap-2 shrink-0">
          {navLinks.filter(link => link.to !== '/admin' || (user?.email === 'demo@safarsutra.com' || user?.email?.toLowerCase().includes('admin'))).map((link) => {
            const active =
              location.pathname === link.to ||
              (link.to !== '/dashboard' && location.pathname.startsWith(link.to + '/'));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs xl:text-sm font-semibold transition-all px-2.5 xl:px-3 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#4A2E18] text-[#FFFDF9] shadow-sm'
                    : 'text-[#6B5646] hover:text-[#4A2E18] hover:bg-[#F5ECE1]'
                }`}
              >
                <span className="material-symbols-outlined text-base xl:text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Right Side: Search + CTA + Avatar ── */}
      <div className="flex items-center gap-2.5 lg:gap-3.5 shrink-0 pl-2">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden xl:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8A715F] text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Search destination..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-white border border-[#D8C6B6] rounded-full text-xs text-[#2A180C] placeholder:text-[#9E8777] focus:outline-none focus:ring-2 focus:ring-[#4A2E18]/15 focus:border-[#4A2E18] transition-all w-36 2xl:w-48 shadow-2xs"
          />
        </form>

        {/* Plan Trip CTA */}
        <button
          onClick={onPlanTrip}
          className="bg-[#4A2E18] hover:bg-[#341F0E] text-[#FFFDF9] rounded-full px-3.5 lg:px-4 py-2 text-xs font-bold shadow-md shadow-[#4A2E18]/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-base text-[#E8C59A]">add_circle</span>
          <span>Plan Trip</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative group shrink-0">
          <button className="flex items-center gap-1 p-1 rounded-full hover:bg-[#F5ECE1] transition-colors border border-[#EADBCE] cursor-pointer">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-[#D4A373]/50 shrink-0"
            />
            <span className="material-symbols-outlined text-[#6B5646] text-base">arrow_drop_down</span>
          </button>

          <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-[#EADBCE] py-2 w-52 hidden group-hover:block z-50 animate-fadeIn">
            <div className="px-4 py-2.5 border-b border-[#EADBCE]">
              <p className="text-xs font-bold text-[#2A180C] truncate">{user?.name || 'Alex Johnson'}</p>
              <p className="text-[10px] text-[#8A715F] truncate">{user?.email || 'alex.traveler@gmail.com'}</p>
            </div>
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#5A4536] hover:bg-[#FAF7F2] hover:text-[#4A2E18] transition-colors"
            >
              <span className="material-symbols-outlined text-base">person</span> Profile & Settings
            </Link>
            {(user?.email === 'demo@safarsutra.com' || user?.email?.toLowerCase().includes('admin')) && (
              <Link
                to="/admin"
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#5A4536] hover:bg-[#FAF7F2] hover:text-[#4A2E18] transition-colors"
              >
                <span className="material-symbols-outlined text-base">analytics</span> Platform Analytics
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">logout</span> Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
