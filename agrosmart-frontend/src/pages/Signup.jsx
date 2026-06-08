import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Navigation,
  ArrowRight,
  Activity,
  Phone,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { getCurrentLocation, reverseGeocode } from '../utils/geoUtils';

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
        required
      />
    </div>
  </div>
);

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-4">
     <div className="w-10 h-10 mt-1 rounded-xl bg-black/20 flex items-center justify-center border border-white/10 shrink-0">
        <Icon size={20} className="text-sky-blue" />
     </div>
     <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-sm text-white/70 font-medium leading-relaxed">{desc}</p>
     </div>
  </div>
);

const Signup = () => {
  const { signup } = useAuth();
  const { updateFarm } = useFarm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dob: '',
    state: '',
    cityVillage: '',
    password: ''
  });

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    if (pass.length < 5) return 1;
    if (pass.length < 8) return 2;
    return 3;
  };

  const strength = getPasswordStrength(formData.password);

  const handleAutoFetch = async () => {
    setGeoLoading(true);
    setError('');
    try {
      const coords = await getCurrentLocation();
      const address = await reverseGeocode(coords.lat, coords.lon);
      if (address) {
        setFormData(prev => ({
          ...prev,
          state: address.state,
          cityVillage: address.city
        }));
      }
    } catch (err) {
      setError("Could not fetch location automatically. Please enter manually.");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userResult = await signup({
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob
      });

      if (userResult) {
        await updateFarm({
          farmName: `${formData.name.split(' ')[0]}'s Farm`,
          state: formData.state,
          cityVillage: formData.cityVillage,
          location: `${formData.cityVillage}, ${formData.state}`,
          acres: 0, 
          experienceYears: 0 
        });
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-body selection:bg-fresh-green/20 selection:text-deep-green">
      
      {/* Left Panel - Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col p-12 xl:p-16 justify-center">
        {/* Background Hero Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: 'url("/assets/images/branding-hero.png")' }}
        />
        {/* Localized dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10" />

        <div className="relative z-20 w-full max-w-lg text-white">
          <Link to="/" className="inline-flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity group">
            <div className="w-12 h-12 bg-deep-green rounded-2xl flex items-center justify-center shadow-lg shadow-deep-green/20 group-hover:scale-105 transition-transform">
              <span className="text-2xl">🌾</span>
            </div>
            <span className="text-3xl font-black tracking-widest uppercase italic">Agro<span className="text-fresh-green">Smart</span></span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] mb-8 tracking-tighter drop-shadow-2xl">
              Precision farming, <br/> 
              <span className="text-wheat-yellow italic">data-driven yields.</span>
            </h1>
            <p className="text-white text-lg leading-relaxed mb-10 font-bold drop-shadow-lg">
              Join the ecosystem of modern farmers managing harvests, live markets, and AI diagnostics flawlessly.
            </p>

            <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6">
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={24} className="text-sky-blue" />
               </div>
               <div>
                  <h3 className="font-bold text-white mb-1">Enterprise Grade Security</h3>
                  <p className="text-sm text-white/60 font-medium">Your agricultural data is protected using end-to-end AES-256 encryption.</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative p-8 lg:p-12 xl:p-20 bg-white min-h-screen overflow-y-auto custom-scrollbar">
        
        {/* Mobile Header mb */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-10 pt-4">
          <div className="w-10 h-10 bg-deep-green rounded-xl flex items-center justify-center">
            <span className="text-xl">🌾</span>
          </div>
           <span className="text-2xl font-black tracking-widest uppercase italic text-gray-900">Agro<span className="text-fresh-green">Smart</span></span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[480px] mx-auto"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">Create account</h2>
            <p className="text-gray-500 font-semibold text-base">Setup your profile in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
              >
                <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm font-bold text-red-800 leading-snug">{error}</p>
              </motion.div>
            )}

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ModernInput 
                  label="Full Name" 
                  icon={User} 
                  value={formData.name} 
                  onChange={(v) => setFormData({...formData, name: v})}
                  placeholder="First Last"
                />
                <ModernInput 
                  label="Email Address" 
                  icon={Mail} 
                  type="email"
                  value={formData.email} 
                  onChange={(v) => setFormData({...formData, email: v})}
                  placeholder="farmer@domain.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <ModernInput 
                  label="Phone Number" 
                  icon={Phone} 
                  type="tel"
                  value={formData.phoneNumber} 
                  onChange={(v) => setFormData({...formData, phoneNumber: v})}
                  placeholder="+91 98XXX XXXXX"
                />
                <ModernInput 
                  label="Date of Birth" 
                  icon={Calendar} 
                  type="date"
                  value={formData.dob} 
                  onChange={(v) => setFormData({...formData, dob: v})}
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-bold text-gray-900">Location Details</h3>
                   <button 
                     type="button" 
                     onClick={handleAutoFetch}
                     disabled={geoLoading}
                     className="text-xs font-black uppercase tracking-widest text-deep-green hover:text-fresh-green transition-colors flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"
                   >
                     {geoLoading ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
                     Auto-detect
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ModernInput 
                    label="State" 
                    icon={MapPin} 
                    value={formData.state} 
                    onChange={(v) => setFormData({...formData, state: v})}
                    placeholder="E.g. Punjab"
                  />
                  <ModernInput 
                    label="City / District" 
                    icon={MapPin} 
                    value={formData.cityVillage} 
                    onChange={(v) => setFormData({...formData, cityVillage: v})}
                    placeholder="E.g. Ludhiana"
                  />
                </div>
              </div>

              <div className="pt-2">
                  <ModernInput 
                    label="Create Password" 
                    icon={Lock} 
                    type="password"
                    value={formData.password} 
                    onChange={(v) => setFormData({...formData, password: v})}
                    placeholder="••••••••"
                  />
                  
                  {/* Password Strength Indicator */}
                  <div className="mt-2.5 flex items-center gap-2">
                     <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full transition-all duration-500 rounded-full ${strength >= 1 ? 'bg-red-500 w-1/3' : 'w-0'}`} />
                        <div className={`h-full transition-all duration-500 rounded-full ${strength >= 2 ? 'bg-[#FBC02D] w-1/3' : 'w-0'}`} />
                        <div className={`h-full transition-all duration-500 rounded-full ${strength >= 3 ? 'bg-[#4CAF50] w-1/3' : 'w-0'}`} />
                     </div>
                     <span className="text-xs font-bold text-gray-400 w-12 text-right">
                        {strength === 0 && 'Weak'}
                        {strength === 1 && 'Weak'}
                        {strength === 2 && 'Good'}
                        {strength === 3 && 'Strong'}
                     </span>
                  </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 mt-8 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span className="tracking-wide">Create Account</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="text-deep-green hover:text-fresh-green font-black ml-1 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
