import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Menu, 
  ChevronDown,
  MapPin,
  PlusCircle,
  Globe,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, farmData, farms, activeFarmId, switchFarm } = useFarm();
  const navigate = useNavigate();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 hover:bg-gray-100 rounded-2xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        {/* Multi-Land Switcher */}
        <div className="hidden lg:flex items-center gap-4 bg-gray-50 p-2 pr-4 rounded-[20px] border border-gray-100 hover:border-fresh-green/30 transition-all group shadow-sm">
          <div className="p-2.5 bg-white text-deep-green rounded-xl shadow-sm border border-gray-100 group-hover:rotate-12 transition-transform">
             <MapPin size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Select Land Plot</span>
            <div className="relative flex items-center gap-2">
              <select 
                value={activeFarmId || ''} 
                onChange={(e) => switchFarm(e.target.value)}
                className="bg-transparent border-none p-0 pr-6 text-sm font-black text-gray-800 outline-none cursor-pointer appearance-none relative z-10"
              >
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id} className="bg-white text-gray-800 font-bold p-4">
                    {farm.farmName} ({farm.acres} Ac)
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-0 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="h-8 w-[1px] bg-gray-200 mx-2" />
          <button 
            onClick={() => navigate('/complete-profile')}
            className="p-2 text-fresh-green hover:bg-white hover:shadow-sm rounded-xl transition-all flex items-center gap-2 group/add"
          >
             <PlusCircle size={20} className="group-hover/add:scale-110 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">New Plot</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-8 relative">
        <button 
          onClick={toggleLanguage}
          className="p-3 px-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 font-black text-xs flex items-center gap-2 transition-all uppercase tracking-widest text-gray-500"
        >
          <Globe size={18} />
          <span>{lang}</span>
        </button>

        <button className="relative p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
          <Bell size={22} className="text-gray-400 group-hover:text-deep-green" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-100 animate-pulse" />
        </button>

        <div className="h-10 w-[1px] bg-gray-100 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-4 cursor-pointer group px-1 py-1 rounded-full hover:bg-gray-50 transition-all pr-4 outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-deep-green to-fresh-green text-white flex items-center justify-center font-black shadow-lg shadow-green-100/50 group-hover:scale-110 transition-transform relative">
              {user?.fullName?.[0] || 'F'}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-black text-gray-800 leading-tight uppercase tracking-tight">{user?.fullName || 'Farmer'}</div>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{farmData?.cityVillage || 'Verified'}</div>
            </div>
            <ChevronDown size={14} className={`text-gray-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-deep-green' : 'group-hover:text-gray-600'}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-3 border-b border-gray-50 mb-2 sm:hidden text-center">
                <div className="text-sm font-black text-gray-800">{user?.fullName || 'Farmer'}</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{user?.email}</div>
              </div>
              
              <button onClick={() => { setIsProfileOpen(false); navigate('/profile'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-deep-green hover:bg-green-50 rounded-xl transition-colors">
                <User size={18} /> My Profile
              </button>
              <button disabled className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 cursor-not-allowed">
                <Settings size={18} /> Settings (Soon)
              </button>
              
              <div className="h-[1px] bg-gray-50 my-2" />
              
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
