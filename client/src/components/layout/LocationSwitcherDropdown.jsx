import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Home, 
  Check, 
  Plus, 
  Settings, 
  AlertCircle,
  Sprout
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNavigate } from 'react-router-dom';

const LocationSwitcherDropdown = ({ isOpen, onClose, onUpdateHome }) => {
  const { 
    homeLocation, 
    farms, 
    activeLocation, 
    setActiveLocation 
  } = useLocation();
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectLocation = (loc) => {
    setActiveLocation(loc);
    onClose();
  };

  const handleAddNewFarm = () => {
    navigate('/farms');
    onClose();
  };

  const handleUpdateHome = () => {
    onUpdateHome();
    onClose();
  };

  return (
    <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-150 p-2 z-50 overflow-visible" ref={dropdownRef}>
      <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center gap-1.5 shrink-0">
        <MapPin size={16} className="text-primary" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Locations</span>
      </div>

      <div className="py-1.5 max-h-64 overflow-y-auto space-y-1">
        
        {/* Subsection A: Home Location */}
        {homeLocation ? (
          <button
            onClick={() => handleSelectLocation(homeLocation)}
            className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 flex items-center justify-between transition-colors ${
              activeLocation?.id === 'home' ? 'bg-emerald-50/70 hover:bg-emerald-50' : ''
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <Home size={16} className={`mt-0.5 shrink-0 ${
                activeLocation?.id === 'home' ? 'text-primary' : 'text-gray-400'
              }`} />
              <div className="min-w-0">
                <span className="text-xs font-bold text-gray-800 block">My Home</span>
                <span className="text-[10px] text-gray-400 font-semibold truncate block">{homeLocation.city}, {homeLocation.state}</span>
              </div>
            </div>
            {activeLocation?.id === 'home' && (
              <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase shrink-0">
                <span>Active</span>
                <Check size={12} />
              </div>
            )}
          </button>
        ) : (
          <div className="p-3.5 bg-amber-50/40 rounded-xl border border-dashed border-amber-200 text-center">
            <span className="text-[10px] font-bold text-amber-800 block mb-1">Home location not set</span>
            <button 
              onClick={handleUpdateHome}
              className="text-[9px] font-black uppercase text-primary hover:underline"
            >
              Set Location &rarr;
            </button>
          </div>
        )}

        {/* Subsection B: Farm Locations */}
        <div className="px-3.5 py-2 border-t border-gray-100 mt-1.5 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Farms</span>
        </div>

        {farms.length > 0 ? (
          farms.map((farm) => {
            const isActive = activeLocation?.id === farm.id;
            return (
              <button
                key={farm.id}
                onClick={() => handleSelectLocation(farm)}
                className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 flex items-center justify-between transition-colors ${
                  isActive ? 'bg-emerald-50/70 hover:bg-emerald-50' : ''
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <Sprout size={16} className={`mt-0.5 shrink-0 ${
                    isActive ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-800 block truncate" title={farm.label}>{farm.label}</span>
                    <span className="text-[10px] text-gray-400 font-semibold truncate block">{farm.city}, {farm.state}</span>
                  </div>
                </div>
                {isActive && (
                  <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase shrink-0">
                    <span>Active</span>
                    <Check size={12} />
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <div className="px-3.5 py-1 text-[10px] text-gray-400 font-semibold">
            No fields with coordinates.
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="border-t border-gray-100 pt-1.5 mt-1.5 space-y-0.5 shrink-0">
        <button
          onClick={handleAddNewFarm}
          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary transition-colors cursor-pointer"
        >
          <Plus size={14} className="text-gray-400" />
          <span>Add New Farm Location</span>
        </button>
        <button
          onClick={handleUpdateHome}
          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary transition-colors cursor-pointer"
        >
          <Settings size={14} className="text-gray-400" />
          <span>Update Home Location</span>
        </button>
      </div>
    </div>
  );
};

export default LocationSwitcherDropdown;
