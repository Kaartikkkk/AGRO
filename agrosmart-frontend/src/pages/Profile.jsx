import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Maximize2, 
  Calendar,
  ArrowLeft,
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
  const { user } = useAuth();
  const { farmData, t } = useFarm();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dynamic Date Formatting
  const getMemberSince = () => {
    if (!user?.createdAt) return 'March 2026';
    const d = new Date(user.createdAt);
    return isNaN(d.getTime()) ? 'March 2026' : d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };
  const memberSince = getMemberSince();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-body">
      <Sidebar isOpen={isSidebarOpen} setToggle={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-4 lg:p-12 max-w-6xl mx-auto w-full">
          {/* Header Navigation */}
          <div className="mb-10 flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 text-gray-500 hover:text-deep-green font-black transition-all group"
            >
              <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:bg-green-50 group-hover:border-green-100 transition-all">
                <ArrowLeft size={22} />
              </div>
              <span className="uppercase tracking-[0.2em] text-[10px]">Back to Farm Dashboard</span>
            </button>
            <button 
              onClick={() => navigate('/complete-profile')}
              className="bg-deep-green text-white py-4 px-8 rounded-3xl flex items-center gap-3 shadow-2xl shadow-green-200 transition-transform hover:bg-fresh-green hover:-translate-y-1 active:scale-95"
            >
              <Edit3 size={20} />
              <span className="font-black text-sm uppercase tracking-wider">Edit My Profile</span>
            </button>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Profile Hero Card */}
            <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden p-8 md:p-16 relative">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/5 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-wheat-yellow/5 blur-[80px] rounded-full -ml-20 -mb-20" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-[56px] bg-deep-green text-white flex items-center justify-center text-7xl font-black shadow-[0_32px_64px_-16px_rgba(30,71,46,0.25)] border-8 border-white/50 backdrop-blur-sm">
                    {user?.fullName?.[0] || 'F'}
                  </div>
                  <button onClick={() => alert("Image Upload Endpoint Coming Soon")} className="absolute bottom-2 right-2 p-3.5 bg-wheat-yellow text-white rounded-[24px] shadow-2xl border-4 border-white hover:scale-110 active:scale-90 transition-all">
                    <Camera size={22} />
                  </button>
                </div>

                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">
                      {user?.fullName || 'Farmer Name'}
                    </h1>
                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded-full border border-blue-100 shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-8">
                    <MapPin size={16} className="text-gray-300" />
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">
                      {farmData.cityVillage || 'Ludhiana'}, {farmData.state || 'Punjab'}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-deep-green rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100/50 shadow-sm">
                      <Calendar size={14} />
                      Member Since {memberSince}
                    </div>
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-sky-50 text-sky-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-sky-100/50 shadow-sm">
                      <CheckCircle2 size={14} />
                      Golden Tier Farmer
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completion Alert (Only if acres === 0) */}
            {farmData.acres === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-wheat-yellow/10 to-fresh-green/10 border border-wheat-yellow/20 rounded-[32px] p-8 flex flex-col md:row items-center justify-between gap-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-wheat-yellow text-white rounded-2xl flex items-center justify-center shadow-lg shadow-wheat-yellow/20">
                    <Sprout size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 mb-1 tracking-tight italic">Finish Your Farm Setup</h3>
                    <p className="text-sm font-bold text-gray-500">Your profile is missing detailed land metrics. Complete it to unlock AI yield predictions.</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/complete-profile')}
                  className="bg-black text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Complete Profile
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Account Information */}
              <motion.div variants={itemVariants} className="bg-white p-10 md:p-12 rounded-[48px] border border-gray-100 shadow-sm group hover:border-green-100 transition-colors">
                <div className="flex items-center gap-5 mb-12">
                  <div className="p-4 bg-sky-50 text-sky-500 rounded-3xl border border-sky-100 group-hover:scale-110 transition-transform">
                    <User size={28} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-800 tracking-tight">Account Details</h2>
                </div>

                <div className="space-y-10">
                  <InfoRow icon={Mail} label="Email Address" value={user?.email || 'N/A'} />
                  <InfoRow icon={Phone} label="Registered Phone" value={user?.phoneNumber || '+91 98XXX XXXXX'} />
                  <InfoRow icon={Calendar} label="Date of Birth" value={user?.dob || 'Not Provided'} />
                  <InfoRow icon={MapPin} label="Farm Location" value={`${farmData.cityVillage}, ${farmData.state}, India`} />
                </div>
              </motion.div>

              {/* Agricultural & Farm Profile */}
              <motion.div variants={itemVariants} className="bg-white p-10 md:p-12 rounded-[48px] border border-gray-100 shadow-sm group hover:border-wheat-yellow/30 transition-colors">
                <div className="flex items-center gap-5 mb-12">
                  <div className="p-4 bg-wheat-yellow/10 text-wheat-yellow rounded-3xl border border-wheat-yellow/10 group-hover:scale-110 transition-transform">
                    <Briefcase size={28} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-800 tracking-tight">Farm Profile</h2>
                </div>

                <div className="space-y-10">
                  <InfoRow icon={Briefcase} label="Field Experience" value={`${farmData.experienceYears} Years of Expertise`} />
                  <InfoRow icon={Maximize2} label="Total Land Size" value={`${farmData.acres} Acres`} />
                  <InfoRow icon={CheckCircle2} label="Current Harvest" value={farmData.cropType || 'Wheat'} />
                  <InfoRow icon={MapPin} label="Soil Structure" value={farmData.soilType || 'Alluvial'} />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <footer className="mt-20 py-16 border-t border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-8 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-center lg:text-left">
            <div className="space-y-2">
              <p>© 2026 AgroSmart Dashboard. Fully Dynamic System.</p>
              <p className="text-gray-300">Connected to PostgreSQL: {import.meta.env.VITE_DB_NAME || 'agrosmart'}</p>
            </div>
            <div className="flex items-center gap-10">
              <button onClick={() => alert("Privacy Node configured!")} className="hover:text-deep-green transition-colors">Privacy Node</button>
              <button onClick={() => alert("Cloud Sync active!")} className="hover:text-deep-green transition-colors">Cloud Sync</button>
              <button onClick={() => alert("Are you sure you want to delete your farm data? This cannot be undone.")} className="text-red-400 hover:text-red-600 transition-colors underline decoration-2 underline-offset-4">Security: Deactivate Account</button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-8 group/item">
    <div className="p-2.5 text-gray-300 group-hover/item:text-deep-green group-hover/item:scale-110 transition-all mt-1">
      <Icon size={24} />
    </div>
    <div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">{label}</div>
      <div className="text-xl md:text-2xl font-bold text-gray-800 group-hover/item:text-black transition-colors">{value}</div>
    </div>
  </div>
);

export default Profile;
