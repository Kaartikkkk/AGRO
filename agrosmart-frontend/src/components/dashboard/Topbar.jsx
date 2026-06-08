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
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        
        {/* Farm Selector */}
        <div className="hidden lg:flex items-center gap-3 bg-surface-alt px-3 py-1.5 rounded-lg border border-border">
          <MapPin size={16} className="text-primary shrink-0" />
          <select 
            value={activeFarmId || ''} 
            onChange={(e) => switchFarm(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none cursor-pointer appearance-none pr-6 min-w-[120px]"
          >
            {farms.map(farm => (
              <option key={farm.id} value={farm.id}>
                {farm.farmName} ({farm.acres} Ac)
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="text-gray-400 -ml-4 pointer-events-none" />
          
          <div className="h-5 w-px bg-border mx-1" />
          
          <button 
            onClick={() => navigate('/complete-profile')}
            className="p-1 text-primary hover:bg-primary-50 rounded transition-colors"
            title="Add new plot"
          >
            <PlusCircle size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-2"
        >
          <Globe size={16} />
          <span className="hidden sm:inline uppercase font-semibold">{lang}</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
              {user?.fullName?.[0] || 'F'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-gray-800 leading-tight">{user?.fullName || 'Farmer'}</div>
              <div className="text-xs text-gray-400">{farmData?.cityVillage || 'Dashboard'}</div>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-border p-1.5 z-50">
              <div className="px-3 py-2.5 border-b border-border-light mb-1.5 sm:hidden">
                <div className="text-sm font-semibold text-gray-800">{user?.fullName || 'Farmer'}</div>
                <div className="text-xs text-gray-400">{user?.email}</div>
              </div>
              
              <button 
                onClick={() => { setIsProfileOpen(false); navigate('/profile'); }} 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
              >
                <User size={16} /> My Profile
              </button>
              <button 
                disabled 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed"
              >
                <Settings size={16} /> Settings
              </button>
              
              <div className="h-px bg-border-light my-1.5" />
              
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-danger-50 rounded-lg transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
