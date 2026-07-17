import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  LocateFixed, 
  Search, 
  MapPin, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import weatherService from '../../services/weather.service';
import api from '../../services/api.service';
import { useToast } from '../common/Toast';

// Leaflet interactive map imports
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons in Vite packaging
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map click event listener
const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Dynamic map view centering component
const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom() > 4 ? map.getZoom() : 13);
    }
  }, [center, map]);
  return null;
};

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const LocationSetupModal = ({ isOpen, onClose, mode = 'home', farmId = null, initialLocation = null }) => {
  const { setHomeLocation, refreshAllLocations } = useLocation();
  const { showToast } = useToast();

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Form states
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [source, setSource] = useState('manual');

  const parsedLat = parseFloat(latitude);
  const parsedLng = parseFloat(longitude);
  const hasValidCoords = !isNaN(parsedLat) && !isNaN(parsedLng);

  const handleMapClick = async (lat, lng) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setSource('manual');
    
    try {
      const res = await weatherService.reverseGeocode(lat, lng);
      if (res) {
        setCity(res.city || '');
        setState(res.state || '');
        setDistrict(res.district || '');
        setPincode(res.pincode || '');
        showToast({
          type: 'success',
          title: 'Coordinates Updated',
          message: `Position set: ${res.city || 'Custom Location'}, ${res.state || ''}`
        });
      }
    } catch (err) {
      console.warn('Reverse geocode failed on map click:', err);
    }
  };
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Reset/Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialLocation) {
        setCity(initialLocation.city || '');
        setDistrict(initialLocation.district || '');
        setState(initialLocation.state || '');
        setPincode(initialLocation.pincode || '');
        setLatitude(initialLocation.latitude || '');
        setLongitude(initialLocation.longitude || '');
        setSource(initialLocation.source || 'manual');
      } else {
        setCity('');
        setDistrict('');
        setState('');
        setPincode('');
        setLatitude('');
        setLongitude('');
        setSource('manual');
      }
      setSearchQuery('');
      setSearchResults([]);
      setGpsError(null);
    }
  }, [isOpen, initialLocation]);

  // Debounce search query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await weatherService.searchCity(searchQuery);
        setSearchResults(data);
      } catch (err) {
        console.error('City search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleGPSEnergy = async () => {
    setGpsLoading(true);
    setGpsError(null);
    if (!("geolocation" in navigator)) {
      setGpsError("GPS is not supported in this browser.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await weatherService.reverseGeocode(latitude, longitude);
          
          setCity(res.city);
          setState(res.state);
          setDistrict(res.district);
          setPincode(res.pincode);
          setLatitude(latitude.toFixed(6));
          setLongitude(longitude.toFixed(6));
          setSource('gps');

          showToast({
            type: 'success',
            title: 'GPS Synced',
            message: `Detected location: ${res.city}, ${res.state}`
          });
        } catch (err) {
          setGpsError("Could not geocode your current GPS coordinates.");
        } finally {
          setGpsLoading(false);
        }
      },
      async (err) => {
        // GPS failed — try IP-based geolocation fallback chain
        console.warn('GPS failed, attempting IP fallback...', err.message);
        let ipData = null;

        const ipServices = [
          async () => {
            const res = await fetch('https://ipwho.is/');
            if (!res.ok) throw new Error('ipwho.is failed');
            const data = await res.json();
            if (!data.success) throw new Error('ipwho.is unsuccessful');
            return { latitude: data.latitude, longitude: data.longitude, city: data.city, region: data.region, postal: data.postal };
          },
          async () => {
            const res = await fetch('https://ipapi.co/json/');
            if (!res.ok) throw new Error('ipapi.co failed');
            const data = await res.json();
            return { latitude: data.latitude, longitude: data.longitude, city: data.city, region: data.region, postal: data.postal };
          },
          async () => {
            const res = await fetch('http://ip-api.com/json/');
            if (!res.ok) throw new Error('ip-api.com failed');
            const data = await res.json();
            if (data.status !== 'success') throw new Error('ip-api.com unsuccessful');
            return { latitude: data.lat, longitude: data.lon, city: data.city, region: data.regionName, postal: data.zip };
          }
        ];

        for (const service of ipServices) {
          try {
            ipData = await service();
            break;
          } catch (svcErr) {
            console.warn('IP service step failed, trying next...', svcErr.message);
          }
        }

        if (ipData && ipData.latitude && ipData.longitude) {
          try {
            const lat = parseFloat(ipData.latitude);
            const lon = parseFloat(ipData.longitude);
            
            // Try to get detailed location from our backend reverse geocode
            let locData = {};
            try {
              const res = await weatherService.reverseGeocode(lat, lon);
              locData = res;
            } catch (geocodeErr) {
              console.warn('Reverse geocode of IP coords failed, using raw IP data:', geocodeErr);
            }

            setCity(locData.city || ipData.city || '');
            setState(locData.state || ipData.region || '');
            setDistrict(locData.district || ipData.city || '');
            setPincode(locData.pincode || ipData.postal || '');
            setLatitude(lat.toFixed(6));
            setLongitude(lon.toFixed(6));
            setSource('ip_fallback');

            showToast({
              type: 'success',
              title: 'Location Detected (IP)',
              message: `Approximate location: ${locData.city || ipData.city}, ${locData.state || ipData.region}`
            });
          } catch (fillErr) {
            console.error('Failed to fill form from IP data:', fillErr);
            setGpsError("GPS permission denied. Please use city search or enter details manually.");
          }
        } else {
          setGpsError("GPS permission denied. Please use city search or enter details manually.");
        }

        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleSelectSearchResult = (result) => {
    setCity(result.name);
    setState(result.state);
    setDistrict(result.name); // Default district to city name
    setLatitude(result.lat.toFixed(6));
    setLongitude(result.lon.toFixed(6));
    setSource('manual');
    setSearchResults([]);
    setSearchQuery('');
  };

  const handlePincodeLookup = async () => {
    if (!pincode || pincode.length !== 6) {
      showToast({
        type: 'error',
        title: 'Invalid Pincode',
        message: 'Please enter a valid 6-digit Indian pincode.'
      });
      return;
    }

    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      
      if (data && data[0]?.Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setCity(postOffice.Block || postOffice.Name);
        setDistrict(postOffice.District);
        setState(postOffice.State);
        
        // Geocode district/state to get coordinates
        const queryStr = `${postOffice.Block || postOffice.Name}, ${postOffice.District}, ${postOffice.State}, India`;
        try {
          const searchData = await weatherService.searchCity(queryStr);
          if (searchData && searchData.length > 0) {
            setLatitude(searchData[0].lat.toFixed(6));
            setLongitude(searchData[0].lon.toFixed(6));
          }
        } catch (err) {
          console.warn('Coordinates lookup from pincode failed:', err);
        }

        showToast({
          type: 'success',
          title: 'Pincode Auto-filled',
          message: `Location set to ${postOffice.Block}, ${postOffice.District}`
        });
      } else {
        showToast({
          type: 'error',
          title: 'Pincode Error',
          message: 'Pincode not found.'
        });
      }
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Pincode lookup service failed.'
      });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleConfirmSave = async (e) => {
    e.preventDefault();

    if (!city || !state || !district || !pincode || !latitude || !longitude) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill out all fields including coordinates.'
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        city,
        state,
        district,
        pincode,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        source
      };

      if (mode === 'home') {
        await setHomeLocation(payload);
        showToast({
          type: 'success',
          title: 'Home Saved',
          message: 'Your home location was successfully saved.'
        });
      } else {
        if (!farmId) throw new Error('Missing farm ID');
        await api.put(`/farms/${farmId}/location`, payload);
        await refreshAllLocations();
        showToast({
          type: 'success',
          title: 'Plot Saved',
          message: 'Plot location was successfully updated.'
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to synchronize location changes with the server.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-black text-gray-900 leading-tight">
                  {mode === 'home' ? 'Set Your Home Location' : 'Set Farm Location'}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  {mode === 'home' 
                    ? 'Used for default weather and mandi prices when no plot is selected.'
                    : 'Used for weather and agricultural warnings specific to this plot.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Option 1: GPS */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Option 1: Auto-Detect GPS</span>
                <button
                  type="button"
                  onClick={handleGPSEnergy}
                  disabled={gpsLoading}
                  className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-primary border border-emerald-200 hover:border-emerald-300 font-bold text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-sm"
                >
                  {gpsLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <LocateFixed size={18} />
                  )}
                  {gpsLoading ? 'Getting your location...' : 'Detect My Current Location'}
                </button>
                {gpsError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1">
                    <AlertCircle size={14} />
                    <span>{gpsError}</span>
                  </div>
                )}
              </div>

              {/* Option 2: Search */}
              <div className="space-y-2 relative">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Option 2: City Search</span>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search city/town (e.g. Ludhiana, Patiala)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary rounded-2xl text-sm font-medium outline-none transition-all"
                  />
                  {searchLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 size={14} className="animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 z-50 max-h-52 overflow-y-auto">
                    {searchResults.map((res, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-primary rounded-xl text-xs font-bold text-gray-700 flex items-center gap-2 transition-colors"
                      >
                        <MapPin size={14} className="text-gray-400" />
                        <span>{res.name}, {res.state} ({res.country})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px bg-gray-100 flex-1" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Or Configure Manually</span>
                <div className="h-px bg-gray-100 flex-1" />
              </div>

              {/* Manual Form */}
              <form onSubmit={handleConfirmSave} className="space-y-4">
                
                {/* Pincode Lookup row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all"
                      placeholder="6-digit pincode"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handlePincodeLookup}
                      disabled={pincodeLoading || pincode.length !== 6}
                      className="w-full py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-250 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {pincodeLoading && <Loader2 size={12} className="animate-spin" />}
                      Use Pincode
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">City / Village</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all"
                      placeholder="E.g., Ludhiana"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all"
                      placeholder="E.g., Ludhiana"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select State</option>
                    {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 font-mono">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => { setLatitude(e.target.value); setSource('manual'); }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all font-mono"
                      placeholder="E.g., 30.9010"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 font-mono">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => { setLongitude(e.target.value); setSource('manual'); }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all font-mono"
                      placeholder="E.g., 75.8573"
                    />
                  </div>
                </div>

                {/* Leaflet Interactive Map */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Pinpoint Exact Location on Map</label>
                  <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-200 z-10">
                    <MapContainer 
                      center={hasValidCoords ? [parsedLat, parsedLng] : [20.5937, 78.9629]} 
                      zoom={hasValidCoords ? 13 : 4} 
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      {hasValidCoords && <Marker position={[parsedLat, parsedLng]} />}
                      <ChangeMapView center={hasValidCoords ? [parsedLat, parsedLng] : null} />
                      <MapEventsHandler onMapClick={handleMapClick} />
                    </MapContainer>
                  </div>
                  <p className="text-[10px] text-gray-400 italic text-center">Click or tap on the map to pinpoint your exact home/farm location.</p>
                </div>

                {/* Footer Save Row */}
                <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100 mt-6 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-2xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-md hover:shadow-lg disabled:opacity-55 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {saving ? 'Saving...' : (mode === 'home' ? 'Save Home Location' : 'Save Farm Location')}
                  </button>
                </div>

              </form>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LocationSetupModal;
