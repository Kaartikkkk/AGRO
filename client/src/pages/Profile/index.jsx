import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useLocation } from '../../context/LocationContext';
import LocationSetupModal from '../../components/common/LocationSetupModal';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Maximize2, 
  Calendar,
  Edit3,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Sprout,
  Home,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, uploadAvatar } = useAuth();
  const { farmData, t } = useFarm();
  const { homeLocation, farms, refreshAllLocations } = useLocation();
  const navigate = useNavigate();

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [setupModalMode, setSetupModalMode] = useState('home');
  const [setupModalFarmId, setSetupModalFarmId] = useState(null);

  const handleEditLocationClick = (mode, farmId = null) => {
    setSetupModalMode(mode);
    setSetupModalFarmId(farmId);
    setIsSetupModalOpen(true);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      try {
        await uploadAvatar(formData);
      } catch (err) {
        console.error("Failed to upload avatar:", err);
      }
    }
  };

  const getMemberSince = () => {
    if (!user?.createdAt) return 'March 2026';
    const d = new Date(user.createdAt);
    return isNaN(d.getTime()) ? 'March 2026' : d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };
  const memberSince = getMemberSince();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.4, staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your account and farm details">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Profile Hero Card */}
        <div className="card p-6 lg:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <input 
                type="file" 
                id="avatar-input" 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
              {user?.avatarUrl ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${user.avatarUrl}`} 
                  alt="Avatar" 
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-primary text-white flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white">
                  {user?.fullName?.[0] || 'F'}
                </div>
              )}
              <button 
                onClick={() => document.getElementById('avatar-input').click()} 
                className="absolute -bottom-1 -right-1 p-2 bg-accent text-white rounded-xl shadow-md hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {user?.fullName || 'Farmer Name'}
                </h2>
                <ShieldCheck size={20} className="text-blue-500" />
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-1.5 mb-4">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {homeLocation?.city || 'Ludhiana'}, {homeLocation?.state || 'Punjab'}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <div className="badge-success">
                  <Calendar size={12} />
                  Member since {memberSince}
                </div>
                <div className="badge bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 size={12} />
                  {user?.tier || 'Golden Tier'} Farmer
                </div>
              </div>
            </div>

            {/* Edit CTA */}
            <button 
              onClick={() => navigate('/complete-profile')}
              className="btn-primary flex items-center gap-2 shrink-0"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Incomplete Profile Warning */}
        {farmData.acres === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-accent-50 border-amber-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-accent text-white rounded-xl shrink-0">
                <Sprout size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-0.5">Complete Your Farm Setup</h3>
                <p className="text-xs text-gray-500">Add land details to unlock AI yield predictions and recommendations.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/complete-profile')}
              className="btn-primary text-sm shrink-0"
            >
              Complete Profile
            </button>
          </motion.div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <motion.div variants={itemVariants} className="card p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                <User size={20} />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Account Details</h3>
            </div>

            <div className="space-y-5">
              <InfoRow icon={Mail} label="Email Address" value={user?.email || 'N/A'} />
              <InfoRow icon={Phone} label="Phone" value={user?.phoneNumber || '+91 98XXX XXXXX'} />
              <InfoRow icon={Calendar} label="Date of Birth" value={user?.dob || 'Not Provided'} />
              <InfoRow icon={MapPin} label="Farm Location" value={homeLocation ? `${homeLocation.city}, ${homeLocation.state}, India` : 'Not Set'} />
            </div>
          </motion.div>

          {/* Farm Profile */}
          <motion.div variants={itemVariants} className="card p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-accent-50 text-amber-600 rounded-xl">
                <Briefcase size={20} />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Farm Profile</h3>
            </div>

            <div className="space-y-5">
              <InfoRow icon={Briefcase} label="Experience" value={`${farmData.experienceYears} Years`} />
              <InfoRow icon={Maximize2} label="Land Size" value={`${farmData.acres} Acres`} />
              <InfoRow icon={CheckCircle2} label="Current Crop" value={farmData.cropType || 'Wheat'} />
              <InfoRow icon={MapPin} label="Soil Type" value={farmData.soilType || 'Alluvial'} />
            </div>
          </motion.div>
        </div>

        {/* SECTION: My Locations */}
        <motion.div variants={itemVariants} className="card p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2.5 bg-emerald-50 text-primary rounded-xl">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">📍 My Locations</h3>
              <p className="text-xs text-gray-505 font-medium mt-0.5">Manage default and plot-specific locations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SUBSECTION A: Home Location */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Home Location</h4>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Your residence — used as default location when no farm is active</p>
              </div>

              {homeLocation ? (
                <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">
                        {homeLocation.city}, {homeLocation.district}, {homeLocation.state}
                      </span>
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full ${
                        homeLocation.source === 'gps' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {homeLocation.source?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold">
                      Pincode: {homeLocation.pincode || 'N/A'} • Coordinates: {homeLocation.latitude?.toFixed(4)}, {homeLocation.longitude?.toFixed(4)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditLocationClick('home')}
                    className="px-3.5 py-1.5 bg-white text-gray-600 hover:text-primary border border-gray-250 hover:border-primary text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/40 border border-dashed border-amber-200 rounded-2xl text-center">
                  <span className="text-xs font-bold text-amber-800 block mb-1">No Home Location Set</span>
                  <button
                    onClick={() => handleEditLocationClick('home')}
                    className="text-[10px] font-black uppercase text-primary hover:underline"
                  >
                    Set Home Location &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* SUBSECTION B: Farm Plot Locations */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Farm Plot Locations</h4>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Each field can have its own coordinates for personalized weather alerts</p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {farms.length > 0 ? (
                  farms.map((f) => (
                    <div key={f.id} className="p-3.5 border border-gray-200 rounded-2xl flex items-center justify-between bg-gray-50/50 hover:bg-white transition-all text-left">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800 truncate max-w-[120px]">{f.label}</span>
                          <span className="px-2 py-0.5 text-[8px] font-black uppercase rounded-full bg-emerald-100 text-emerald-800">
                            ✓ Location set
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold block">
                          {f.city}, {f.state} • {f.pincode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEditLocationClick('farm', f.id)}
                        className="px-3 py-1.5 bg-white text-gray-500 hover:text-primary border border-gray-200 hover:border-primary rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer"
                      >
                        Edit Location
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center">
                    <span className="text-xs text-gray-450 font-bold block">No farm plots configured</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Please add plot locations in Land Management.</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-semibold block pt-1">
                💡 All farms with geolocations get personalized weather forecasts and disease warnings.
              </span>
            </div>

          </div>
        </motion.div>
      </motion.div>

      {/* Location Setup Modal */}
      <LocationSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => {
          setIsSetupModalOpen(false);
          refreshAllLocations();
        }}
        mode={setupModalMode}
        farmId={setupModalFarmId}
        initialLocation={
          setupModalMode === 'home' 
            ? homeLocation 
            : farms.find(f => f.id === setupModalFarmId)
        }
      />
    </DashboardLayout>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3.5">
    <div className="p-2 text-gray-400 mt-0.5">
      <Icon size={18} />
    </div>
    <div>
      <div className="stat-label mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  </div>
);

export default Profile;
