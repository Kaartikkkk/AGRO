import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet/dist/leaflet.css';
import area from '@turf/area';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GeomanHandler = ({ onUpdate }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      drawCircle: false,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
    });

    map.pm.setGlobalOptions({ 
      measurements: {
        measurement: true,
        displayUnit: 'acres',
      }
    });

    const handleUpdate = () => {
      const layers = L.PM.reinitLayerGroup(map);
      const polygons = [];
      map.eachLayer((layer) => {
        if (layer instanceof L.Polygon && layer.pm) {
          const geojson = layer.toGeoJSON();
          const polyArea = area(geojson); // area in sqm
          const acres = (polyArea * 0.000247105).toFixed(2);
          polygons.push({ geojson, acres });
        }
      });
      
      if (polygons.length > 0) {
        onUpdate(polygons[polygons.length - 1]); // Send the latest/primary polygon
      } else {
        onUpdate(null);
      }
    };

    map.on('pm:create', handleUpdate);
    map.on('pm:remove', handleUpdate);
    map.on('pm:update', handleUpdate);

    return () => {
      map.off('pm:create', handleUpdate);
      map.off('pm:remove', handleUpdate);
      map.off('pm:update', handleUpdate);
    };
  }, [map, onUpdate]);

  return null;
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, map]);
  return null;
};

const MapBoundaryDrawer = ({ initialPosition, onUpdate }) => {
  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner group">
      <MapContainer 
        center={initialPosition || [20.5937, 78.9629]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeomanHandler onUpdate={onUpdate} />
        <MapController center={initialPosition} />
      </MapContainer>
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-gray-100 hidden group-hover:block transition-all animate-in fade-in slide-in-from-right-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Map Tutorial</p>
        <p className="text-xs text-gray-800 font-bold">Use the polygon tool to draw your land.</p>
      </div>
    </div>
  );
};

export default MapBoundaryDrawer;
