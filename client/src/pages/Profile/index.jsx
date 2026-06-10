import React from 'react';
import DashboardLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
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
  Sprout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, uploadAvatar } = useAuth();
  const { farmData, t } = useFarm();
  const navigate = useNavigate();

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
                  {farmData.cityVillage || 'Ludhiana'}, {farmData.state || 'Punjab'}
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
              <InfoRow icon={MapPin} label="Farm Location" value={`${farmData.cityVillage}, ${farmData.state}, India`} />
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
      </motion.div>
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
