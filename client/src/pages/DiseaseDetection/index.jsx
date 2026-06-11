import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Upload, X, CheckCircle, AlertCircle, ScanSearch, 
  Loader2, Microscope, ArrowRight, Eye, Info, AlertTriangle, 
  Camera, Calendar, ClipboardList, MapPin, Share2, Copy, Check
} from 'lucide-react';
import DashboardLayout from '../../components/layout/MainLayout';
import { useFarm } from '../../context/FarmContext';
import { diseaseService } from '../../services/disease.service';

const ConfettiEffect = () => {
  const particles = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-40">
      {particles.map((_, i) => {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 80 + Math.random() * 150;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        return (
          <motion.div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: ['#22c55e', '#a855f7', '#3b82f6', '#eab308', '#ec4899', '#f97316'][i % 6]
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.5, 1, 0],
              x: x,
              y: y,
              opacity: [1, 1, 0.8, 0]
            }}
            transition={{
              duration: 1.5 + Math.random() * 1,
              ease: "easeOut"
            }}
          />
        );
      })}
    </div>
  );
};

const DiseaseScannerPage = () => {
  const { farms, farmData } = useFarm();
  
  // Navigation
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'history'
  
  // Scanner state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [cropType, setCropType] = useState('');
  const [farmId, setFarmId] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  
  // Status & loading
  const [flaskStatus, setFlaskStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [modelName, setModelName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Preprocessing image...');
  
  // Results
  const [result, setResult] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // History tab
  const [scanHistory, setScanHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedScanId, setExpandedScanId] = useState(null);
  
  // UX UI UI
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  // Pre-fill crop details based on current active farm
  useEffect(() => {
    if (farmData) {
      setCropType(farmData.currentCrop || farmData.cropType || '');
      setFarmId(farmData.id || '');
    }
  }, [farmData]);

  // Monitor Flask Health
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch history when active tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const checkHealth = async () => {
    try {
      const data = await diseaseService.checkFlaskHealth();
      if (data.online) {
        setFlaskStatus('online');
        setModelName(data.model_name || 'Plant Disease Classification Model');
      } else {
        setFlaskStatus('offline');
      }
    } catch (err) {
      setFlaskStatus('offline');
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await diseaseService.getScanHistory();
      setScanHistory(data);
    } catch (err) {
      console.error('Failed to retrieve history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    
    // File validation
    const allowedExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedExtensions.includes(file.mimetype) && !file.type.startsWith('image/')) {
      setError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo is too large. Please use a photo smaller than 10MB.');
      return;
    }

    setError(null);
    setImageFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setResult(null);
    setShowHeatmap(false);
  };

  const triggerBrowse = () => {
    fileInputRef.current.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current.click();
  };

  const removePhoto = () => {
    setImageFile(null);
    setSelectedImage(null);
    setResult(null);
    setShowHeatmap(false);
    setError(null);
  };

  // Rotating loading messages
  const startLoadingMessages = () => {
    const messages = [
      "Preprocessing image...",
      "Running AI analysis...",
      "Detecting diseases...",
      "Generating treatment plan...",
      "Almost done..."
    ];
    let index = 0;
    setLoadingMessage(messages[0]);
    const timer = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 1500);
    return timer;
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsAnalyzing(true);
    setError(null);
    const messageTimer = startLoadingMessages();
    
    try {
      const response = await diseaseService.predictDisease(imageFile, symptoms, cropType, farmId);
      setResult(response);
      setShowHeatmap(false); // Reset to original preview
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Diagnostic scan failed. Check connections and try again.');
    } finally {
      clearInterval(messageTimer);
      setIsAnalyzing(false);
    }
  };

  const handleCopyDosage = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const linkScanToFarm = async (farmIdSelected) => {
    if (!result?.scan_id) return;
    setFarmId(farmIdSelected);
    try {
      await diseaseService.saveScan(result.scan_id, farmIdSelected);
    } catch (err) {
      console.error('Failed to link farm plot:', err);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setImageFile(null);
    setSymptoms('');
    setResult(null);
    setShowHeatmap(false);
    setError(null);
  };

  // Share report details
  const shareReport = () => {
    if (!result) return;
    const reportText = `AgroSmart Crop Diagnosis Report\n------------------------\nCrop: ${result.prediction.crop}\nDiagnosis: ${result.prediction.disease} (${result.prediction.confidence_percent} confident)\nSeverity: ${result.prediction.severity}\nTreatment: ${result.treatment.immediate_action}\nFungicide: ${result.treatment.fungicide}`;
    navigator.clipboard.writeText(reportText);
    alert('Report details copied to clipboard!');
  };

  return (
    <DashboardLayout title="Crop Scanner" subtitle="Upload crop photos for AI-powered disease detection">
      <div className="max-w-5xl mx-auto pb-12">
        
        {/* Navigation Tabs Row */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'scanner' 
                  ? 'bg-emerald-800 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Microscope size={14} />
              Scan Crop
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'history' 
                  ? 'bg-emerald-800 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClipboardList size={14} />
              Scan History
            </button>
          </div>

          {/* Flask Health Monitor Dot */}
          {activeTab === 'scanner' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">AI Service Status:</span>
              <div 
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  flaskStatus === 'online' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : flaskStatus === 'offline' 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
                title={flaskStatus === 'offline' ? 'AI service is starting up...' : `Loaded model: ${modelName}`}
              >
                <div 
                  className={`w-2 h-2 rounded-full ${
                    flaskStatus === 'online' 
                      ? 'bg-emerald-500' 
                      : flaskStatus === 'offline' 
                        ? 'bg-rose-500 animate-pulse' 
                        : 'bg-amber-500 animate-pulse'
                  }`} 
                />
                {flaskStatus === 'online' ? 'Ready' : flaskStatus === 'offline' ? 'Offline' : 'Checking...'}
              </div>
            </div>
          )}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'scanner' ? (
            <motion.div
              key="scanner-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Image inputs & options */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Main Scan Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  
                  {/* File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                  
                  {/* Camera Input for Mobiles */}
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                  />

                  {/* Drag and Drop Container */}
                  {!selectedImage ? (
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={triggerBrowse}
                      className={`flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-2xl cursor-pointer p-8 transition-all ${
                        dragOver 
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                          : 'border-gray-200 bg-gray-50/50 hover:bg-emerald-50/20 hover:border-emerald-300'
                      }`}
                    >
                      <motion.div
                        animate={dragOver ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="p-4 bg-white shadow-sm border border-gray-100 rounded-full text-emerald-600 mb-4"
                      >
                        <ScanSearch size={32} />
                      </motion.div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Upload Crop Photo</h4>
                      <p className="text-xs text-gray-400 mb-4 text-center">AI analyzes crop leaves to diagnose health risks</p>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                          type="button"
                          className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-sm"
                        >
                          Browse Files
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); triggerCamera(); }}
                          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                          <Camera size={14} />
                          Take Photo
                        </button>
                      </div>
                      
                      <span className="text-[10px] text-gray-400 mt-6">JPG, PNG, WEBP • Max 10MB</span>
                    </div>
                  ) : (
                    /* Image preview container */
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-black max-h-[300px] flex items-center justify-center">
                        <img
                          src={showHeatmap && result?.grad_cam_image ? result.grad_cam_image : selectedImage}
                          alt="Uploaded crop preview"
                          className="w-full max-h-[300px] object-contain"
                        />
                        
                        {/* Heatmap overlay toggle */}
                        {result?.grad_cam_image && (
                          <button
                            type="button"
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-sm z-30 transition-all ${
                              showHeatmap 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                : 'bg-white/90 text-gray-700 hover:bg-white'
                            }`}
                          >
                            <Eye size={12} />
                            {showHeatmap ? 'Show Original' : 'Toggle AI Heatmap'}
                          </button>
                        )}

                        {/* Top action overlays */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
                          <button
                            type="button"
                            onClick={triggerBrowse}
                            className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-xl transition-all"
                            title="Change Photo"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="p-2 bg-red-600/90 hover:bg-red-700 backdrop-blur-sm text-white rounded-xl transition-colors"
                            title="Remove Photo"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Loading Overlay */}
                        <AnimatePresence>
                          {isAnalyzing && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-emerald-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20"
                            >
                              <Loader2 className="animate-spin text-emerald-400 mb-3" size={36} />
                              <span className="text-sm font-semibold tracking-wide">{loadingMessage}</span>
                              <div className="w-48 h-1 bg-white/20 rounded-full mt-4 overflow-hidden relative">
                                <motion.div 
                                  className="h-full bg-emerald-400 rounded-full"
                                  animate={{ left: ['-100%', '100%'] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                  style={{ width: '40%', position: 'absolute' }}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* File Details Label */}
                      {imageFile && (
                        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <span className="truncate font-medium max-w-[200px]">{imageFile.name}</span>
                          <span>{(imageFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Collapsible Details Panel */}
                  {selectedImage && !isAnalyzing && !result && (
                    <div className="mt-5 border-t border-gray-100 pt-5 space-y-4">
                      <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center justify-between w-full text-xs font-bold text-emerald-800"
                      >
                        <span>{showDetails ? 'Hide Additional Details' : 'Add More Details (Optional)'}</span>
                        <span>{showDetails ? '▲' : '▼'}</span>
                      </button>

                      {showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4 overflow-hidden"
                        >
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Crop Type (helps filter diagnostics)</label>
                            <select
                              value={cropType}
                              onChange={(e) => setCropType(e.target.value)}
                              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            >
                              <option value="">-- Select Crop Hint --</option>
                              <option value="Apple">Apple</option>
                              <option value="Blueberry">Blueberry</option>
                              <option value="Cherry">Cherry</option>
                              <option value="Corn">Corn (Maize)</option>
                              <option value="Grape">Grape</option>
                              <option value="Orange">Orange</option>
                              <option value="Peach">Peach</option>
                              <option value="Pepper">Pepper (Bell)</option>
                              <option value="Potato">Potato</option>
                              <option value="Raspberry">Raspberry</option>
                              <option value="Soybean">Soybean</option>
                              <option value="Squash">Squash</option>
                              <option value="Strawberry">Strawberry</option>
                              <option value="Tomato">Tomato</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-semibold text-gray-600">Describe Symptoms</label>
                              <span className="text-[10px] text-gray-400">{symptoms.length}/500</span>
                            </div>
                            <textarea
                              value={symptoms}
                              onChange={(e) => setSymptoms(e.target.value.slice(0, 500))}
                              placeholder="e.g. yellow borders on leaves, powdery white residue, dry patches, wilting leaves..."
                              rows={3}
                              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white resize-none"
                            />
                            <span className="text-[10px] text-gray-400 italic block mt-1">Describing visual clues improves accuracy on text-multimodal checks</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Action Errors */}
                  {error && (
                    <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span className="font-semibold">{error}</span>
                    </div>
                  )}

                  {/* Main Trigger Button */}
                  {selectedImage && !isAnalyzing && !result && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleAnalyze}
                      disabled={flaskStatus === 'offline'}
                      className={`w-full h-12 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-5 ${
                        flaskStatus === 'offline' 
                          ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                          : 'bg-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      <Microscope size={16} />
                      Analyze Crop
                    </motion.button>
                  )}
                </div>

                {/* Offline Warning Banner */}
                {flaskStatus === 'offline' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs text-amber-800 shadow-sm">
                    <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                    <div className="space-y-1">
                      <span className="font-bold block">AI Diagnostic Service is starting up</span>
                      <p className="leading-relaxed text-gray-600">
                        The machine learning service takes about 30-60 seconds to pre-load weight parameters on first demand. Please stand by; this warning badge will clear automatically.
                      </p>
                      <button 
                        type="button" 
                        onClick={checkHealth}
                        className="text-emerald-800 underline font-bold mt-1 block hover:text-emerald-950"
                      >
                        Ping status again
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Diagnostic Output Dashboard */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Result Block */}
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result-dashboard"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      className="space-y-6 relative"
                    >
                      {/* Confetti Trigger for healthy crops */}
                      {result.prediction.is_healthy && <ConfettiEffect />}

                      {/* Header Health Status card */}
                      <div className={`p-6 border rounded-2xl shadow-sm ${
                        result.prediction.is_healthy 
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' 
                          : 'bg-rose-50/30 border-rose-100 text-rose-950'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {result.prediction.is_healthy ? (
                              <div className="p-2 bg-emerald-500 rounded-full text-white">
                                <CheckCircle size={16} />
                              </div>
                            ) : (
                              <div className="p-2 bg-rose-500 rounded-full text-white">
                                <AlertCircle size={16} />
                              </div>
                            )}
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                              {result.prediction.is_healthy ? 'No Disease Detected' : 'Diagnosis Complete'}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 bg-white border border-gray-200 text-emerald-800 font-bold rounded-lg text-xs">
                            {result.prediction.confidence_percent} confident
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xl font-bold">
                            {result.prediction.disease}
                          </h3>
                          <span className="text-xs text-gray-500 block">
                            Detected Crop: <span className="font-bold">{result.prediction.crop}</span>
                          </span>
                        </div>

                        {!result.prediction.is_healthy && (
                          <div className="mt-4 flex items-center gap-2">
                            <span className="text-xs font-semibold">Priority Level:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              result.prediction.severity.toLowerCase().includes('high')
                                ? 'bg-red-100 text-red-700'
                                : result.prediction.severity.toLowerCase().includes('medium')
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}>
                              {result.prediction.severity}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Grad-CAM Side by Side Comparison */}
                      {result.grad_cam_image && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">AI Attention Mapping</h4>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Info size={10} />
                              Red shows hotspots
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100 aspect-square flex items-center justify-center">
                                <img src={selectedImage} alt="Original crop leaf" className="object-cover h-full w-full" />
                              </div>
                              <span className="text-[10px] text-gray-500 text-center block font-semibold">Original</span>
                            </div>
                            <div className="space-y-1">
                              <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100 aspect-square flex items-center justify-center">
                                <img src={result.grad_cam_image} alt="AI focus points" className="object-cover h-full w-full" />
                              </div>
                              <span className="text-[10px] text-gray-500 text-center block font-semibold">AI Heatmap</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Top-3 prediction options */}
                      {result.top_3 && result.top_3.length > 1 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Other Possibilities</h4>
                          <div className="space-y-2.5">
                            {result.top_3.map((pred, i) => (
                              <div key={i} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-medium">
                                  <span className="text-gray-700">{pred.disease}</span>
                                  <span className="text-gray-900 font-bold">{pred.confidence_percent}</span>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                  <motion.div 
                                    className={`h-full rounded-full ${i === 0 ? 'bg-emerald-600' : 'bg-gray-400'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: pred.confidence_percent }}
                                    transition={{ duration: 0.6, delay: 0.1 * i }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full structured treatment layout */}
                      {result.treatment && (
                        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm border-l-4 border-l-emerald-800 space-y-5">
                          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                            <span>💊 Recommended Treatment Plan</span>
                          </h4>
                          
                          <div className="space-y-4 text-xs">
                            {/* Immediate Action */}
                            <div className="p-3 bg-rose-50/50 border-l-2 border-l-rose-500 rounded-r-xl">
                              <span className="font-extrabold text-rose-800 block mb-1 text-[10px] uppercase tracking-wide">🚨 Immediate Action</span>
                              <p className="text-gray-700 leading-relaxed font-medium">
                                {result.treatment.immediate_action}
                              </p>
                            </div>

                            {/* Fungicide */}
                            {result.treatment.fungicide && result.treatment.fungicide !== "N/A" && (
                              <div className="space-y-2">
                                <span className="font-extrabold text-emerald-800 block text-[10px] uppercase tracking-wide">🧪 Fungicide Recommendation</span>
                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800">{result.treatment.fungicide}</span>
                                    <button 
                                      onClick={() => handleCopyDosage(result.treatment.dosage)}
                                      className="p-1 hover:bg-gray-200 text-gray-500 rounded transition-colors"
                                      title="Copy dosage"
                                    >
                                      {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 text-[11px]">
                                    <span>Dosage: <strong className="text-gray-700">{result.treatment.dosage}</strong></span>
                                    <span>Frequency: <strong className="text-gray-700">{result.treatment.frequency}</strong></span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Prevention Tips */}
                            {result.treatment.prevention && (
                              <div className="space-y-1.5">
                                <span className="font-extrabold text-emerald-800 block text-[10px] uppercase tracking-wide">🛡️ Prevention & Cultivation Tips</span>
                                <div className="space-y-1 text-gray-600">
                                  {result.treatment.prevention.split(',').map((tip, idx) => (
                                    <div key={idx} className="flex gap-2 items-start py-0.5">
                                      <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={12} />
                                      <span className="leading-tight font-medium">{tip.trim()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Fertilizer advice */}
                            {result.treatment.fertilizer_advice && (
                              <div className="space-y-1">
                                <span className="font-extrabold text-emerald-800 block text-[10px] uppercase tracking-wide">🌱 Fertilizer Adjustments</span>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                  {result.treatment.fertilizer_advice}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* User Farm Link Block */}
                      {farms && farms.length > 0 && (
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-sm text-xs">
                          <label className="block text-xs font-semibold text-gray-600 mb-2">Assign this Scan to a Field Plot:</label>
                          <select
                            value={farmId}
                            onChange={(e) => linkScanToFarm(e.target.value)}
                            className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white"
                          >
                            <option value="">-- Select Plot --</option>
                            {farms.map((f) => (
                              <option key={f.id} value={f.id}>{f.plotName} ({f.currentCrop || f.cropType})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Action Triggers Row */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={shareReport}
                          className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          <Share2 size={14} />
                          Share Report
                        </button>
                        <button
                          type="button"
                          onClick={resetScanner}
                          className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Scan Another
                        </button>
                      </div>
                      
                    </motion.div>
                  ) : (
                    /* Default state before prediction loads */
                    <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-8 text-center text-gray-400 min-h-[400px] flex flex-col items-center justify-center">
                      <ScanSearch className="mb-4 text-gray-300" size={40} />
                      <span className="font-semibold text-sm text-gray-600 block mb-1">Diagnostic Report</span>
                      <p className="text-xs text-gray-400 max-w-[280px]">
                        Diagnose crop symptoms by submitting a leaf image. Complete recommendation plans, fungicide dosages, and heatmap highlights appear here.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
                
              </div>
            </motion.div>
          ) : (
            
            /* History Tab content */
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                  <Loader2 className="animate-spin text-emerald-800" size={36} />
                  <span className="text-xs font-medium">Fetching history records...</span>
                </div>
              ) : scanHistory.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 shadow-sm flex flex-col items-center justify-center">
                  <Microscope className="mb-4 text-gray-300" size={48} />
                  <span className="font-bold text-gray-700 block mb-1">No Scans Recorded Yet</span>
                  <p className="text-xs text-gray-400 max-w-[300px] mx-auto leading-relaxed">
                    Upload photos of leaves from affected crops in the Scan tab. Once analyzed, records sync here for continuous tracking.
                  </p>
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className="mt-6 px-4 py-2.5 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition-colors"
                  >
                    Diagnose First Leaf
                  </button>
                </div>
              ) : (
                /* History item list */
                <div className="space-y-4">
                  {scanHistory.map((scan) => (
                    <div 
                      key={scan.id}
                      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:border-emerald-100 transition-all"
                    >
                      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {/* Image thumbnail */}
                          <div className="h-14 w-14 rounded-xl overflow-hidden bg-black shrink-0 border border-gray-100">
                            <img 
                              src={scan.grad_cam_url || `/uploads/${scan.image_filename}`} 
                              alt="Scan crop visual" 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-800">
                                {scan.disease_name}
                              </h4>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                scan.severity === 'High'
                                  ? 'bg-red-50 text-red-700 border border-red-100'
                                  : scan.severity === 'Medium'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                    : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {scan.severity}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400 font-medium">
                              <span>Crop: <strong>{scan.crop_type}</strong></span>
                              <span>Confidence: <strong>{parseInt(scan.confidence * 100)}%</strong></span>
                              {scan.FarmNew && (
                                <span className="flex items-center gap-0.5 text-emerald-800">
                                  <MapPin size={10} />
                                  {scan.FarmNew.plotName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                          <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                            <Calendar size={12} />
                            {scan.scan_date}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                // Pre-fill scanner with this selection
                                setSelectedImage(`/uploads/${scan.image_filename}`);
                                setCropType(scan.crop_type);
                                setSymptoms(scan.symptoms_text || '');
                                setFarmId(scan.farm_id || '');
                                setResult(null);
                                setError(null);
                                setActiveTab('scanner');
                              }}
                              className="px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Scan Again
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedScanId(expandedScanId === scan.id ? null : scan.id)}
                              className="px-3 py-1.5 bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                              {expandedScanId === scan.id ? 'Hide Details' : 'View Details'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded treatment view */}
                      {expandedScanId === scan.id && (
                        <div className="bg-gray-50/50 border-t border-gray-100 p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            {/* Comparison thumbnails */}
                            <div className="md:col-span-4 space-y-2">
                              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Diagnostic Image</h5>
                              <div className="rounded-xl overflow-hidden border border-gray-100 bg-black aspect-video flex items-center justify-center max-h-[160px]">
                                <img 
                                  src={scan.grad_cam_url || `/uploads/${scan.image_filename}`} 
                                  alt="Heatmap focus analysis" 
                                  className="h-full w-full object-contain" 
                                />
                              </div>
                            </div>
                            
                            {/* Treatment info */}
                            <div className="md:col-span-8 space-y-3">
                              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Treatment Summary</h5>
                              <div className="bg-white border border-gray-100 p-4 rounded-xl space-y-3 text-xs">
                                <div>
                                  <span className="font-extrabold text-rose-800 block text-[9px] uppercase tracking-wide">🚨 Immediate Action Required</span>
                                  <p className="text-gray-700 font-medium leading-relaxed">{scan.treatment_json.immediate_action}</p>
                                </div>
                                {scan.treatment_json.fungicide && scan.treatment_json.fungicide !== "None required" && scan.treatment_json.fungicide !== "N/A" && (
                                  <div>
                                    <span className="font-extrabold text-emerald-800 block text-[9px] uppercase tracking-wide">🧪 Chemical Application</span>
                                    <p className="text-gray-700 font-medium">
                                      Apply <strong>{scan.treatment_json.fungicide}</strong>. Dosage: <strong>{scan.treatment_json.dosage}</strong> ({scan.treatment_json.frequency}).
                                    </p>
                                  </div>
                                )}
                                {scan.treatment_json.prevention && (
                                  <div>
                                    <span className="font-extrabold text-emerald-800 block text-[9px] uppercase tracking-wide">🛡️ Long Term Prevention</span>
                                    <p className="text-gray-600 font-medium">{scan.treatment_json.prevention}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default DiseaseScannerPage;
