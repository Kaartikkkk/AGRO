import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Sprout,
  ShieldCheck
} from 'lucide-react';

const ModernInput = ({ label, icon: Icon, type = "text", ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-fresh-green transition-colors">
        <Icon size={20} />
      </div>
      <input 
        type={type}
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:border-fresh-green focus:ring-4 focus:ring-fresh-green/10 outline-none transition-all duration-300 shadow-sm font-medium"
        required
      />
    </div>
  </div>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-body selection:bg-fresh-green/20 selection:text-deep-green">
      
      {/* Left Panel - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
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

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative p-8 lg:p-16 xl:p-24 bg-white">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
          <div className="w-10 h-10 bg-deep-green rounded-xl flex items-center justify-center">
            <span className="text-xl">🌾</span>
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-widest uppercase italic">Agro<span className="text-fresh-green">Smart</span></span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">Welcome back</h2>
            <p className="text-gray-500 text-base font-semibold">Sign in to your dashboard to continue.</p>
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
              <ModernInput 
                label="Email Address" 
                icon={Mail} 
                type="email"
                value={email} 
                onChange={setEmail}
                placeholder="Ex. farmer@domain.com"
              />

              <ModernInput 
                label="Password" 
                icon={Lock} 
                type="password"
                value={password} 
                onChange={setPassword}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-deep-green focus:ring-deep-green border-gray-300 accent-deep-green" />
                <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm font-bold text-deep-green hover:text-fresh-green transition-colors">
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 mt-4 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span className="tracking-wide">Sign In</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500 font-semibold">
            Don't have an account?{' '}
            <Link to="/signup" className="text-deep-green hover:text-fresh-green font-black ml-1 transition-colors">
              Create one now
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
