import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarm } from '../context/FarmContext';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { 
  Briefcase, 
  Maximize2, 
  Sprout, 
  Loader2, 
  Layers,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Droplets,
  Award,
  BookOpen,
  LocateFixed,
  Map as MapIcon,
  CheckCircle2,
  Languages,
  Info,
  Camera,
  MessageSquare
} from 'lucide-react';
import MapBoundaryDrawer from '../components/farm/MapBoundaryDrawer';
import VoiceInput from '../components/ui/VoiceInput';
import indiaRegions from '../data/india-regions.json';
import { getCoordinates } from '../utils/geoUtils';

const languages = {
  en: {
    title: "Land Management",
    step1: "Identity",
    step2: "Boundary",
    step3: "Agronomy",
    step4: "Resources",
    step5: "Review",
    next: "Continue",
    back: "Go Back",
    submit: "Complete Registration",
    detecting: "Detecting Location...",
    autoDetect: "Auto Detect Location",
    farmName: "Farm / Plot Nickname",
    state: "State",
    district: "City / District",
    drawHelp: "Outline your land on the map to calculate area.",
    calculatedArea: "Auto-Calculated Area",
    primaryCrop: "Primary Crop",
    secondaryCrop: "Secondary Crop (Optional)",
    season: "Current Season",
    waterSource: "Water Source",
    irrigation: "Irrigation Method",
    soilTest: "Soil Test Available?",
    notes: "Notes / Remarks",
    voiceHelp: "Click mic to speak notes"
  },
  hi: {
    title: "भूमि प्रबंधन",
    step1: "पहचान",
    step2: "सीमा",
    step3: "कृषि विज्ञान",
    step4: "संसाधन",
    step5: "समीक्षा",
    next: "अगला",
    back: "पीछे",
    submit: "पंजीकरण पूरा करें",
    detecting: "स्थान खोज रहे हैं...",
    autoDetect: "स्थान का स्वतः पता लगाएं",
    farmName: "खेत / प्लॉट का नाम",
    state: "राज्य",
    district: "शहर / जिला",
    drawHelp: "क्षेत्रफल की गणना के लिए मानचित्र पर अपनी भूमि की रूपरेखा तैयार करें।",
    calculatedArea: "स्वतः-गणना क्षेत्र",
    primaryCrop: "मुख्य फसल",
    secondaryCrop: "दूसरी फसल (वैकल्पिक)",
    season: "वर्तमान सीजन",
    waterSource: "जल स्रोत",
    irrigation: "सिंचाई विधि",
    soilTest: "मिट्टी परीक्षण उपलब्ध है?",
    notes: "नोट्स / टिप्पणी",
    voiceHelp: "नोट्स बोलने के लिए माइक पर क्लिक करें"
  }
};

