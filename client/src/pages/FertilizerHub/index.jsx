import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/MainLayout';
import { 
  Sprout, 
  FlaskConical, 
  Calendar, 
  Save, 
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFarm } from '../../context/FarmContext';

const FertilizerHub = () => {
  const { farmData, updateFarm } = useFarm();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [soilData, setSoilData] = useState({
    nitrogen: farmData.SoilData?.nitrogen || 40,
    phosphorus: farmData.SoilData?.phosphorus || 25,
    potassium: farmData.SoilData?.potassium || 20,
    phLevel: farmData.SoilData?.phLevel || 6.5,
    cropStage: farmData.CropRecord?.cropStage || 'Vegetative',
    sowingDate: farmData.CropRecord?.sowingDate || new Date().toISOString().split('T')[0]
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateFarm({
        id: farmData.id,
        ...soilData
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update soil metrics");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Fertilizer Hub" subtitle="Update soil metrics for optimized nutrient recommendations">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Input Panel */}
        <motion.div 
           initial={{ opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
           className="xl:col-span-2 card p-6 lg:p-8"
        >
          <form onSubmit={handleUpdate} className="space-y-8">
            {/* NPK Inputs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Soil Nutrients (kg/ha)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricInput 
                  label="Nitrogen (N)" 
                  value={soilData.nitrogen} 
                  color="blue"
                  onChange={(v) => setSoilData({...soilData, nitrogen: v})}
                />
                <MetricInput 
                  label="Phosphorus (P)" 
                  value={soilData.phosphorus} 
                  color="orange"
                  onChange={(v) => setSoilData({...soilData, phosphorus: v})}
                />
                <MetricInput 
                  label="Potassium (K)" 
                  value={soilData.potassium} 
                  color="emerald"
                  onChange={(v) => setSoilData({...soilData, potassium: v})}
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Crop Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Crop Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="stat-label mb-2 block">Current Crop Stage</label>
                  <select 
                    value={soilData.cropStage}
                    onChange={(e) => setSoilData({...soilData, cropStage: e.target.value})}
                    className="w-full bg-white border border-border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                  >
                    {['Sowing', 'Seedling', 'Vegetative', 'Flowering', 'Maturity', 'Harvesting'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="stat-label mb-2 block">Sowing Date</label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={soilData.sowingDate}
                      onChange={(e) => setSoilData({...soilData, sowingDate: e.target.value})}
                      className="w-full bg-white border border-border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-sm transition-all"
                    />
                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2.5 text-sm"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : (
                success ? <CheckCircle2 size={18} /> : <Save size={18} />
              )}
              {success ? 'Data Saved Successfully' : 'Save Soil Data'}
            </button>
          </form>
        </motion.div>

        {/* Guide Panel */}
        <motion.div 
           initial={{ opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="space-y-5"
        >
          <div className="p-6 bg-gradient-to-br from-primary to-primary-light rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <FlaskConical size={20} />
              <h3 className="text-base font-bold">Why It Matters</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-5">
              Accurate soil data prevents nutrient runoff and maximizes yield per acre. Our system calculates optimal Urea, DAP, and MOP dosages.
            </p>
            <ul className="space-y-2.5">
              {['Optimize pH Balance', 'Prevent Over-fertilization', 'Reduce Nitrate Runoff'].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-xs font-medium bg-white/10 p-2.5 rounded-lg border border-white/10">
                  <ArrowRight size={12} className="text-accent-light shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={18} className="text-amber-500" />
              <h4 className="text-sm font-semibold text-gray-800">Safety Note</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Always verify AI recommendations with local agricultural officers. Recommendations are based on standard Indian soil profiles.
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

const MetricInput = ({ label, value, color, onChange }) => {
  const colors = {
    blue: "focus:ring-blue-100 focus:border-blue-400",
    orange: "focus:ring-orange-100 focus:border-orange-400",
    emerald: "focus:ring-emerald-100 focus:border-emerald-400",
  };

  return (
    <div>
      <label className="stat-label mb-2 block">{label}</label>
      <input 
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white border border-border px-4 py-3 rounded-xl outline-none transition-all font-semibold text-lg text-center focus:ring-2 ${colors[color]}`}
      />
    </div>
  );
};

export default FertilizerHub;
