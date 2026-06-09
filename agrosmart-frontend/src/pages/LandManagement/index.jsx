import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  Map, 
  Calendar, 
  TrendingUp, 
  Layers, 
  Maximize2,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PlotCard from './PlotCard';
import AddPlotModal from './AddPlotModal';
import PlotCardSkeleton from '../../components/dashboard/PlotCardSkeleton';
import { useToast } from '../../components/layout/Toast';
import { landApi } from './landManagement.api';
import { formatIndianDate } from '../../utils/cropSeasonDates';

// Count-up Animation Component for Stats
const CountUp = ({ value, duration = 800, decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }
    const totalSteps = 40;
    const stepTime = duration / totalSteps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = start + (end - start) * (step / totalSteps);
      setCount(current);
      if (step >= totalSteps) {
        clearInterval(timer);
        setCount(end);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toFixed(decimals)}</span>;
};

const LandManagement = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded'); // name, size, harvestDate, dateAdded

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  
  // Delete confirm state
  const [deleteConfirmPlot, setDeleteConfirmPlot] = useState(null);

  // Undo delete tracking refs
  const deletedPlotsRef = useRef({});

  useEffect(() => {
    fetchPlots();
  }, []);

  const fetchPlots = async () => {
    setLoading(true);
    try {
      const data = await landApi.getPlots();
      setPlots(data);
    } catch (err) {
      console.error('Failed to fetch plots:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Could not load land plots. Please refresh the page.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Unit conversion helper to normalise stats to Acres
  const convertToAcres = (size, unit) => {
    if (!size) return 0;
    const val = parseFloat(size);
    if (unit === 'hectare') return val * 2.471;
    if (unit === 'bigha') return val * 0.25;
    return val;
  };

  // Compute stats
  const totalPlots = plots.length;
  const totalAreaAcres = plots.reduce((acc, plot) => acc + convertToAcres(plot.size, plot.sizeUnit), 0);
  const activeCropsCount = plots.filter(p => p.currentCrop && p.currentCrop !== 'Fallow/Empty').length;
  
  const nextHarvestDate = (() => {
    const upcoming = plots
      .filter(p => p.currentCrop && p.currentCrop !== 'Fallow/Empty' && p.harvestDate)
      .map(p => new Date(p.harvestDate))
      .filter(d => d.getTime() > Date.now())
      .sort((a, b) => a - b);
    return upcoming.length > 0 ? upcoming[0].toISOString().split('T')[0] : null;
  })();

  // Edit plot action
  const handleEditClick = (plot) => {
    setEditingPlot(plot);
    setIsAddModalOpen(true);
  };

  // Delete flow trigger
  const handleDeleteTrigger = (id, name) => {
    setDeleteConfirmPlot({ id, name });
  };

  // Execute delete with Undo timer option
  const executeDelete = (id) => {
    const plotToDelete = plots.find(p => p.id === id);
    if (!plotToDelete) return;

    // Store plot in ref before removing from state
    deletedPlotsRef.current[id] = {
      plot: plotToDelete,
      cancelled: false
    };

    // Optimistically remove from state
    setPlots(prev => prev.filter(p => p.id !== id));
    setDeleteConfirmPlot(null);

    // Show undo toast
    showToast({
      type: 'undo',
      title: 'Plot Deleted',
      message: `"${plotToDelete.plotName}" deleted. Click Undo to restore.`,
      onUndo: () => {
        if (deletedPlotsRef.current[id]) {
          deletedPlotsRef.current[id].cancelled = true;
          // Restore to local state
          setPlots(prev => [...prev, plotToDelete]);
          showToast({
            type: 'success',
            title: 'Action Restored',
            message: `"${plotToDelete.plotName}" has been restored.`
          });
        }
      },
      onTimeout: async () => {
        // Only trigger API if not cancelled
        if (deletedPlotsRef.current[id] && !deletedPlotsRef.current[id].cancelled) {
          try {
            await landApi.deletePlot(id);
            delete deletedPlotsRef.current[id];
          } catch (err) {
            console.error('Delete sync failed:', err);
            // Revert state if server failure
            setPlots(prev => [...prev, plotToDelete]);
            showToast({
              type: 'error',
              title: 'Sync Error',
              message: 'Failed to delete plot on database. Restoring.'
            });
          }
        }
      }
    });
  };

  // Save/Create modal handler
  const handleSavePlot = (savedPlot) => {
    setPlots(prev => {
      const exists = prev.some(p => p.id === savedPlot.id);
      if (exists) {
        return prev.map(p => p.id === savedPlot.id ? savedPlot : p);
      } else {
        return [...prev, savedPlot];
      }
    });
    setEditingPlot(null);
  };

  // Harvest action
  const handleHarvestClick = async (plot) => {
    if (window.confirm(`Mark ${plot.plotName}'s current crop (${plot.currentCrop}) as harvested? This will set it to Fallow and archive the season.`)) {
      try {
        const updated = await landApi.harvestCrop(plot.id, {
          yieldAmount: null,
          yieldUnit: 'kg',
          notes: 'Auto-archived crop season'
        });
        
        // Update local state
        setPlots(prev => prev.map(p => p.id === plot.id ? updated : p));
        showToast({
          type: 'success',
          title: 'Harvest Logged',
          message: `Crop harvested! Plot is now fallow. Sowing recommended.`
        });
        
        // Open details to recommend next crop
        navigate(`/farms/${plot.id}`);
      } catch (err) {
        console.error('Harvest log failed:', err);
        showToast({
          type: 'error',
          title: 'Harvest Error',
          message: 'Could not log harvest. Please check connection.'
        });
      }
    }
  };

  // View details
  const handleViewDetails = (id) => {
    navigate(`/farms/${id}`);
  };

  // Search & Filter Calculations
  const filteredPlots = plots.filter(plot => {
    const term = searchTerm.toLowerCase();
    return (
      plot.plotName.toLowerCase().includes(term) ||
      plot.currentCrop.toLowerCase().includes(term) ||
      plot.village.toLowerCase().includes(term) ||
      plot.state.toLowerCase().includes(term)
    );
  });

  const sortedPlots = [...filteredPlots].sort((a, b) => {
    if (sortBy === 'name') {
      return a.plotName.localeCompare(b.plotName);
    }
    if (sortBy === 'size') {
      return convertToAcres(b.size, b.sizeUnit) - convertToAcres(a.size, a.sizeUnit);
    }
    if (sortBy === 'harvestDate') {
      if (!a.harvestDate) return 1;
      if (!b.harvestDate) return -1;
      return new Date(a.harvestDate) - new Date(b.harvestDate);
    }
    // Default or dateAdded: sort by createdAt descending
    return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
  });

  return (
    <DashboardLayout title="Land Management" subtitle="Manage your plots, monitor crop cycles, and plan rotations">
      <div className="space-y-6">
        
        {/* STATS BAR (4 cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Plots */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-primary flex items-center justify-center shrink-0">
              <Map size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Plots</span>
              <div className="text-xl lg:text-2xl font-bold text-gray-800">
                {loading ? '...' : <CountUp value={totalPlots} />}
              </div>
            </div>
          </div>

          {/* Card 2: Total Area */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Maximize2 size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Area (Acres)</span>
              <div className="text-xl lg:text-2xl font-bold text-gray-800">
                {loading ? '...' : <CountUp value={totalAreaAcres} decimals={1} />}
              </div>
            </div>
          </div>

          {/* Card 3: Active Crops */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Crops</span>
              <div className="text-xl lg:text-2xl font-bold text-gray-800">
                {loading ? '...' : <CountUp value={activeCropsCount} />}
              </div>
            </div>
          </div>

          {/* Card 4: Next Harvest */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Next Harvest</span>
              <div className="text-sm lg:text-base font-bold text-gray-850 truncate mt-0.5">
                {loading ? '...' : (nextHarvestDate ? formatIndianDate(nextHarvestDate) : 'None Planned')}
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: Search, Sort, Add Button */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search plot or crop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-gray-700 bg-gray-50/50"
            />
          </div>

          {/* Sorting & Add */}
          <div className="flex w-full md:w-auto items-center justify-end gap-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <ArrowUpDown size={14} className="text-gray-400" />
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 font-bold text-gray-700 focus:ring-0 focus:outline-none cursor-pointer select-clean"
              >
                <option value="dateAdded">Date Added</option>
                <option value="name">Plot Name</option>
                <option value="size">Plot Size</option>
                <option value="harvestDate">Harvest Date</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingPlot(null);
                setIsAddModalOpen(true);
              }}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              Add New Plot
            </button>
          </div>
        </div>

        {/* MAIN PLOTS LISTING */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <PlotCardSkeleton />
            <PlotCardSkeleton />
            <PlotCardSkeleton />
          </div>
        ) : sortedPlots.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {sortedPlots.map((plot, idx) => (
                <PlotCard
                  key={plot.id}
                  plot={plot}
                  index={idx}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTrigger}
                  onViewDetails={handleViewDetails}
                  onHarvest={handleHarvestClick}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-dashed border-gray-200 p-10 rounded-2xl flex flex-col items-center justify-center text-center min-h-[350px] shadow-sm"
          >
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-16 h-16 bg-emerald-50 text-primary rounded-2xl flex items-center justify-center mb-4 border border-emerald-100 shadow-inner"
            >
              <Map size={30} />
            </motion.div>
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">No Plots Registered</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              Add your crop plots to start capturing real-time advice, soil analysis, and rotation predictions.
            </p>
            <button 
              onClick={() => {
                setEditingPlot(null);
                setIsAddModalOpen(true);
              }}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-sm py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              Setup Primary Land
            </button>
          </motion.div>
        )}

      </div>

      {/* Add/Edit Modal */}
      <AddPlotModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlot(null);
        }}
        onSave={handleSavePlot}
        editingPlot={editingPlot}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmPlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 shadow-sm">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Delete Plot?</h4>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteConfirmPlot.name}"</span>? This will remove all associated crop rotation and yield history permanently.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmPlot(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeDelete(deleteConfirmPlot.id)}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Trash2 size={12} /> Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default LandManagement;
