import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { useFarm } from '../context/FarmContext';
import { useNavigate } from 'react-router-dom';
import { 
  Map, 
  MapPin, 
  Droplets, 
  Layers, 
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
    <DashboardLayout title="Land Management" subtitle="Oversee and manage your registered agricultural plots">
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{farms.length} plot{farms.length !== 1 ? 's' : ''} registered</p>
          <button 
            onClick={() => navigate('/add-plot')}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add New Plot
          </button>
        </div>

        {/* Farm Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {farms.map((farm, index) => {
            const isActive = farm.id === activeFarmId;
            
            return (
              <motion.div 
                key={farm.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`card flex flex-col transition-all duration-200 hover:shadow-md ${
                  isActive ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              >
                {/* Crop Header */}
                <div className="px-5 pt-5 pb-4 border-b border-border-light">
                  <div className="flex items-center justify-between mb-3">
                    <div className="badge-success text-[11px]">
                      <Leaf size={12} />
                      {farm.cropType}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => handleEdit(e, farm.id)}
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-primary transition-colors"
                        title="Edit Plot"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, farm.id, farm.farmName)}
                        className="p-1.5 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove Plot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 truncate mb-1" title={farm.farmName}>
                    {farm.farmName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <span className="truncate">{farm.location}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-5 space-y-2.5 flex-1">
                  <div className="flex items-center justify-between p-3 bg-surface-alt rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <Maximize2 size={14} className="text-gray-400" />
                      <span className="stat-label">Total Area</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{farm.acres} Acres</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-surface-alt rounded-xl">
                      <Droplets size={14} className="text-blue-400 mb-1.5" />
                      <div className="stat-label text-[11px] mb-0.5">Irrigation</div>
                      <div className="text-xs font-semibold text-gray-800">{farm.irrigationType || 'Unknown'}</div>
                    </div>
                    <div className="p-3 bg-surface-alt rounded-xl">
                      <Layers size={14} className="text-amber-500 mb-1.5" />
                      <div className="stat-label text-[11px] mb-0.5">Soil Type</div>
                      <div className="text-xs font-semibold text-gray-800">{farm.soilType || 'Alluvial'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-surface-alt rounded-xl">
                      <BookOpen size={14} className="text-purple-400 mb-1.5" />
                      <div className="stat-label text-[11px] mb-0.5">Ownership</div>
                      <div className="text-xs font-semibold text-gray-800">{farm.ownershipType || 'Owned'}</div>
                    </div>
                    <div className="p-3 bg-surface-alt rounded-xl">
                      <Award size={14} className="text-rose-400 mb-1.5" />
                      <div className="stat-label text-[11px] mb-0.5">Experience</div>
                      <div className="text-xs font-semibold text-gray-800">{farm.experienceYears || 0} Years</div>
                    </div>
                  </div>
                </div>

                {/* Activate Button */}
                <div className="p-4 pt-0">
                  {isActive ? (
                    <div className="w-full py-2.5 bg-primary-50 text-primary font-semibold rounded-xl flex items-center justify-center gap-2 text-sm border border-primary-100">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Active Plot
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleActivate(farm.id)}
                      className="btn-secondary w-full flex items-center justify-center gap-2 text-sm group"
                    >
                      Set as Active
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {/* Empty State */}
          {farms.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center min-h-[300px]"
            >
              <div className="w-16 h-16 bg-surface-alt rounded-2xl flex items-center justify-center mb-4">
                <Map className="text-gray-300" size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No Plots Registered</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                Add a plot to start receiving actionable insights and recommendations.
              </p>
              <button 
                onClick={() => navigate('/complete-profile')}
                className="btn-primary text-sm"
              >
                Setup Primary Land
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmManagement;
