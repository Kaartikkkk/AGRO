import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Search, 
  Settings,
  LocateFixed,
  Loader2
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useFarm } from '../../context/FarmContext';
import LocationSetupModal from './LocationSetupModal';

const LocationOnboardingModal = () => {
  const { 
    showSetupModal, 
    setShowSetupModal, 
    onboarded, 
    completeOnboarding, 
    detectGPSLocation,
    homeLocation,
    farms,
    refreshAllLocations
  } = useLocation();

  const [step, setStep] = useState(1);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Child setup modal trigger
  const [childSetupOpen, setChildSetupOpen] = useState(false);
  const [childSetupMode, setChildSetupMode] = useState('home');
  const [childSetupFarmId, setChildSetupFarmId] = useState(null);

  if (onboarded || !showSetupModal) return null;

  const handleGPSEnergy = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      await detectGPSLocation();
      setStep(2);
    } catch (err) {
      setGpsError("GPS unavailable — please configure manually.");
    } finally {
      setGpsLoading(false);
    }
  };

  const handleManualSetupHome = () => {
    setChildSetupMode('home');
    setChildSetupFarmId(null);
    setChildSetupOpen(true);
  };

  const handleManualSetupFarm = (id) => {
    setChildSetupMode('farm');
    setChildSetupFarmId(id);
    setChildSetupOpen(true);
  };

  const handleSkip = () => {
    completeOnboarding();
    setShowSetupModal(false);
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else {
      completeOnboarding();
      setShowSetupModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112619]/80 backdrop-blur-md p-4">
      {/* Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-3xl shadow-2xl w-full max-w-lg p-8 overflow-hidden text-center relative max-h-[90vh] flex flex-col justify-between"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <Sprout className="text-primary" size={20} />
            <span className="text-sm font-black text-gray-900 tracking-wider uppercase">Setup Location</span>
          </div>
          <span className="text-xs font-black text-primary bg-emerald-50 px-3 py-1 rounded-full uppercase">Step {step} of 2</span>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-emerald-50 text-primary rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
                  <MapPin size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Welcome to AgroSmart! 🌾</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
                    Let's set your home location for accurate local weather alerts, mandi market prices, and personal recommendations.
                  </p>
                </div>

                {homeLocation ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-150 flex items-center justify-between max-w-xs mx-auto">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="text-primary shrink-0" size={20} />
                      <div className="text-left">
                        <span className="text-xs font-black uppercase text-green-600 block">Home Set</span>
                        <span className="text-sm font-bold">{homeLocation.city}, {homeLocation.state}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleManualSetupHome}
                      className="text-[10px] font-black uppercase text-primary hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-xs mx-auto pt-2">
                    <button
                      onClick={handleGPSEnergy}
                      disabled={gpsLoading}
                      className="w-full py-3.5 px-6 bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-60 transition-all duration-300 cursor-pointer"
                    >
                      {gpsLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <LocateFixed size={16} />
                      )}
                      {gpsLoading ? 'Detecting Location...' : 'Detect My Location'}
                    </button>
                    {gpsError && (
                      <span className="text-xs text-red-500 font-bold block">{gpsError}</span>
                    )}

                    <button
                      onClick={handleManualSetupHome}
                      className="w-full py-3 px-6 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Search size={14} /> Search City Manually
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
                  <Compass size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Do you have farm plots?</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
                    You can set coordinates for each of your plots to receive personalized local weather forecasts directly at your fields.
                  </p>
                </div>

                {/* Plot List */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto px-1 pt-1.5">
                  {farms.length > 0 ? (
                    farms.map((farm) => (
                      <div key={farm.id} className="p-3.5 border border-gray-200 rounded-2xl flex items-center justify-between bg-gray-50 hover:bg-white hover:shadow-sm transition-all text-left">
                        <div>
                          <span className="text-sm font-bold text-gray-800 block truncate max-w-[180px]">{farm.label}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{farm.city}, {farm.state}</span>
                        </div>
                        <button
                          onClick={() => handleManualSetupFarm(farm.id)}
                          className="px-3 py-1.5 bg-white text-gray-500 hover:text-primary border border-gray-200 hover:border-primary rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer"
                        >
                          Edit Location
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center">
                      <span className="text-xs text-gray-400 font-bold block">No plots registered yet</span>
                      <span className="text-[10px] text-gray-400 mt-1 block">You can add your fields and set locations later from Land Management.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-gray-100 mt-8 flex items-center justify-between shrink-0">
          <button
            onClick={handleSkip}
            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
          
          <button
            onClick={handleNextStep}
            className="py-3 px-6 bg-emerald-50 hover:bg-emerald-100 text-primary rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {step === 1 ? 'Next' : 'Done'}
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>

      {/* Child Location Setup Modal */}
      <LocationSetupModal
        isOpen={childSetupOpen}
        onClose={() => {
          setChildSetupOpen(false);
          refreshAllLocations();
        }}
        mode={childSetupMode}
        farmId={childSetupFarmId}
        initialLocation={
          childSetupMode === 'home' 
            ? homeLocation 
            : farms.find(f => f.id === childSetupFarmId)
        }
      />
    </div>
  );
};

export default LocationOnboardingModal;
