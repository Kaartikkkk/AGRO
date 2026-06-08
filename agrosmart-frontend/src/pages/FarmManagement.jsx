import React from 'react';
import { motion } from 'framer-motion';
import { useFarm } from '../context/FarmContext';
import { useNavigate } from 'react-router-dom';
import { 
  Map, 
  MapPin, 
  Droplets, 
  Layers, 
  Sprout, 
  Plus,
  Maximize2,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Award,
  Leaf,
  Pencil,
  Trash2
} from 'lucide-react';
import Topbar from '../components/dashboard/Topbar';

const getCropGradient = (cropType) => {
  const gradients = {
    'Wheat': 'from-amber-200/40 to-orange-100/10 border-amber-200',
    'Rice': 'from-blue-200/40 to-cyan-100/10 border-blue-200',
    'Cotton': 'from-slate-200/40 to-gray-100/10 border-slate-200',
    'Sugarcane': 'from-emerald-200/40 to-green-100/10 border-emerald-200',
    'Mustard': 'from-yellow-200/40 to-amber-100/10 border-yellow-200',
  };
  return gradients[cropType] || 'from-green-200/40 to-emerald-100/10 border-green-200';
};

const FarmManagement = () => {
  const { farms, activeFarmId, switchFarm, deleteFarm } = useFarm();
  const navigate = useNavigate();

  const handleActivate = (id) => {
    switchFarm(id);
    navigate('/dashboard');
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${name}"? This will delete all associated data.`)) {
      try {
        await deleteFarm(id);
      } catch (err) {
        console.error("Failed to delete farm", err);
        alert("Failed to remove plot. Please try again.");
      }
    }
  };

  const handleEdit = (e, id) => {
    e.stopPropagation();
    navigate(`/edit-plot/${id}`);
  };

  return (
    <div className="flex h-screen bg-gray-50/50 font-body items-center justify-center relative w-full h-screen overflow-hidden">
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative z-10 w-full h-full">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar  w-full">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <div className="p-3 bg-wheat-yellow/20 rounded-xl">
                    <Map className="text-deep-green" size={24} />
                  </div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Land Management</h1>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-500 font-medium"
                >
                  Oversee, manage, and toggle your registered agricultural assets.
                </motion.p>
              </div>
              
              <motion.button 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/add-plot')}
                className="btn-primary py-3 px-6 flex items-center justify-center gap-2 text-sm shadow-xl shadow-green-900/10 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                Register New Plot
              </motion.button>
            </div>

            {/* Farm Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {farms.map((farm, index) => {
                const isActive = farm.id === activeFarmId;
                const cropTheme = getCropGradient(farm.cropType);
                const scaleTier = farm.acres > 15 ? 'Macro Plot' : 'Micro Plot';
                
                return (
                  <motion.div 
                    key={farm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-[32px] relative overflow-hidden transition-all duration-300 flex flex-col shadow-sm hover:shadow-2xl ${
                      isActive 
                        ? 'ring-4 ring-fresh-green ring-offset-4 scale-[1.02]' 
                        : 'border border-gray-100 hover:-translate-y-1'
                    }`}
                  >
                    {/* Dynamic Crop Header Banner */}
                    <div className={`pt-8 px-8 pb-12 bg-gradient-to-br ${cropTheme} border-b relative`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-gray-800 shadow-sm border border-white/50">
                          <Leaf size={12} className={isActive ? 'text-fresh-green' : 'text-gray-500'} />
                          {farm.cropType} Focus
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleEdit(e, farm.id)}
                            className="p-2 bg-white/50 hover:bg-white backdrop-blur-sm rounded-xl text-gray-700 transition-all border border-white/20 shadow-sm"
                            title="Edit Plot"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, farm.id, farm.farmName)}
                            className="p-2 bg-white/50 hover:bg-red-50 backdrop-blur-sm rounded-xl text-gray-700 hover:text-red-500 transition-all border border-white/20 shadow-sm"
                            title="Remove Plot"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="px-3 py-1 bg-black/5 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-gray-700 ml-1">
                            {scaleTier}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-8 pb-8 flex-1 flex flex-col relative -mt-8">
                       <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 mb-6 flex justify-between items-center relative z-10 group-hover:scale-105 transition-transform">
                          <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1 truncate max-w-[200px]" title={farm.farmName}>{farm.farmName}</h3>
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-wide truncate">
                              <MapPin size={14} className="text-gray-400 shrink-0" />
                              <span className="truncate">{farm.location}</span>
                            </div>
                          </div>
                          {isActive && (
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                               <CheckCircle2 className="text-fresh-green w-5 h-5" />
                            </div>
                          )}
                       </div>

                      <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50">
                          <div className="flex items-center gap-3">
                            <Maximize2 size={16} className="text-gray-400" />
                            <span className="text-gray-600 font-bold text-xs uppercase tracking-wide">Total Area</span>
                          </div>
                          <span className="font-black text-gray-900 text-sm">{farm.acres} Acres</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100/50 flex flex-col justify-between group cursor-default hover:bg-blue-50/50 transition-colors">
                            <Droplets size={16} className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">Irrigation</p>
                            <p className="font-bold text-gray-800 text-xs break-words">{farm.irrigationType || 'Unknown'}</p>
                          </div>
                          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100/50 flex flex-col justify-between group cursor-default hover:bg-amber-50/50 transition-colors">
                            <Layers size={16} className="text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">Soil Type</p>
                            <p className="font-bold text-gray-800 text-xs break-words">{farm.soilType || 'Alluvial'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100/50">
                            <BookOpen size={16} className="text-purple-400 mb-2" />
                            <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">Ownership</p>
                            <p className="font-bold text-gray-800 text-xs">{farm.ownershipType || 'Owned'}</p>
                          </div>
                          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100/50">
                            <Award size={16} className="text-rose-400 mb-2" />
                            <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">Experience</p>
                            <p className="font-bold text-gray-800 text-xs">{farm.experienceYears || 0} Years</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {isActive ? (
                          <div className="w-full py-4 bg-deep-green text-white font-black rounded-2xl flex items-center justify-center gap-2 tracking-widest uppercase text-xs shadow-lg shadow-green-900/20">
                            <div className="w-2 h-2 rounded-full bg-fresh-green animate-pulse" />
                            System Active Focus
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleActivate(farm.id)}
                            className="w-full py-4 bg-white border-2 border-gray-100 hover:border-fresh-green hover:bg-green-50 text-gray-400 hover:text-deep-green font-black rounded-2xl flex items-center justify-center gap-2 transition-all group tracking-widest uppercase text-xs"
                          >
                            Set Local Focus 
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Empty State / Add Action Card */}
              {farms.length === 0 && (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center min-h-[400px]"
                 >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                       <Map className="text-gray-300 w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">No Plots Registered</h3>
                    <p className="text-gray-500 font-medium mb-8 max-w-sm">
                      You haven't added any land properties yet. Add a plot to start receiving actionable insights.
                    </p>
                    <button 
                      onClick={() => navigate('/complete-profile')}
                      className="btn-primary py-3 px-8 text-sm"
                    >
                      Setup Primary Land
                    </button>
                 </motion.div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default FarmManagement;
