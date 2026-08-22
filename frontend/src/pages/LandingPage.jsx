import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const slides = [
  {
    id: 'indonesia',
    number: '01',
    title: 'INDONESIA',
    location: 'Broken Beach, Nusa Penida',
    description: 'As the largest archipelago country in the world, Indonesia is blessed with so many different peoples, cultures, customs, traditions, cuisines, food animals, plants, landscapes, and everything that makes it almost like 100 (or even 200) countries united into one beautiful nation.',
    bgImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    rating: 5,
  },
  {
    id: 'udaipur',
    number: '02',
    title: 'UDAIPUR',
    location: 'Jag Niwas Palace, Udaipur',
    description: 'Also known as the Lake Palace, Jag Niwas is a breathtaking white marble summer palace floating in the middle of Lake Pichola in Udaipur, India. Built in 1746, it features ornate pavilions, spectacular lake panoramas, and stands as a global masterpiece of royal heritage.',
    bgImage: 'https://res.cloudinary.com/dztrqgnkx/image/upload/v1787390330/WhatsApp_Image_2026-08-22_at_2.47.46_PM_wfjyxd.jpg',
    rating: 5,
  },
  {
    id: 'bali',
    number: '03',
    title: 'BALI',
    location: 'Uluwatu Cliffs, Bali',
    description: 'Bali is a province of Indonesia and the westernmost of the Lesser Sunda Islands. East of Java and west of Lombok, the province includes the island of Bali and a few smaller neighbouring islands, notably Nusa Penida, Nusa Lembongan, and Nusa Ceningan.',
    bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    rating: 5,
  },
  {
    id: 'kerala',
    number: '04',
    title: 'KERALA',
    location: 'Munnar Tea Gardens, Kerala',
    description: 'Kerala, a state on India\'s tropical Malabar Coast, has nearly 600km of Arabian Sea shoreline. It\'s known for its palm-lined beaches and backwaters, a network of canals. Inland western Ghats, mountains whose slopes support tea, coffee and spice plantations as well as wildlife.',
    bgImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    rating: 4,
  }
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeSlide = slides[activeIndex];
  const nextIndex = (activeIndex + 1) % slides.length;
  const nextSlide = slides[nextIndex];

  // Auto transition every 1.6 seconds using self-scheduling setTimeout (prevents locks)
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex(prev => (prev + 1) % slides.length);
    }, 1600);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(prev => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(prev => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleSelectCard = (index) => {
    if (isTransitioning || index === activeIndex) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Include activeIndex as the first preview slot, followed by the next 3 slides
  const previewIndices = [
    activeIndex,
    (activeIndex + 1) % slides.length,
    (activeIndex + 2) % slides.length,
    (activeIndex + 3) % slides.length,
  ];

  return (
    <div className="relative w-full h-screen text-white overflow-hidden select-none bg-black font-sans">
      
      {/* Custom Styles for Staggered Card Slide-In, Temple and Logo Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
        
        .font-lotr {
          font-family: 'Cinzel', 'Georgia', serif;
        }
        
        .blue-gradient-text {
          background: linear-gradient(to bottom, #ffffff 0%, #e0f7fa 25%, #4fc3f7 55%, #0288d1 85%, #003c66 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          -webkit-text-stroke: 0.3px rgba(224, 247, 250, 0.6);
          filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.95)) drop-shadow(0px 0px 8px rgba(79, 195, 247, 0.45));
        }

        @keyframes slideLeftCard {
          0% { transform: translateX(100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .card-slide-left {
          animation: slideLeftCard 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes compassRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .compass-ring {
          animation: compassRotate 12s linear infinite;
        }
        .logo-container:hover .compass-ring {
          animation: compassRotate 3s linear infinite;
        }
        @keyframes templeGlow {
          0% { filter: drop-shadow(0px 0px 2px rgba(79, 195, 247, 0.4)) scale(1); }
          50% { filter: drop-shadow(0px 0px 10px rgba(79, 195, 247, 0.85)) scale(1.08); }
          100% { filter: drop-shadow(0px 0px 2px rgba(79, 195, 247, 0.4)) scale(1); }
        }
        .temple-icon-animated {
          animation: templeGlow 3s ease-in-out infinite;
          display: inline-block;
        }
        .logo-container:hover .temple-icon-animated {
          transform: scale(1.18);
          filter: drop-shadow(0px 0px 12px rgba(79, 195, 247, 0.95));
        }
      `}</style>
      
      {/* ── BACKGROUND IMAGE TRANSTIONS (CROSSFADE / ONLY OPEN IN PLACE) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Static vignette overlays for constant text readability on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20 pointer-events-none" />

        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${
              idx === activeIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
            style={{ backgroundImage: `url(${slide.bgImage})` }}
          />
        ))}
      </div>

      {/* ── HEADER NAVIGATION ── */}
      <header className="absolute top-0 left-0 w-full z-30 h-24 flex items-center px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
          
          {/* Fused Divine & Global Yatra Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group logo-container" 
            onClick={() => navigate('/')}
          >
            {/* Rotating Global Ring with Glowing Temple Core */}
            <div className="relative w-11 h-11 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-[#4fc3f7]/50 group-hover:bg-white/15 shadow-inner shrink-0">
              {/* Outer Rotating Global latitude/longitude Dashed Ring */}
              <div className="absolute inset-1.5 border border-dashed border-[#4fc3f7]/35 rounded-full compass-ring" />
              {/* Inner Divine Hindu Temple Icon (Glows & Scales) */}
              <span className="material-symbols-outlined text-[#4fc3f7] text-xl temple-icon-animated z-10 select-none">
                temple_hindu
              </span>
              {/* Subtle blue/cyan radial core light */}
              <div className="absolute w-6 h-6 bg-[#4fc3f7]/10 rounded-full blur-md z-0" />
            </div>

            {/* LOTR-Styled Safar Sutra Text (Vertical Stack) */}
            <div className="flex flex-col items-start leading-[0.8] select-none pl-0.5">
              {/* SAFAR */}
              <span className="flex items-baseline">
                <span className="text-2xl font-black blue-gradient-text font-lotr leading-none translate-y-0.5 inline-block select-none">S</span>
                <span className="text-xs font-black uppercase blue-gradient-text font-lotr tracking-[0.2em] select-none">afar</span>
              </span>
              {/* SUTRA */}
              <span className="flex items-baseline -mt-0.5">
                <span className="text-2xl font-black blue-gradient-text font-lotr leading-none translate-y-0.5 inline-block select-none">S</span>
                <span className="text-xs font-black uppercase blue-gradient-text font-lotr tracking-[0.2em] select-none">utra</span>
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-10">
            <span className="text-sm font-semibold tracking-wide hover:text-[#00b0ff] transition-colors cursor-pointer text-white/90">News</span>
            <Link to="/explore" className="text-sm font-semibold tracking-wide hover:text-[#00b0ff] transition-colors cursor-pointer text-white">Destinations</Link>
            <span className="text-sm font-semibold tracking-wide hover:text-[#00b0ff] transition-colors cursor-pointer text-white/90">Blog</span>
            <span className="text-sm font-semibold tracking-wide hover:text-[#00b0ff] transition-colors cursor-pointer text-white/90">Contact</span>
          </nav>

          {/* User Section / Greeting */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tracking-wide text-white/90">
                  Hello, {user.name.split(' ')[0]} !
                </span>
                <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 hover:border-[#00b0ff] transition-colors">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tracking-wide text-white/90">
                  Hello, Anney !
                </span>
                <Link to="/login" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 bg-white/20 flex items-center justify-center hover:border-[#00b0ff] transition-colors">
                  <span className="material-symbols-outlined text-white text-lg">person</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ── LEFT SIDEBAR: VERTICAL PROGRESS INDICATOR ── */}
      <div className="absolute left-6 md:left-16 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-8">
        <span className="text-xs font-bold text-white/50">Slides</span>
        <div className="relative w-0.5 h-60 bg-white/20 flex flex-col justify-between items-center py-2">
          {/* Moving dot indicator */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md transition-all duration-700"
            style={{ top: `${(activeIndex / (slides.length - 1)) * 90 + 5}%` }}
          />
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleSelectCard(idx)}
              className={`text-xs font-black transition-all transform hover:scale-110 cursor-pointer ${
                idx === activeIndex ? 'text-white scale-125' : 'text-white/30'
              }`}
            >
              {s.number}
            </button>
          ))}
        </div>
      </div>

      {/* ── CENTER-LEFT MAIN CONTENT ── */}
      <div className="absolute left-6 sm:left-16 lg:left-28 top-1/2 -translate-y-1/2 z-30 max-w-[90%] sm:max-w-md lg:max-w-[400px] flex flex-col gap-4">
        
        {/* Dynamic Title with transition */}
        <div className="overflow-hidden">
          <h1
            className={`text-5xl sm:text-7xl lg:text-8xl font-black tracking-wider leading-none text-white transition-all duration-300 ease-out transform ${
              isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
            }`}
          >
            {activeSlide.title}
          </h1>
        </div>

        {/* Dynamic Description with transition */}
        <div className="overflow-hidden">
          <p
            className={`text-sm sm:text-base text-white/80 leading-relaxed font-light transition-all duration-300 ease-out delay-75 transform ${
              isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
            }`}
          >
            {activeSlide.description}
          </p>
        </div>

        {/* Explore Button */}
        <div
          className={`transition-all duration-300 ease-out delay-150 transform ${
            isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
          }`}
        >
          <button
            onClick={() => navigate(`/explore?search=${activeSlide.title}`)}
            className="group px-8 py-3.5 bg-[#0F1E36] hover:bg-[#1B2F4C] text-white font-bold rounded-full flex items-center gap-3 w-fit shadow-lg shadow-[#000]/30 transition-all active:scale-[0.98] mt-4 cursor-pointer text-sm"
          >
            <span>Explore</span>
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
          </button>
        </div>

      </div>

      {/* ── RIGHT FLOATING PREVIEW CARDS ── */}
      <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 z-30 hidden lg:flex items-center gap-6 h-[400px]">
        {previewIndices.map((idx, offsetIdx) => {
          const item = slides[idx];
          const isActive = offsetIdx === 0;
          return (
            <div
              key={`${activeIndex}-${item.id}`}
              onClick={() => handleSelectCard(idx)}
              className="flex flex-col gap-3 cursor-pointer card-slide-left"
              style={{ animationDelay: `${offsetIdx * 80}ms` }}
            >
              {/* Text ABOVE the card */}
              <div className={`pl-1 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60'}`}>
                <h4 className={`leading-tight drop-shadow-md transition-all duration-500 ${
                  isActive 
                    ? 'text-sm sm:text-base font-black tracking-wider uppercase text-white' 
                    : 'text-[10px] font-semibold text-white/60 truncate max-w-[135px] uppercase tracking-wider'
                }`}>
                  {item.location.split(',')[0]}
                </h4>
                {/* Dots rating */}
                <div className={`flex items-center mt-1 transition-all duration-500 ${isActive ? 'gap-1' : 'gap-0.5'}`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span
                      key={s}
                      className={`material-symbols-outlined font-variation-settings-fill transition-all ${
                        s < item.rating ? 'text-yellow-400' : 'text-white/20'
                      }`}
                      style={{ fontSize: isActive ? '11px' : '8px' }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>

              {/* The Card container */}
              <div
                className={`relative rounded-[24px] overflow-hidden cursor-pointer shadow-ambient-high border transition-all duration-500 ease-in-out group ${
                  isActive
                    ? 'w-48 h-80 border-[#00b0ff] scale-105 z-30 ring-4 ring-[#00b0ff]/20 opacity-100 shadow-2xl'
                    : offsetIdx === 1
                    ? 'w-38 h-68 border-white/10 opacity-70 hover:opacity-90'
                    : offsetIdx === 2
                    ? 'w-32 h-60 border-white/10 opacity-45 z-10 hover:opacity-80'
                    : 'w-26 h-52 border-white/10 opacity-25 z-0 hover:opacity-75'
                }`}
              >
                {/* Card Image */}
                <img
                  src={item.bgImage}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Subtle overlay inside card */}
                <div className="absolute inset-0 bg-black/15" />

                {/* Bookmark overlay icon (inside card) */}
                <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-sm font-variation-settings-fill">bookmark</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── BOTTOM LEFT: NEXT PREVIEW ── */}
      <div className="absolute left-6 sm:left-28 md:left-40 bottom-10 z-20 flex items-center gap-3">
        <span className="text-4xl font-extrabold text-white/25 select-none leading-none">
          {nextSlide.number}
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-bold text-[#00b0ff] tracking-widest uppercase">Next Destination</span>
          <span className="text-sm font-bold text-white mt-1 select-none">{nextSlide.location.split(',')[0]}</span>
        </div>
      </div>

      {/* ── BOTTOM RIGHT: MANUAL TRANSITION CONTROLS ── */}
      <div className="absolute right-6 md:right-16 bottom-10 z-20 flex items-center gap-4">
        {/* Navigation Indicators dots or index text */}
        <span className="text-xs font-semibold text-white/50 tracking-wider hidden sm:block mr-2">
          {activeSlide.number} / {String(slides.length).padStart(2, '0')}
        </span>
        
        {/* Circular Prev/Next Buttons */}
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full border border-white/30 hover:border-white bg-white/5 hover:bg-white/15 backdrop-blur-sm text-white flex items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full border border-white/30 hover:border-white bg-white/5 hover:bg-white/15 backdrop-blur-sm text-white flex items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

    </div>
  );
}
