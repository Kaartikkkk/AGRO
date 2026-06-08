import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { 
  Sprout, 
  FlaskConical, 
  Droplets, 
  Calendar, 
  Save, 
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ThermometerSun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarm } from '../context/FarmContext';

const FertilizerHub = () => {
  const { farmData, updateFarm, loading: contextLoading } = useFarm();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Local state for Soil Metrics
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
    <div className="flex min-h-screen bg-gray-50/50 font-body">
      <Sidebar isOpen={isSidebarOpen} setToggle={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-4 lg:p-12 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 bg-fresh-green text-white rounded-2xl shadow-xl shadow-green-100">
                  <FlaskConical size={24} />
               </div>
               <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter italic">Nutrient Strategic Hub</h1>
            </div>
            <p className="max-w-2xl text-gray-500 font-bold text-lg leading-relaxed uppercase tracking-tight">
              Optimize your land's health by providing real-time soil metrics. Our AI neural engine calculates the optimal Urea, DAP, and MOP dosages based on your unique terrain.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            
            {/* Input Panel */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="xl:col-span-2 bg-white rounded-[48px] border border-gray-100 shadow-sm p-10 lg:p-16 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/5 blur-[120px] rounded-full -mr-48 -mt-48" />
              
              <form onSubmit={handleUpdate} className="relative z-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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

                <div className="h-[1px] w-full bg-gray-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Current Crop Stage</label>
                      <select 
                        value={soilData.cropStage}
                        onChange={(e) => setSoilData({...soilData, cropStage: e.target.value})}
                        className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-[24px] outline-none focus:ring-4 focus:ring-fresh-green/10 font-bold transition-all text-xl"
                      >
                         {['Sowing', 'Seedling', 'Vegetative', 'Flowering', 'Maturity', 'Harvesting'].map(s => (
                           <option key={s} value={s}>{s}</option>
                         ))}
                      </select>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Sowing Date</label>
                      <div className="relative">
                        <input 
                          type="date"
                          value={soilData.sowingDate}
                          onChange={(e) => setSoilData({...soilData, sowingDate: e.target.value})}
                          className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-[24px] outline-none focus:ring-4 focus:ring-fresh-green/10 font-bold transition-all text-xl"
                        />
                        <Calendar size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                      </div>
                   </div>
                </div>

                <div className="pt-8">
                   <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-black text-white py-8 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 hover:bg-deep-green hover:shadow-2xl hover:shadow-green-100 transition-all active:scale-98 disabled:opacity-50"
                   >
                      {submitting ? <Loader2 className="animate-spin" size={24} /> : (
                        success ? <CheckCircle2 className="text-fresh-green" size={24} /> : <Save size={24} />
                      )}
                      {success ? 'Metrics Synced' : 'Commit Data to Engine'}
                   </button>
                </div>
              </form>
            </motion.div>

            {/* Guide Panel */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-8"
            >
               <div className="bg-gradient-to-br from-deep-green to-fresh-green rounded-[48px] p-10 text-white shadow-2xl shadow-green-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                  <Sprout size={48} className="mb-6 opacity-30" />
                  <h3 className="text-2xl font-black mb-4 tracking-tighter">Strategic Impact</h3>
                  <p className="text-white/80 font-bold leading-relaxed text-sm mb-8">
                    Your soil data is processed through our rule-based diagnostic engine. Accurate inputs prevent nutrient runoff and maximize yield per acre.
                  </p>
                  <ul className="space-y-4">
                     <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 p-3 rounded-xl border border-white/10">
                        <ArrowRight size={14} className="text-wheat-yellow" /> Optimize pH Balance
                     </li>
                     <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 p-3 rounded-xl border border-white/10">
                        <ArrowRight size={14} className="text-wheat-yellow" /> Prevent Over-fertilization
                     </li>
                     <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 p-3 rounded-xl border border-white/10">
                        <ArrowRight size={14} className="text-wheat-yellow" /> Reduce Nitrate Runoff
                     </li>
                  </ul>
               </div>

               <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                     <AlertTriangle size={24} className="text-wheat-yellow" />
                     <h4 className="font-black text-gray-800 uppercase tracking-tighter">Safety Alert</h4>
                  </div>
                  <p className="text-xs font-bold text-gray-400 italic">
                    "Always cross-verify AI recommendations with local agricultural field officers. Recommendations are based on standard Indian soil profiles."
                  </p>
               </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

const MetricInput = ({ label, value, color, onChange }) => {
  const colors = {
    blue: "text-blue-500 bg-blue-50 focus:ring-blue-100",
    orange: "text-orange-500 bg-orange-50 focus:ring-orange-100",
    emerald: "text-emerald-500 bg-emerald-50 focus:ring-emerald-100",
  };

  return (
    <div className="space-y-4">
       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">{label}</label>
       <div className="relative group">
          <input 
             type="number"
             value={value}
             onChange={(e) => onChange(e.target.value)}
             className={`w-full p-6 pb-2 border border-gray-100 rounded-[32px] outline-none transition-all font-black text-2xl text-center focus:ring-8 ${colors[color]}`}
          />
          <div className="h-2 w-full bg-gray-100 absolute bottom-6 left-0 rounded-full origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform opacity-10" />
       </div>
    </div>
  );
};

export default FertilizerHub;