const ModernInput = ({ label, icon: Icon, type = "text", ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-fresh-green transition-colors">
        <Icon size={20} />
      </div>
      <input 
        type={type}
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:border-fresh-green focus:ring-4 focus:ring-fresh-green/10 outline-none transition-all duration-300 shadow-sm font-medium"
      />
    </div>
  </div>
);

const ModernSelect = ({ label, icon: Icon, value, options, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-fresh-green transition-colors">
        <Icon size={20} />
      </div>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:border-fresh-green focus:ring-4 focus:ring-fresh-green/10 outline-none transition-all duration-300 shadow-sm font-medium appearance-none cursor-pointer"
      >
        <option value="" disabled>Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  </div>
);

const CompleteProfile = () => {
  const { farmData, addFarm, updateFarm, farms } = useFarm();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [lang, setLang] = useState('en');
  const t = languages[lang];
  
  const isAdditional = location.pathname === '/add-plot';
  const isEditing = !!id;

  // Find the specific farm if we are in editing mode
  const editingFarm = farms.find(f => f.id === id);

  const [formData, setFormData] = useState({
    farmName: '',
    state: '',
    cityVillage: '',
    boundary: null,
    acres: '',
    cropType: 'Wheat',
    secondaryCrop: '',
    season: 'Kharif',
    soilType: 'Alluvial',
    waterSource: 'Canal',
    irrigationType: 'Drip',
    ownershipType: 'Owned',
    soilTestAvailable: false,
    notes: '',
    images: []
  });

  const [mapCenter, setMapCenter] = useState(null);
  const [searchingCoords, setSearchingCoords] = useState(false);

  // Effects to handle initialization when editing or switching modes
  useEffect(() => {
    if (isEditing && editingFarm) {
      setFormData({
        farmName: editingFarm.farmName || '',
        state: editingFarm.state || '',
        cityVillage: editingFarm.cityVillage || '',
        boundary: editingFarm.boundary || null,
        acres: editingFarm.acres || '',
        cropType: editingFarm.cropType || 'Wheat',
        secondaryCrop: editingFarm.secondaryCrop || '',
        season: editingFarm.season || 'Kharif',
        soilType: editingFarm.soilType || 'Alluvial',
        waterSource: editingFarm.waterSource || 'Canal',
        irrigationType: editingFarm.irrigationType || 'Drip',
        ownershipType: editingFarm.ownershipType || 'Owned',
        soilTestAvailable: editingFarm.soilTestAvailable || false,
        notes: editingFarm.notes || '',
        images: editingFarm.images || []
      });
    } else if (!isEditing && !isAdditional) {
      // Logic for first-time completion if needed
      setFormData(prev => ({
        ...prev,
        farmName: farmData.farmName || '',
        state: farmData.state || '',
        cityVillage: farmData.cityVillage || ''
      }));
    }
  }, [isEditing, editingFarm, isAdditional, farmData]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleAutoDetect = async () => {
    setDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
            const state = data.address?.state || '';
            if (state && city) {
               setFormData(prev => ({ ...prev, state, cityVillage: city }));
               setMapCenter([latitude, longitude]);
            }
          } catch (err) { console.warn(err); } finally { setDetectingLocation(false); }
        },
        () => setDetectingLocation(false),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else { setDetectingLocation(false); }
  };

  const handleDistrictChange = async (district) => {
    setFormData({ ...formData, cityVillage: district });
    if (district && formData.state) {
      setSearchingCoords(true);
      const coords = await getCoordinates(`${district}, ${formData.state}, India`);
      if (coords) setMapCenter(coords);
      setSearchingCoords(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        farmName: formData.farmName || `Farm Plot ${farms.length + 1}`,
        location: `${formData.cityVillage}, ${formData.state}`,
        acres: parseFloat(formData.acres) || 0
      };

      if (isEditing) {
        await updateFarm({ ...payload, id });
      } else if (isAdditional) {
        await addFarm(payload);
      } else {
        await updateFarm({ ...payload, id: farmData.id });
      }
      navigate('/farms'); // Return to farm list after management action
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">{t.step1}</h3>
              <button 
                type="button"
                onClick={handleAutoDetect}
                disabled={detectingLocation}
                className="btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-2"
              >
                {detectingLocation ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                {detectingLocation ? t.detecting : t.autoDetect}
              </button>
            </div>
            <ModernInput 
              label={t.farmName} icon={MapPin} value={formData.farmName} 
              onChange={(v) => setFormData({...formData, farmName: v})}
              placeholder="E.g., North Hill Sector 4"
            />
            <div className="grid grid-cols-2 gap-4">
               <ModernSelect 
                 label={t.state} icon={MapPin} value={formData.state} 
                 options={Object.keys(indiaRegions)}
                 onChange={(v) => setFormData({...formData, state: v, cityVillage: ''})} 
               />
               <ModernSelect 
                 label={t.district} icon={MapPin} value={formData.cityVillage} 
                 options={formData.state ? indiaRegions[formData.state] : []}
                 onChange={handleDistrictChange} 
               />
            </div>
            {searchingCoords && (
              <div className="flex items-center gap-2 text-xs font-bold text-deep-green animate-pulse">
                <Loader2 size={14} className="animate-spin" /> Synchronizing map coordinates...
              </div>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">{t.step2}</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-100">
                <Info size={12} /> {t.drawHelp}
              </div>
            </div>
            <MapBoundaryDrawer 
              initialPosition={mapCenter}
              onUpdate={(data) => {
                if (data) setFormData({ ...formData, boundary: data.geojson, acres: data.acres });
              }}
            />
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">{t.calculatedArea}</p>
                <h4 className="text-3xl font-black text-green-900">{formData.acres || '0.00'} <span className="text-lg font-bold">Acres</span></h4>
              </div>
              <Maximize2 size={40} className="text-green-200" />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">{t.step3}</h3>
            <div className="grid grid-cols-2 gap-5">
              <ModernSelect 
                label={t.primaryCrop} icon={Sprout} value={formData.cropType} 
                options={['Wheat', 'Rice', 'Cotton', 'Mustard', 'Sugarcane', 'Maize']}
                onChange={(v) => setFormData({...formData, cropType: v})}
              />
              <ModernSelect 
                label={t.season} icon={Layers} value={formData.season} 
                options={['Kharif', 'Rabi', 'Zaid']}
                onChange={(v) => setFormData({...formData, season: v})}
              />
              <ModernInput 
                label={t.secondaryCrop} icon={Sprout} value={formData.secondaryCrop} 
                placeholder="E.g., Mustard"
                onChange={(v) => setFormData({...formData, secondaryCrop: v})}
              />
               <ModernSelect 
                label="Soil Composition" icon={Layers} value={formData.soilType} 
                options={['Alluvial', 'Black', 'Red', 'Laterite', 'Desert']}
                onChange={(v) => setFormData({...formData, soilType: v})}
              />
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">{t.step4}</h3>
            <div className="grid grid-cols-2 gap-5">
              <ModernSelect 
                label={t.waterSource} icon={Droplets} value={formData.waterSource} 
                options={['Canal', 'Borewell', 'Rainfed', 'Well']}
                onChange={(v) => setFormData({...formData, waterSource: v})}
              />
              <ModernSelect 
                label={t.irrigation} icon={Droplets} value={formData.irrigationType} 
                options={['Drip', 'Sprinkler', 'Flood', 'Unknown']}
                onChange={(v) => setFormData({...formData, irrigationType: v})}
              />
              <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-sm font-semibold text-gray-700">{t.soilTest}</span>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, soilTestAvailable: !formData.soilTestAvailable})}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                    formData.soilTestAvailable ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-200'
                  }`}
                >
                  {formData.soilTestAvailable ? 'YES - AVAILABLE' : 'NO - PENDING'}
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">{t.step5}</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">{t.notes}</label>
                <VoiceInput onTranscript={(text) => setFormData({...formData, notes: formData.notes + ' ' + text})} />
              </div>
              <textarea 
                rows="4"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:border-fresh-green outline-none transition-all font-medium resize-none"
                placeholder="Add special instructions or observation notes here..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-fresh-green transition-colors cursor-pointer">
                <Camera size={24} className="text-gray-400 group-hover:text-fresh-green mb-2" />
                <span className="text-[10px] font-black text-gray-400 uppercase">{lang === 'en' ? 'Upload Land Images' : 'भूमि की तस्वीरें अपलोड करें'}</span>
              </div>
              <ModernSelect 
                label="Ownership" icon={BookOpen} value={formData.ownershipType} 
                options={['Owned', 'Leased', 'Contract']}
                onChange={(v) => setFormData({...formData, ownershipType: v})}
              />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-body selection:bg-fresh-green/20 selection:text-deep-green">
      
      {/* Left Panel - Progress & Info */}
      <div className="hidden lg:flex w-[35%] relative bg-[#1E3F2B] overflow-hidden flex-col p-12">
        <div className="absolute inset-0 z-0 bg-cover bg-center mix-blend-overlay opacity-40 blur-sm scale-105" style={{ backgroundImage: 'url("/src/assets/images/hero-bg.jpg")' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#112619] via-[#1E3F2B]/90 to-[#1E3F2B]/50 z-10" />

        <div className="relative z-20 flex flex-col h-full">
          <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
            <div className="w-10 h-10 bg-deep-green rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"><span className="text-xl">🌾</span></div>
            <span className="text-2xl font-black tracking-widest uppercase italic text-white">Agro<span className="text-fresh-green">Smart</span></span>
          </Link>

          <div className="space-y-12">
             <div className="flex flex-col gap-6">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center gap-4 group cursor-pointer" onClick={() => step < currentStep && setCurrentStep(step)}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep === step ? 'bg-fresh-green border-fresh-green text-deep-green scale-110 shadow-lg' : 
                      currentStep > step ? 'bg-deep-green border-deep-green text-white' : 'border-white/20 text-white/40'
                    }`}>
                      {currentStep > step ? <CheckCircle2 size={18} /> : <span className="text-xs font-black">{step}</span>}
                    </div>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-widest transition-colors ${currentStep === step ? 'text-white' : 'text-white/40'}`}>
                        {t[`step${step}`]}
                      </h4>
                    </div>
                  </div>
                ))}
             </div>

             <div className="mt-auto pt-10 border-t border-white/10">
                <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                   <div className="w-10 h-10 bg-fresh-green/20 rounded-xl flex items-center justify-center"><Info size={20} className="text-fresh-green" /></div>
                   <p className="text-xs text-white/70 font-medium leading-relaxed">
                     {lang === 'en' ? 'Detailed profiles help our AI provide better yield predictions.' : 'विस्तृत प्रोफाइल हमारे AI को बेहतर उपज भविष्यवाणी प्रदान करने में मदद करते हैं।'}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Step Content */}
      <div className="w-full lg:w-[65%] flex flex-col relative px-6 py-12 lg:px-16 lg:py-16 xl:px-24 bg-white min-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-deep-green font-bold text-sm transition-colors"><ArrowLeft size={16} /> Back</button>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-100 transition-colors uppercase tracking-widest border border-gray-100"
              >
                <Languages size={14} /> {lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
              </button>
           </div>
        </div>

        <div className="w-full max-w-[650px] mx-auto lg:mx-0">
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2 tracking-tighter">
              {isEditing ? 'Update Plot Details' : isAdditional ? 'Register New Plot' : 'Complete Profile'}
            </h2>
            <p className="text-gray-500 font-semibold text-base">Step {currentStep} of 5: {t[`step${currentStep}`]}</p>
          </div>

          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          <div className="pt-10 flex items-center gap-4">
            {currentStep > 1 && (
              <button onClick={prevStep} className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all">
                {t.back}
              </button>
            )}
            
            <button 
              onClick={currentStep === 5 ? handleSubmit : nextStep}
              disabled={loading}
              className={`flex-[2] py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                currentStep === 5 ? 'bg-deep-green text-white shadow-xl shadow-green-900/20' : 'bg-fresh-green text-deep-green shadow-xl shadow-green-200'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {currentStep === 5 ? t.submit : t.next}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
