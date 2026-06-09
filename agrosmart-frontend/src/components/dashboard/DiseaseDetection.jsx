import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Upload, 
  X,
  CheckCircle,
  AlertCircle,
  ScanSearch,
  Loader2,
  Microscope,
  ArrowRight
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { farmService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const DiseaseDetection = () => {
  const { t, farmData } = useFarm();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const startScan = async () => {
    if (!imageFile) return;
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('cropType', farmData?.cropType || 'Wheat');

      const data = await farmService.scanCropDisease(formData);
      setResult(data);
    } catch (error) {
      console.error("Diagnostic scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="card-padded flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">{t('disease_detection')}</h3>
            <p className="text-xs text-gray-400">Scan {farmData?.cropType || 'crops'} for diseases</p>
          </div>
        </div>
        <div className={`badge ${isScanning ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'badge-success'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-400 animate-pulse' : 'bg-primary'}`} />
          <span>{isScanning ? 'Scanning' : 'Ready'}</span>
        </div>
      </div>

      {/* Upload / Preview */}
      <div className="flex-1 min-h-[240px]">
        {!selectedImage ? (
          <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-border rounded-2xl cursor-pointer bg-surface-alt hover:bg-primary-50 hover:border-primary-100 transition-all p-8">
            <ScanSearch className="text-gray-300 mb-4" size={40} />
            <p className="text-sm font-semibold text-gray-700 mb-1">Upload Crop Photo</p>
            <p className="text-xs text-gray-400">AI analyzes {farmData?.cropType || 'crop'} health</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="relative h-full w-full rounded-2xl overflow-hidden border border-border">
            <img 
              src={selectedImage} 
              alt="Crop scan" 
              className={`w-full h-full object-cover transition-all duration-500 ${isScanning ? 'blur-sm brightness-75 scale-105' : ''}`} 
            />
            
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="w-full h-0.5 bg-primary shadow-[0_0_12px_rgba(27,94,59,0.6)]"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute' }}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-white" size={36} />
                    <span className="text-white font-semibold text-sm drop-shadow-md">Analyzing image...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => { setSelectedImage(null); setResult(null); setImageFile(null); }}
              className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm text-white rounded-xl hover:bg-red-500 transition-colors z-30"
            >
              <X size={16} />
            </button>

            {!isScanning && !result && (
              <div className="absolute bottom-4 left-4 right-4 z-30">
                <button 
                   onClick={startScan}
                   className="btn-primary w-full py-3 text-sm"
                >
                  Start Diagnostic Scan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-5 space-y-4"
          >
            {/* Disease Name & Confidence */}
            <div className="p-4 bg-surface-alt rounded-xl border border-border-light">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary rounded-lg text-white">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Diagnosis Complete</span>
                </div>
                <span className="text-sm font-bold text-primary">{result.confidence}</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{result.disease}</div>
            </div>

            {/* Severity & Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-surface-alt rounded-xl border border-border-light">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle size={12} className="text-red-400" />
                  <span className="stat-label text-[11px]">Severity</span>
                </div>
                <div className="text-sm font-bold text-gray-800">{result.severity}</div>
              </div>
              <div className="p-3.5 bg-surface-alt rounded-xl border border-border-light">
                <div className="flex items-center gap-1.5 mb-2">
                  <Microscope size={12} className="text-gray-400" />
                  <span className="stat-label text-[11px]">Pathogen</span>
                </div>
                <div className="text-xs font-medium text-gray-600 leading-tight">{result.details}</div>
              </div>
            </div>

            {/* Treatment */}
            <div className="p-4 bg-gradient-to-r from-primary to-primary-light rounded-xl text-white">
              <div className="text-xs text-white/70 mb-1.5">Recommended Treatment</div>
              <p className="text-sm font-medium leading-relaxed mb-3">{result.remedy}</p>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-accent-light hover:gap-2.5 transition-all">
                View Full Report <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiseaseDetection;
