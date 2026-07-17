import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.service';
import { useAuth } from './AuthContext';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [homeLocation, setHomeLocationState] = useState(null);
  const [farms, setFarms] = useState([]);
  const [activeLocation, setActiveLocationState] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem('agrosmart_location_onboarded') === 'true';
  });

  // Computed all available locations
  const allLocations = [
    ...(homeLocation ? [homeLocation] : []),
    ...farms
  ];

  const initializeLocation = async () => {
    if (!isAuthenticated) {
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);
    setLocationError(null);
    try {
      // 1. Try reading activeLocation from localStorage
      const cachedActive = localStorage.getItem('agrosmart_active_location');
      let activeSet = false;

      // 2. Fetch profile from DB to get home location and farm locations
      const response = await api.get('/user/profile');
      const data = response.data;

      let homeLoc = null;
      if (data.home_city) {
        homeLoc = {
          id: 'home',
          label: 'My Home',
          type: 'home',
          city: data.home_city,
          state: data.home_state,
          district: data.home_district,
          pincode: data.home_pincode,
          latitude: data.home_latitude,
          longitude: data.home_longitude,
          source: data.location_source || 'profile'
        };
        setHomeLocationState(homeLoc);
      } else {
        setHomeLocationState(null);
      }

      const parsedFarms = (data.farms || [])
        .filter(f => f.latitude !== null && f.longitude !== null)
        .map(f => ({
          id: f.id,
          label: f.plot_name,
          type: 'farm',
          city: f.city,
          state: f.state,
          district: f.district || '',
          pincode: f.pincode || '',
          latitude: f.latitude,
          longitude: f.longitude,
          source: 'farm'
        }));
      setFarms(parsedFarms);

      // Verify cached active location compatibility
      if (cachedActive) {
        try {
          const parsedActive = JSON.parse(cachedActive);
          
          // Verify if it still exists in the newly fetched list
          const exists = parsedActive.id === 'home' 
            ? homeLoc !== null 
            : parsedFarms.some(f => f.id === parsedActive.id);
            
          if (exists) {
            // Re-sync fields to match any DB updates
            const freshLoc = parsedActive.id === 'home' 
              ? homeLoc 
              : parsedFarms.find(f => f.id === parsedActive.id);
            setActiveLocationState(freshLoc);
            activeSet = true;
          }
        } catch (e) {
          console.error('Failed to parse cached active location:', e);
        }
      }

      // 3. Fallback to Home Location if not set via cached
      if (!activeSet) {
        if (homeLoc) {
          setActiveLocationState(homeLoc);
          localStorage.setItem('agrosmart_active_location', JSON.stringify(homeLoc));
        } else if (parsedFarms.length > 0) {
          setActiveLocationState(parsedFarms[0]);
          localStorage.setItem('agrosmart_active_location', JSON.stringify(parsedFarms[0]));
        } else {
          setActiveLocationState(null);
          // Show location onboarding modal for new users
          if (!onboarded) {
            setShowSetupModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing location details:', error);
      setLocationError('Could not sync location details with server.');
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    initializeLocation();
  }, [isAuthenticated]);

  const detectGPSLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        setLocationError("GPS geolocation is not supported by this browser.");
        setLocationLoading(false);
        reject("Not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await api.get(`/weather/reverse-geocode?lat=${latitude}&lon=${longitude}`);
            const locData = res.data;

            const newHome = {
              id: 'home',
              label: 'My Home',
              type: 'home',
              city: locData.city,
              state: locData.state,
              district: locData.district,
              pincode: locData.pincode,
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
              source: 'gps'
            };

            // Save to DB
            await api.put('/user/home-location', {
              city: locData.city,
              state: locData.state,
              district: locData.district,
              pincode: locData.pincode,
              latitude,
              longitude,
              source: 'gps'
            });

            setHomeLocationState(newHome);

            // Sync activeLocation if needed
            if (!activeLocation || activeLocation.type === 'home') {
              setActiveLocationState(newHome);
              localStorage.setItem('agrosmart_active_location', JSON.stringify(newHome));
            }

            setLocationLoading(false);
            resolve(newHome);
          } catch (err) {
            console.error('GPS reverse geocode lookup failed:', err);
            setLocationError('Failed to geocode detected coordinates.');
            setLocationLoading(false);
            reject(err);
          }
        },
        async (error) => {
          console.warn('GPS detection failed, attempting IP-based geolocation fallback...', error.message);
          let ipData = null;
          
          // Fallback service chain
          const ipServices = [
            async () => {
              const res = await fetch('https://ipwho.is/');
              if (!res.ok) throw new Error('ipwho.is failed');
              const data = await res.json();
              if (!data.success) throw new Error('ipwho.is unsuccessful');
              return {
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                city: data.city,
                region: data.region,
                postal: data.postal
              };
            },
            async () => {
              const res = await fetch('https://ipapi.co/json/');
              if (!res.ok) throw new Error('ipapi.co failed');
              const data = await res.json();
              return {
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                city: data.city,
                region: data.region,
                postal: data.postal
              };
            },
            async () => {
              const res = await fetch('http://ip-api.com/json/');
              if (!res.ok) throw new Error('ip-api.com failed');
              const data = await res.json();
              if (data.status !== 'success') throw new Error('ip-api.com unsuccessful');
              return {
                latitude: parseFloat(data.lat),
                longitude: parseFloat(data.lon),
                city: data.city,
                region: data.regionName,
                postal: data.zip
              };
            }
          ];

          for (const service of ipServices) {
            try {
              ipData = await service();
              break;
            } catch (err) {
              console.warn('IP service fallback step failed, trying next...', err.message);
            }
          }

          try {
            if (!ipData || !ipData.latitude || !ipData.longitude) {
              throw new Error('All IP geolocation services failed');
            }
            
            const latitude = ipData.latitude;
            const longitude = ipData.longitude;
            
            let locData = {};
            try {
              const res = await api.get(`/weather/reverse-geocode?lat=${latitude}&lon=${longitude}`);
              locData = res.data;
            } catch (geocodeErr) {
              console.warn('Geocoding of fallback IP coordinates failed, using raw IP locations:', geocodeErr);
            }

            const newHome = {
              id: 'home',
              label: 'My Home',
              type: 'home',
              city: locData.city || ipData.city || 'N/A',
              state: locData.state || ipData.region || 'N/A',
              district: locData.district || ipData.city || 'N/A',
              pincode: locData.pincode || ipData.postal || 'N/A',
              latitude,
              longitude,
              source: 'ip_fallback'
            };

            // Save to DB
            await api.put('/user/home-location', {
              city: newHome.city,
              state: newHome.state,
              district: newHome.district,
              pincode: newHome.pincode,
              latitude,
              longitude,
              source: 'ip_fallback'
            });

            setHomeLocationState(newHome);

            // Sync activeLocation if needed
            if (!activeLocation || activeLocation.type === 'home') {
              setActiveLocationState(newHome);
              localStorage.setItem('agrosmart_active_location', JSON.stringify(newHome));
            }

            setLocationLoading(false);
            resolve(newHome);
          } catch (fallbackError) {
            console.error('IP geolocation fallback failed:', fallbackError);
            setLocationError('GPS access denied and IP lookup failed.');
            setLocationLoading(false);
            reject(fallbackError);
          }
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    });
  };

  const setHomeLocation = async (locObj) => {
    setLocationLoading(true);
    try {
      const payload = {
        city: locObj.city,
        state: locObj.state,
        district: locObj.district,
        pincode: locObj.pincode,
        latitude: parseFloat(locObj.latitude),
        longitude: parseFloat(locObj.longitude),
        source: locObj.source || 'manual'
      };

      const res = await api.put('/user/home-location', payload);
      const data = res.data;

      const newHome = {
        id: 'home',
        label: 'My Home',
        type: 'home',
        city: data.home_city,
        state: data.home_state,
        district: data.home_district,
        pincode: data.home_pincode,
        latitude: data.home_latitude,
        longitude: data.home_longitude,
        source: data.location_source
      };

      setHomeLocationState(newHome);

      if (!activeLocation || activeLocation.type === 'home') {
        setActiveLocationState(newHome);
        localStorage.setItem('agrosmart_active_location', JSON.stringify(newHome));
      }

      return newHome;
    } catch (error) {
      console.error('Failed to set home location:', error);
      throw error;
    } finally {
      setLocationLoading(false);
    }
  };

  const setActiveLocation = (locObj) => {
    if (!locObj) return;
    setActiveLocationState(locObj);
    localStorage.setItem('agrosmart_active_location', JSON.stringify(locObj));
  };

  const refreshAllLocations = async () => {
    await initializeLocation();
  };

  const completeOnboarding = () => {
    localStorage.setItem('agrosmart_location_onboarded', 'true');
    setOnboarded(true);
  };

  return (
    <LocationContext.Provider value={{
      homeLocation,
      farms,
      activeLocation,
      allLocations,
      locationLoading,
      locationError,
      showSetupModal,
      setShowSetupModal,
      onboarded,
      completeOnboarding,
      detectGPSLocation,
      setHomeLocation,
      setActiveLocation,
      refreshAllLocations
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
export default LocationContext;
