import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Maximize2, 
  Calendar, 
  Droplet, 
  Layers,
  History, 
  Edit, 
  Trash2, 
  Sprout, 
  Compass,
  FileText,
  HelpCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { useToast } from '../../components/layout/Toast';
import { landApi } from './landManagement.api';
import { formatIndianDate, getCropProgress } from '../../utils/cropSeasonDates';
import { CROP_DETAILS } from '../../utils/cropRotationRules';
import AddPlotModal from './AddPlotModal';
import CropRotationPlanner from './CropRotationPlanner';

// Leaflet default icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const PlotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [plot, setPlot] = useState(null);
  const [rotationHistory, setRotationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, rotation, history

  useEffect(() => {
    fetchPlotDetails();
  }, [id]);

  const fetchPlotDetails = async () => {
    setLoading(true);
    try {
      const data = await landApi.getPlot(id);
      setPlot(data);
      if (data.CropRotations) {
        setRotationHistory(data.CropRotations);
      } else {
        const rotData = await landApi.getRotationHistory(id);
        setRotationHistory(rotData);
      }
    } catch (err) {
      console.error('Failed to load plot details:', err);
      showToast({
        type: 'error',
        title: 'Loading Failed',
        message: 'Could not load plot details. Back to plots grid.'
      });
      navigate('/farms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Plot Details" subtitle="Loading plot dashboard...">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-primary rounded-full animate-spin mb-4" />
          <span className="text-sm font-semibold text-gray-500">Retrieving plot profile &amp; satellite records...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!plot) return null;

  const cropInfo = CROP_DETAILS[plot.currentCrop] || { emoji: '🟫', reason: 'Fallow land' };
  const progress = getCropProgress(plot.sowingDate, plot.harvestDate);
  const isFallow = plot.currentCrop === 'Fallow/Empty';

  // Calculate timeline details
  const sowingTime = plot.sowingDate ? new Date(plot.sowingDate).getTime() : null;
  const harvestTime = plot.harvestDate ? new Date(plot.harvestDate).getTime() : null;
  let midDateStr = 'N/A';
  if (sowingTime && harvestTime) {
    const midTime = sowingTime + (harvestTime - sowingTime) / 2;
    midDateStr = new Date(midTime).toISOString().split('T')[0];
  }

  // Activity Log builder
  const buildActivityLog = () => {
    const logs = [];
    
    // Created log
    logs.push({
      id: 'create',
      type: 'registration',
      title: 'Plot Registered',
      description: `Plot "${plot.plotName}" added with size ${plot.size} ${plot.sizeUnit}.`,
      timestamp: plot.createdAt
    });

    // Updated log
    if (plot.updatedAt && plot.updatedAt !== plot.createdAt) {
      logs.push({
        id: 'update',
        type: 'edit',
        title: 'Details Modified',
        description: 'Plot information and settings were modified.',
        timestamp: plot.updatedAt
      });
    }

    // Historical crop rotations logs
    rotationHistory.forEach((rot) => {
      logs.push({
        id: `rot-${rot.id}`,
        type: 'harvest',
        title: `Harvested: ${rot.cropName}`,
        description: `Crop season archived. Sowing: ${formatIndianDate(rot.sowingDate)} | Harvest: ${formatIndianDate(rot.harvestDate)}.${rot.yieldAmount ? ` Yield: ${rot.yieldAmount} ${rot.yieldUnit || 'kg'}` : ''}`,
        timestamp: rot.createdAt
      });
    });

    // Sort by timestamp descending
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const activityLogs = buildActivityLog();

  // Harvest Handlers
  const handleHarvest = async () => {
    if (window.confirm(`Mark ${plot.plotName}'s current crop (${plot.currentCrop}) as harvested? This moves it to history and sets plot to fallow.`)) {
      try {
        const updated = await landApi.harvestCrop(plot.id, {
          yieldAmount: null,
          yieldUnit: 'kg',
          notes: 'Archived via plot quick action'
        });
        setPlot(updated);
        
        // Refresh rotation history
        const rotData = await landApi.getRotationHistory(plot.id);
        setRotationHistory(rotData);

        showToast({
          type: 'success',
          title: 'Harvest Logged',
          message: 'Plot has been set to fallow. Choose your next rotation below!'
        });
      } catch (err) {
        console.error('Harvest failed:', err);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to record crop harvest.'
        });
      }
    }
  };

  // Delete plot handler
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${plot.plotName}"? This action is permanent and deletes all crop history.`)) {
      try {
        await landApi.deletePlot(plot.id);
        showToast({
          type: 'success',
          title: 'Plot Deleted',
          message: `Successfully deleted plot: ${plot.plotName}`
        });
        navigate('/farms');
      } catch (err) {
        console.error('Delete failed:', err);
        showToast({
          type: 'error',
          title: 'Delete Error',
          message: 'Could not delete plot.'
        });
      }
    }
  };

  return (
    <DashboardLayout title={plot.plotName} subtitle={`Land plot dashboard • ${plot.village}, ${plot.state}`}>
      <div className="space-y-6">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/farms')}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Plots Grid
        </button>

        {/* Quick Details Header Banner */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-start gap-4 z-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl shadow-inner border border-emerald-100 shrink-0">
              {cropInfo.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{plot.plotName}</h2>
                <div className={`badge-success text-[10px] ${isFallow ? 'bg-amber-50 text-amber-800 border-amber-100' : ''}`}>
                  {plot.currentCrop}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" />
                {plot.village}, {plot.district}, {plot.state} - {plot.pincode}
              </p>
              <div className="flex gap-4 mt-3 text-xs font-semibold text-gray-600">
                <span>Size: <strong className="text-gray-900">{plot.size} {plot.sizeUnit}</strong></span>
                <span className="text-gray-300">|</span>
                <span>Type: <strong className="text-gray-900 capitalize">{plot.landType}</strong></span>
                <span className="text-gray-300">|</span>
                <span>Irrigation: <strong className="text-gray-900">{plot.irrigationSource || 'None'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap gap-2.5 z-10 shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-250 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Edit size={13} /> Edit Info
            </button>
            {!isFallow && (
              <button
                onClick={handleHarvest}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sprout size={13} /> Mark Harvested
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-3.5 py-2 text-xs font-bold text-red-650 hover:bg-red-50 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Trash2 size={13} /> Delete Plot
            </button>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-gray-200 gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'overview' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Overview &amp; Map
            {activeTab === 'overview' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('rotation')}
            className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'rotation' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingUp size={15} /> Crop Rotation Planner
            {activeTab === 'rotation' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'history' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <History size={15} /> Activity Log &amp; History
            {activeTab === 'history' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Left Column: Basic Info & Timeline */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* TIMELINE VIEW */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-1.5">
                    <Activity size={16} className="text-primary" /> Current Crop Season Timeline
                  </h3>

                  {!isFallow ? (
                    <div className="space-y-8 py-4">
                      
                      {/* Timeline graphic bar */}
                      <div className="relative">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 rounded-full" />
                        <div 
                          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-500 to-primary -translate-y-1/2 rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />

                        {/* Milestones nodes */}
                        <div className="relative flex justify-between">
                          {/* Sowing node */}
                          <div className="flex flex-col items-center">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow flex items-center justify-center text-white z-10" />
                            <span className="text-xs font-bold text-gray-800 mt-2">Sowing</span>
                            <span className="text-[10px] text-gray-400">{formatIndianDate(plot.sowingDate)}</span>
                          </div>

                          {/* Mid-Season node */}
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full border-4 border-white shadow z-10 ${
                              progress >= 50 ? 'bg-emerald-600' : 'bg-gray-200'
                            }`} />
                            <span className="text-xs font-bold text-gray-800 mt-2">Mid Season</span>
                            <span className="text-[10px] text-gray-400">{formatIndianDate(midDateStr)}</span>
                          </div>

                          {/* Harvest node */}
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full border-4 border-white shadow z-10 ${
                              progress >= 100 ? 'bg-primary' : 'bg-gray-200'
                            }`} />
                            <span className="text-xs font-bold text-gray-800 mt-2">Harvest</span>
                            <span className="text-[10px] text-gray-400">{formatIndianDate(plot.harvestDate)}</span>
                          </div>
                        </div>

                        {/* Current Position Flag indicator */}
                        {progress > 0 && progress < 100 && (
                          <div 
                            className="absolute -top-10 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
                            style={{ left: `${progress}%` }}
                          >
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                              Current ({progress}%)
                            </span>
                            <div className="w-1.5 h-1.5 bg-primary rotate-45 -mt-0.5" />
                          </div>
                        )}
                      </div>

                      {/* Detail metrics cards */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Duration</span>
                          <span className="text-sm font-bold text-gray-800 mt-1 block">
                            {Math.round((harvestTime - sowingTime) / (24 * 60 * 60 * 1000))} Days
                          </span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Days Sown</span>
                          <span className="text-sm font-bold text-gray-800 mt-1 block">
                            {Math.max(0, Math.round((Date.now() - sowingTime) / (24 * 60 * 60 * 1000)))} Days ago
                          </span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Days Remaining</span>
                          <span className="text-sm font-bold text-gray-800 mt-1 block">
                            {Math.max(0, Math.round((harvestTime - Date.now()) / (24 * 60 * 60 * 1000)))} Days
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 px-4 bg-amber-50/50 border border-dashed border-amber-200 rounded-xl text-center">
                      <p className="text-sm font-semibold text-amber-800">Plot is Fallow / Empty</p>
                      <p className="text-xs text-gray-500 mt-1">Sow a crop to begin cycle tracking and recommendation tracking.</p>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="mt-3 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow cursor-pointer hover:bg-primary-dark transition-colors"
                      >
                        Plan Crop Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Info / Specs grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Land Info */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-855 mb-4 flex items-center gap-1.5">
                      <Layers size={16} className="text-primary" /> Soil &amp; Land Specs
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Ownership</span>
                        <span className="text-xs font-bold text-gray-800 capitalize">{plot.ownership}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Land Type</span>
                        <span className="text-xs font-bold text-gray-800 capitalize">{plot.landType}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Irrigation Source</span>
                        <span className="text-xs font-bold text-gray-800">{plot.irrigationSource || 'None'}</span>
                      </div>
                      {plot.notes && (
                        <div className="pt-2">
                          <span className="text-xs text-gray-400 block mb-1">Notes:</span>
                          <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">{plot.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Satellite Advisor Info */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-gray-855 mb-4 flex items-center gap-1.5">
                      <Sprout size={16} className="text-emerald-600" /> Agronomic Info
                    </h3>
                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2 text-xs">
                        <p className="text-gray-500">
                          Based on the last crop classification and weather cycles, the soil health is optimal. Keep soil aerated during dry periods.
                        </p>
                        <p className="text-gray-500">
                          Recommended fertilizer: <strong className="text-emerald-700 font-semibold">NPK Ratio 4:2:1</strong>.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-400">Soil moisture index:</span>
                        <span className="font-bold text-blue-600">64% (Good)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Leaflet Map */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm h-fit">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-1.5">
                  <MapPin size={16} className="text-primary" /> Plot GPS Coordinates
                </h3>

                {plot.latitude && plot.longitude ? (
                  <div className="space-y-4">
                    <div className="h-56 rounded-xl overflow-hidden border border-gray-250 z-10">
                      <MapContainer 
                        center={[plot.latitude, plot.longitude]} 
                        zoom={14} 
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap'
                        />
                        <Marker position={[plot.latitude, plot.longitude]} icon={DefaultIcon} />
                      </MapContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-55/60 p-2.5 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-gray-400">Lat:</span> <span className="font-bold text-gray-700">{parseFloat(plot.latitude).toFixed(5)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Lng:</span> <span className="font-bold text-gray-700">{parseFloat(plot.longitude).toFixed(5)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 bg-gray-50 text-center rounded-xl border border-dashed border-gray-200">
                    <span className="text-xs text-gray-400">No GPS Coordinates logged for this plot.</span>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="mt-2 text-xs text-primary font-bold hover:underline block mx-auto"
                    >
                      Update coordinates &rarr;
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: CROP ROTATION PLANNER */}
          {activeTab === 'rotation' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CropRotationPlanner 
                plot={plot} 
                history={rotationHistory} 
                onRefresh={fetchPlotDetails}
                onPreFillCrop={(cropName) => {
                  setEditingPlot({
                    ...plot,
                    currentCrop: cropName,
                    sowingDate: new Date().toISOString().split('T')[0]
                  });
                  setIsEditModalOpen(true);
                }}
              />
            </motion.div>
          )}

          {/* TAB 3: ACTIVITY LOG */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-1.5">
                <History size={18} className="text-primary" /> Full Plot History Log
              </h3>

              {activityLogs.length > 0 ? (
                <div className="relative border-l border-gray-200 pl-6 space-y-8 ml-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="relative">
                      {/* Timeline bubble */}
                      <span className={`absolute -left-[33px] top-0.5 w-4.5 h-4.5 rounded-full border-4 border-white shadow flex items-center justify-center ${
                        log.type === 'registration' ? 'bg-primary' : 
                        log.type === 'harvest' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />

                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-bold text-gray-950">{log.title}</h4>
                          <span className="text-[10px] font-bold text-gray-400">
                            {formatIndianDate(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 max-w-xl">{log.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-gray-400 italic">
                  No historical entries recorded for this plot yet.
                </div>
              )}
            </motion.div>
          )}

        </div>

      </div>

      {/* Edit Modal */}
      <AddPlotModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          setPlot(updated);
          fetchPlotDetails();
        }}
        editingPlot={plot}
      />
    </DashboardLayout>
  );
};

export default PlotDetail;
