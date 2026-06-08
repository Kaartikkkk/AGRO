/**
 * Utility for reverse geocoding using OpenStreetMap Nominatim API.
 * No API key required for low-volume usage.
 */

export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'AgroSmartApp/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error("Geocoding service unavailable");
    
    const data = await response.json();
    if (data && data.address) {
      return {
        city: data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.suburb || "",
        state: data.address.state || "",
        country: data.address.country || ""
      };
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      }),
      (error) => reject(error)
    );
  });
};

/**
 * Searches for coordinates based on a location query (State, District etc)
 */
export const getCoordinates = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'AgroSmartApp/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error("Search service unavailable");
    
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (error) {
    console.error("Geocoding search error:", error);
    return null;
  }
};
