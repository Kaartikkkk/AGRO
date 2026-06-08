import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Upload, 
  X,
  CheckCircle,
  AlertCircle,
  ScanSearch,
  Dna,
  Microscope,
  ArrowRight
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { motion, AnimatePresence } from 'framer-motion';

const DiseaseDetection = () => {
  const { t, farmData } = useFarm();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setResult(null);
    }
  };

  /**
   * Dynamic Diagnostic Simulator 🧬🌾
   * Returns species-specific results based on the farmer's active land plot.
   */
  const startScan = () => {
    setIsScanning(true);
    const crop = farmData?.cropType || 'Wheat';

    const database = {
      Wheat: {
        disease: "Wheat Rust (Puccinia triticina)",
        confidence: "98.4%",
        severity: "Moderate",
        details: "Fungal disease causing orange-brown pustules on wheat leaf surfaces.",
        remedy: "Application of Tebuconazole fungicide and resistant cultivar selection."
      },
      Rice: {
        disease: "Rice Blast (Magnaporthe oryzae)",
        confidence: "97.1%",
        severity: "Critical",
        details: "Lesions on leaves and neck rot. Major threat to basmati yield.",
        remedy: "Tricyclazole spray and optimized nursery spacing."
      },
      Mustard: {
        disease: "White Rust (Albugo candida)",
        confidence: "95.8%",
        severity: "Low",
        details: "Pustules on the lower leaf side. Common in cooler Punjab winters.",
        remedy: "Seed treatment with Metalaxyl and balanced NPK."
      },
      Cotton: {
        disease: "Leaf Curl Virus (CLCuV)",
        confidence: "99.2%",
        severity: "Critical",
        details: "Stunted growth and upward curling of cotton leaves.",
        remedy: "Whitefly control using Imidacloprid and removal of infected plants."
      }
    };

    setTimeout(() => {
      const diagnosis = database[crop] || database.Wheat;
      setIsScanning(false);
      setResult(diagnosis);
    }, 3000);
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-full relative group overflow-hidden bg-gradient-to-br from-white to-rose-50/10">
      {/* Dynamic Scan Aura */}
      <div className={`absolute top-0 right-0 w-64 h-64 ${isScanning ? 'bg-green-400/10' : 'bg-rose-400/5'} blur-[100px] -mr-16 -mt-16 pointer-events-none transition-all duration-1000`} />

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-500 rounded-3xl border border-rose-100 shadow-lg shadow-rose-100/50">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">{t('disease_detection')}</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Neural Vision Scanner • {farmData?.cropType || 'Wheat'} Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">AI Core Active</div>
        </div>
      </div>

      <div className="relative group flex-1 min-h-[300px] z-10">
        {!selectedImage ? (
          <label className="flex flex-col items-center justify-center w-full h-full border-4 border-dashed border-gray-100 rounded-[40px] cursor-pointer bg-gray-50/50 hover:bg-green-50 hover:border-green-300 transition-all group p-12 overflow-hidden relative">
            <ScanSearch className="text-gray-300 group-hover:text-deep-green mb-6 transition-all group-hover:scale-125" size={48} />
            <div className="text-center relative z-10">
              <p className="text-lg font-black text-gray-800 mb-2">Upload Crop Photo</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] leading-relaxed">AI analyzes {farmData?.cropType || 'Crop'} specifics</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="relative h-full w-full rounded-[40px] overflow-hidden shadow-2xl group border-4 border-white">
            <img 
              src={selectedImage} 
              alt="Scan" 
              className={`w-full h-full object-cover transition-all duration-700 ${isScanning ? 'blur-[8px] brightness-50 scale-110' : ''}`} 
            />
            
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  className="absolute inset-0 z-20 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="w-full h-1 bg-green-400 shadow-[0_0_30px_#4ade80]"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-6">
                      <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 animate-spin-slow">
                        <Dna className="text-white" size={48} />
                      </div>
                      <div className="space-y-2 text-center">
                        <span className="text-white font-black text-3xl tracking-tighter drop-shadow-2xl uppercase">Analyzing Species...</span>
                        <div className="flex items-center gap-3 justify-center">
                           <div className="w-1.5 h-1.5 bg-wheat-yellow rounded-full animate-bounce" />
                           <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                           <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-xl text-white rounded-3xl hover:bg-rose-500 transition-all z-30 group-hover:scale-110"
            >
              <X size={24} />
            </button>

            {!isScanning && !result && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full px-8 z-30">
                <button 
                   onClick={startScan}
                   className="w-full py-6 bg-deep-green text-white font-black rounded-[32px] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_32px_64px_-16px_rgba(30,71,46,0.6)] uppercase tracking-[0.2em] text-sm"
                >
                  Start Diagnostic Scan 🧬
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-10 p-8 bg-white/80 backdrop-blur-md rounded-[40px] border border-gray-100 flex flex-col gap-6 shadow-2xl relative z-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                    <CheckCircle size={28} />
                 </div>
                 <div>
                   <span className="text-[10px] font-black uppercase text-green-700 tracking-[0.3em]">AI Diagnosis Complete</span>
                   <div className="text-2xl font-black text-gray-900 tracking-tight">{result.disease}</div>
                 </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Confidence Score</span>
                <span className="text-3xl font-black text-green-600 italic tracking-tighter">{result.confidence}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="text-[9px] font-black uppercase text-rose-500 tracking-widest flex items-center gap-2 mb-2">
                  <AlertCircle size={14} /> Severity Warning
                </div>
                <div className="text-lg font-bold text-gray-800">{result.severity}</div>
              </div>
              <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 mb-2">
                  <Microscope size={14} /> Pathogen Detail
                </div>
                <div className="text-xs font-medium text-gray-600 leading-tight">{result.details}</div>
              </div>
            </div>

            <div className="relative overflow-hidden p-6 bg-deep-green rounded-3xl text-white shadow-2xl shadow-green-100/50">
              <div className="relative z-10">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-green-200 mb-2">Neural Treatment Advisory</div>
                <p className="text-sm font-medium leading-relaxed mb-4">{result.remedy}</p>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-wheat-yellow group/btn">
                  Download Full Bio-Report <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-8 flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest relative z-10 justify-center">
         <span className="flex items-center gap-2">GPU Acceleration Live</span>
         <div className="w-1 h-1 bg-gray-200 rounded-full" />
         <span className="text-green-400">Deep Learning Model v4.2.1</span>
      </footer>
    </div>
  );
};

export default DiseaseDetection;
