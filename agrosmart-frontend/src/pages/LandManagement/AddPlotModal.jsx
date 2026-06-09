import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/layout/Toast';
import { landApi } from './landManagement.api';
import { getExpectedHarvestDate } from '../../utils/cropSeasonDates';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { X, Check, ArrowRight, ArrowLeft, MapPin, Compass, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons in Vite packaging
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map click event listener to update location pin coordinates
const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// 28 Indian States & 8 Union Territories list
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const CROPS = [
  'Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Mustard', 
  'Soybean', 'Groundnut', 'Pulses', 'Vegetables', 'Fallow/Empty'
];

const IRRIGATION_SOURCES = [
  'Canal', 'Borewell', 'Rainwater', 'Drip Irrigation', 'Well / Tube Well', 'None'
];

const AddPlotModal = ({ isOpen, onClose, onSave, editingPlot = null }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    plotName: '',
    size: '',
    sizeUnit: 'acres',
    landType: 'irrigated',
    ownership: 'owned',
    notes: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    latitude: 30.7333, // Default to Punjab/Chandigarh region
    longitude: 76.7794,
    currentCrop: 'Wheat',
    sowingDate: '',
    harvestDate: '',
    previousCrop: '',
    irrigationSource: 'Borewell'
  });

  const [errors, setErrors] = useState({});

  // Reset or pre-fill form data when modal open state changes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      if (editingPlot) {
        setFormData({
          plotName: editingPlot.plotName || '',
          size: editingPlot.size || '',
          sizeUnit: editingPlot.sizeUnit || 'acres',
          landType: editingPlot.landType || 'irrigated',
          ownership: editingPlot.ownership || 'owned',
          notes: editingPlot.notes || '',
          village: editingPlot.village || '',
          district: editingPlot.district || '',
          state: editingPlot.state || '',
          pincode: editingPlot.pincode || '',
          latitude: editingPlot.latitude ? parseFloat(editingPlot.latitude) : 30.7333,
          longitude: editingPlot.longitude ? parseFloat(editingPlot.longitude) : 76.7794,
          currentCrop: editingPlot.currentCrop || 'Wheat',
          sowingDate: editingPlot.sowingDate || '',
          harvestDate: editingPlot.harvestDate || '',
          previousCrop: editingPlot.previousCrop || '',
          irrigationSource: editingPlot.irrigationSource || 'Borewell'
        });
      } else {
        setFormData({
          plotName: '',
          size: '',
          sizeUnit: 'acres',
          landType: 'irrigated',
          ownership: 'owned',
          notes: '',
          village: '',
          district: '',
          state: '',
          pincode: '',
          latitude: 30.7333,
          longitude: 76.7794,
          currentCrop: 'Wheat',
          sowingDate: new Date().toISOString().split('T')[0],
          harvestDate: '',
          previousCrop: '',
          irrigationSource: 'Borewell'
        });
      }
    }
  }, [isOpen, editingPlot]);

  // Auto-fill expected harvest date when crop or sowing date changes
  useEffect(() => {
    if (formData.currentCrop && formData.sowingDate) {
      const calculatedHarvest = getExpectedHarvestDate(formData.currentCrop, formData.sowingDate);
      setFormData(prev => ({ ...prev, harvestDate: calculatedHarvest }));
    }
  }, [formData.currentCrop, formData.sowingDate]);

  // Postal Pin Code Lookup
  const handlePincodeChange = async (e) => {
    const code = e.target.value;
    setFormData(prev => ({ ...prev, pincode: code }));
    
    if (code.length === 6 && /^\d+$/.test(code)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
        const data = await res.json();
        
        if (data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            district: po.District,
            state: INDIAN_STATES.find(s => s.toLowerCase() === po.State.toLowerCase()) || prev.state,
            village: po.Name
          }));
          showToast({
            type: 'success',
            title: 'Pincode Verified',
            message: `Autofilled: ${po.Name}, ${po.District}, ${po.State}`
          });
        }
      } catch (err) {
        console.error('Pincode autocomplete failed:', err);
      }
    }
  };

  // Browser Geolocation
  const detectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          showToast({
            type: 'success',
            title: 'GPS Coordinates Captured',
            message: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
          });
        },
        (error) => {
          showToast({
            type: 'error',
            title: 'Location Capture Failed',
            message: error.message || 'Please permit browser location permissions.'
          });
        }
      );
    } else {
      showToast({
        type: 'error',
        title: 'Not Supported',
        message: 'Geolocation API is not supported by your browser.'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleMapClick = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  // Step Validations
  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.plotName.trim()) newErrors.plotName = 'Plot name is required';
      if (!formData.size || parseFloat(formData.size) <= 0) newErrors.size = 'Must be a positive number';
    } else if (step === 2) {
      if (!formData.village.trim()) newErrors.village = 'Village / Town is required';
      if (!formData.district.trim()) newErrors.district = 'District is required';
      if (!formData.state) newErrors.state = 'State selection is required';
      if (!formData.pincode.trim() || formData.pincode.length !== 6) newErrors.pincode = 'Must enter 6-digit Pincode';
    } else if (step === 3) {
      if (!formData.sowingDate) newErrors.sowingDate = 'Sowing date is required';
      if (!formData.harvestDate) newErrors.harvestDate = 'Expected harvest date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      if (editingPlot) {
        const updated = await landApi.updatePlot(editingPlot.id, formData);
        showToast({
          type: 'success',
          title: 'Plot Updated',
          message: `Successfully updated plot details for ${formData.plotName}.`
        });
        onSave(updated);
      } else {
        const created = await landApi.createPlot(formData);
        showToast({
          type: 'success',
          title: 'Plot Created',
          message: `Successfully registered new plot: ${formData.plotName}.`
        });
        onSave(created);
      }
      onClose();
    } catch (err) {
      console.error('Error saving plot:', err);
      showToast({
        type: 'error',
        title: 'Save Plot Failed',
        message: err.response?.data?.message || 'Error occurred while saving plot. Check fields.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-surface-alt">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  {editingPlot ? `Edit Plot: ${formData.plotName}` : 'Add New Plot'}
                </h3>
                <p className="text-xs text-gray-400">Step {step} of 3</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-1">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Plot Name *</label>
                      <input
                        type="text"
                        name="plotName"
                        value={formData.plotName}
                        onChange={handleInputChange}
                        placeholder="e.g. North Field, Orchard Block"
                        className={`input-field mt-1 ${errors.plotName ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                      />
                      {errors.plotName && (
                        <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle size={10} /> {errors.plotName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Size *</label>
                      <div className="flex mt-1 border border-border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                        <input
                          type="number"
                          step="0.01"
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          placeholder="Size"
                          className="w-2/3 px-3 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                        />
                        <select
                          name="sizeUnit"
                          value={formData.sizeUnit}
                          onChange={handleInputChange}
                          className="w-1/3 px-2 py-2 text-xs bg-gray-50 border-l border-border focus:outline-none focus:ring-0 text-gray-600 select-clean cursor-pointer"
                        >
                          <option value="acres">Acres</option>
                          <option value="bigha">Bigha</option>
                          <option value="hectare">Hectare</option>
                        </select>
                      </div>
                      {errors.size && (
                        <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle size={10} /> {errors.size}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600">Land Type</label>
                      <select
                        name="landType"
                        value={formData.landType}
                        onChange={handleInputChange}
                        className="input-field mt-1 cursor-pointer select-clean"
                      >
                        <option value="irrigated">Irrigated (Treated)</option>
                        <option value="rain-fed">Rain-fed (Barani)</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Ownership Type</label>
                      <select
                        name="ownership"
                        value={formData.ownership}
                        onChange={handleInputChange}
                        className="input-field mt-1 cursor-pointer select-clean"
                      >
                        <option value="owned">Owned</option>
                        <option value="leased">Leased</option>
                        <option value="shared">Shared / Partnership</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600">Plot Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Soil history, general health logs, topography information..."
                        className="input-field mt-1 h-20 resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Location Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        maxLength="6"
                        value={formData.pincode}
                        onChange={handlePincodeChange}
                        placeholder="6-digit Pincode"
                        className={`input-field mt-1 ${errors.pincode ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                      />
                      {errors.pincode && (
                        <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle size={10} /> {errors.pincode}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600">Village / Town *</label>
                      <input
                        type="text"
                        name="village"
                        value={formData.village}
                        onChange={handleInputChange}
                        placeholder="Village name"
                        className={`input-field mt-1 ${errors.village ? 'border-rose-400' : ''}`}
                      />
                      {errors.village && (
                        <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle size={10} /> {errors.village}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">District *</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="District"
                        className={`input-field mt-1 ${errors.district ? 'border-rose-400' : ''}`}
                      />
                      {errors.district && (
                        <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle size={10} /> {errors.district}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600">State *</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`input-field mt-1 cursor-pointer select-clean ${errors.state ? 'border-rose-400' : ''}`}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle size={10} /> {errors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* GPS & Map */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                        <MapPin size={14} className="text-primary" /> GPS Location
                      </label>
                      <button
                        type="button"
                        onClick={detectLocation}
                        className="text-[10px] font-bold text-primary hover:text-primary-dark bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Compass size={12} className="animate-spin-slow" /> Detect Location
                      </button>
                    </div>

                    {/* Coordinates input */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-border">
                      <div>
                        <span className="text-gray-400">Latitude:</span> <span className="font-bold text-gray-700">{formData.latitude?.toFixed(5) || '30.73330'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Longitude:</span> <span className="font-bold text-gray-700">{formData.longitude?.toFixed(5) || '76.77940'}</span>
                      </div>
                    </div>

                    {/* Leaflet Interactive Map */}
                    <div className="h-44 w-full rounded-xl overflow-hidden border border-border z-10">
                      <MapContainer 
                        center={[formData.latitude, formData.longitude]} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap'
                        />
                        <Marker position={[formData.latitude, formData.longitude]} />
                        <MapEventsHandler onMapClick={handleMapClick} />
                      </MapContainer>
                    </div>
                    <p className="text-[10px] text-gray-400 italic text-center">Click on the map to place the location pin marker.</p>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Crop Details */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Current Crop</label>
                      <select
                        name="currentCrop"
                        value={formData.currentCrop}
                        onChange={handleInputChange}
                        className="input-field mt-1 cursor-pointer select-clean"
                      >
                        {CROPS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600">Previous Crop</label>
                      <select
                        name="previousCrop"
                        value={formData.previousCrop}
                        onChange={handleInputChange}
                        className="input-field mt-1 cursor-pointer select-clean"
                      >
                        <option value="">None / Fallow</option>
                        {CROPS.filter(c => c !== 'Fallow/Empty').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Sowing Date *</label>
                      <input
                        type="date"
                        name="sowingDate"
                        value={formData.sowingDate}
                        onChange={handleInputChange}
                        className={`input-field mt-1 ${errors.sowingDate ? 'border-rose-400' : ''}`}
                      />
                      {errors.sowingDate && (
                        <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle size={10} /> {errors.sowingDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600">Expected Harvest Date *</label>
                      <input
                        type="date"
                        name="harvestDate"
                        value={formData.harvestDate}
                        onChange={handleInputChange}
                        className={`input-field mt-1 ${errors.harvestDate ? 'border-rose-400' : ''}`}
                      />
                      {errors.harvestDate && (
                        <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle size={10} /> {errors.harvestDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Irrigation Source</label>
                      <select
                        name="irrigationSource"
                        value={formData.irrigationSource}
                        onChange={handleInputChange}
                        className="input-field mt-1 cursor-pointer select-clean"
                      >
                        {IRRIGATION_SOURCES.map(source => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </form>

            {/* Footer Control Buttons */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-surface-alt">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-800 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-primary hover:bg-primary-dark px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <>
                        <Check size={14} /> {editingPlot ? 'Save Changes' : 'Register Plot'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddPlotModal;
