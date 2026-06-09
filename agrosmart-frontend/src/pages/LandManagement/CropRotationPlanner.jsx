import React, { useState } from 'react';
import { 
  Sprout, 
  Calendar, 
  History, 
  Plus, 
  ChevronRight, 
  AlertCircle,
  FileText,
  BadgeAlert,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { landApi } from './landManagement.api';
import { useToast } from '../../components/layout/Toast';
import { formatIndianDate } from '../../utils/cropSeasonDates';
import { getRotationRecommendation, CROP_DETAILS } from '../../utils/cropRotationRules';
import RotationCalendar from './RotationCalendar';

const CROPS = [
  'Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Mustard', 
  'Soybean', 'Groundnut', 'Pulses', 'Vegetables'
];

const CropRotationPlanner = ({ plot, history, onRefresh, onPreFillCrop }) => {
  const { showToast } = useToast();
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Manual History Record Form State
  const [recordData, setRecordData] = useState({
    cropName: 'Wheat',
    season: 'Rabi ' + new Date().getFullYear(),
    sowingDate: '',
    harvestDate: '',
    yieldAmount: '',
    yieldUnit: 'kg',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Determine the last actual crop to trigger recommendations
  const getLastCrop = () => {
    if (plot.currentCrop && plot.currentCrop !== 'Fallow/Empty') {
      return plot.currentCrop;
    }
    if (history && history.length > 0) {
      return history[0].cropName; // most recent history
    }
    return 'Fallow/Empty';
  };

  const lastCrop = getLastCrop();
  const recommendations = getRotationRecommendation(lastCrop);

  // Form input validation
  const validateForm = () => {
    const errors = {};
    if (!recordData.season.trim()) errors.season = 'Season label is required (e.g. Rabi 2024)';
    if (!recordData.sowingDate) errors.sowingDate = 'Sowing date is required';
    if (!recordData.harvestDate) errors.harvestDate = 'Harvest date is required';
    
    if (recordData.sowingDate && recordData.harvestDate) {
      if (new Date(recordData.harvestDate) <= new Date(recordData.sowingDate)) {
        errors.harvestDate = 'Harvest date must be after sowing date';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecordData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddRecordSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await landApi.addRotationRecord(plot.id, {
        cropName: recordData.cropName,
        season: recordData.season,
        sowingDate: recordData.sowingDate,
        harvestDate: recordData.harvestDate,
        yieldAmount: recordData.yieldAmount ? parseFloat(recordData.yieldAmount) : null,
        yieldUnit: recordData.yieldUnit,
        notes: recordData.notes
      });

      showToast({
        type: 'success',
        title: 'Past Season Added',
        message: `Manually added ${recordData.cropName} (${recordData.season}) to crop rotation records.`
      });

      // Clear state and close
      setIsAddRecordModalOpen(false);
      setRecordData({
        cropName: 'Wheat',
        season: 'Rabi ' + new Date().getFullYear(),
        sowingDate: '',
        harvestDate: '',
        yieldAmount: '',
        yieldUnit: 'kg',
        notes: ''
      });
      setFormErrors({});
      onRefresh(); // Trigger parent reload to update history list
    } catch (err) {
      console.error('Failed to save manual rotation record:', err);
      showToast({
        type: 'error',
        title: 'Save Record Failed',
        message: 'Could not append season log. Please check input formats.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. VISUAL YEAR TIMELINE CALENDAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-855 mb-4 flex items-center gap-1.5">
          <Calendar size={16} className="text-primary" /> Visual Rotation Calendar
        </h3>
        <RotationCalendar plot={plot} history={history} />
      </div>

      {/* 2. AUTOMATED ROTATION RECOMMENDATION CARD */}
      <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/20 border border-emerald-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <Sprout size={16} className="text-emerald-700" /> AgroSmart Rotation Recommendations
            </h3>
            <p className="text-xs text-emerald-800 mt-1">
              Based on your last crop: <strong className="text-emerald-900 font-bold capitalize">{lastCrop}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {recommendations.map((rec) => {
            // Retrieve sowing suggestions based on state or default
            const bestMonth = rec.bestMonths?.default || 'November - December';
            
            return (
              <div 
                key={rec.crop} 
                className="bg-white border border-emerald-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/30 rounded-bl-full flex items-center justify-end pr-2.5 pb-2.5 pointer-events-none group-hover:bg-emerald-50/50 transition-colors" />
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{rec.emoji}</span>
                    <h4 className="text-sm font-bold text-gray-900">{rec.name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                    {rec.reason}
                  </p>
                  <div className="mt-4 text-[10px] text-emerald-800 bg-emerald-50/50 px-2 py-1 rounded-md w-fit font-bold border border-emerald-100">
                    Best Sowing: {bestMonth}
                  </div>
                </div>

                <button
                  onClick={() => onPreFillCrop(rec.name)}
                  className="mt-5 text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-0.5 cursor-pointer hover:underline self-start"
                >
                  Plan This Crop <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ROTATION HISTORY TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <History size={16} className="text-primary" /> Past Rotation History (Last 4 Seasons)
          </h3>
          <button
            onClick={() => setIsAddRecordModalOpen(true)}
            className="text-[11px] font-bold text-primary hover:text-primary-dark bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus size={12} /> Add Past Season
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-150">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-150">
                <th className="p-3">Season</th>
                <th className="p-3">Crop</th>
                <th className="p-3">Sowing Date</th>
                <th className="p-3">Harvest Date</th>
                <th className="p-3">Yield</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history && history.slice(0, 4).map((record) => {
                const cropDetail = CROP_DETAILS[record.cropName] || { emoji: '🟫' };
                return (
                  <tr key={record.id} className="hover:bg-gray-50/50 text-gray-700">
                    <td className="p-3 font-bold text-gray-900">{record.season}</td>
                    <td className="p-3 font-semibold">
                      <span className="mr-1.5">{cropDetail.emoji}</span>
                      {record.cropName}
                    </td>
                    <td className="p-3 text-gray-500">{formatIndianDate(record.sowingDate)}</td>
                    <td className="p-3 text-gray-500">{formatIndianDate(record.harvestDate)}</td>
                    <td className="p-3 font-bold text-gray-900">
                      {record.yieldAmount ? `${record.yieldAmount} ${record.yieldUnit || 'kg'}` : 'N/A'}
                    </td>
                    <td className="p-3 text-gray-400 max-w-[200px] truncate" title={record.notes}>
                      {record.notes || '-'}
                    </td>
                  </tr>
                );
              })}
              {(!history || history.length === 0) && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-400 italic">
                    No past seasons registered yet. Log a crop harvest or add history manually above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MANUAL SEASON RECORD MODAL */}
      <AnimatePresence>
        {isAddRecordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-surface-alt">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Add Past Rotation Record</h4>
                  <p className="text-[10px] text-gray-400">Manually log previous land cultivation history</p>
                </div>
                <button
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddRecordSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-650 block">Crop *</label>
                    <select
                      name="cropName"
                      value={recordData.cropName}
                      onChange={handleInputChange}
                      className="input-field mt-1 cursor-pointer select-clean"
                    >
                      {CROPS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-650 block">Season Label *</label>
                    <input
                      type="text"
                      name="season"
                      value={recordData.season}
                      onChange={handleInputChange}
                      placeholder="e.g. Rabi 2024, Kharif 2023"
                      className={`input-field mt-1 ${formErrors.season ? 'border-rose-400' : ''}`}
                    />
                    {formErrors.season && (
                      <p className="text-[9px] text-rose-500 mt-1 flex items-center gap-0.5"><AlertCircle size={8} /> {formErrors.season}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-650 block">Sowing Date *</label>
                    <input
                      type="date"
                      name="sowingDate"
                      value={recordData.sowingDate}
                      onChange={handleInputChange}
                      className={`input-field mt-1 ${formErrors.sowingDate ? 'border-rose-400' : ''}`}
                    />
                    {formErrors.sowingDate && (
                      <p className="text-[9px] text-rose-500 mt-1 flex items-center gap-0.5"><AlertCircle size={8} /> {formErrors.sowingDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-650 block">Harvest Date *</label>
                    <input
                      type="date"
                      name="harvestDate"
                      value={recordData.harvestDate}
                      onChange={handleInputChange}
                      className={`input-field mt-1 ${formErrors.harvestDate ? 'border-rose-400' : ''}`}
                    />
                    {formErrors.harvestDate && (
                      <p className="text-[9px] text-rose-500 mt-1 flex items-center gap-0.5"><AlertCircle size={8} /> {formErrors.harvestDate}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-650 block">Yield Amount (Optional)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="yieldAmount"
                      value={recordData.yieldAmount}
                      onChange={handleInputChange}
                      placeholder="e.g. 1200"
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-650 block">Yield Unit</label>
                    <select
                      name="yieldUnit"
                      value={recordData.yieldUnit}
                      onChange={handleInputChange}
                      className="input-field mt-1 cursor-pointer select-clean"
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="tonnes">Tonnes</option>
                      <option value="quintals">Quintals</option>
                      <option value="maunds">Maunds</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-650 block">Season Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={recordData.notes}
                    onChange={handleInputChange}
                    placeholder="Weather anomalies, pest incidences, soil health reports..."
                    className="input-field mt-1 h-16 resize-none text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddRecordModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-250 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <>
                        <Check size={12} /> Add Record
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CropRotationPlanner;
