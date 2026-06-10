import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import AuthRightPanel from '../../components/auth/AuthRightPanel';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form validation helper
  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value) {
        error = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      }
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Validate all fields
    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };
    
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (newErrors.email || newErrors.password) {
      return;
    }

    setLoading(true);
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-green-100 selection:text-[#1a3c2e]">
      
      {/* LEFT PANEL: Form Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-between py-12 px-6 sm:px-12 lg:px-16 xl:px-24">
        
        {/* Mobile Logo Row */}
        <div className="flex items-center gap-2.5 mx-auto md:mx-0 md:self-start select-none">
          <img src="/logo.png" alt="AgroSmart Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold text-[#1a3c2e]">AgroSmart</span>
        </div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[420px] mx-auto my-auto py-8"
        >
          {/* Header */}
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back 👋</h2>
            <p className="text-sm text-gray-500">Sign in to your AgroSmart account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                value={formData.email}
                onChange={(val) => handleChange('email', val)}
                onBlur={() => handleBlur('email')}
                error={touched.email && errors.email}
                isValid={touched.email && !errors.email}
                required
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="space-y-1">
                <FormInput
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  icon={Lock}
                  rightIcon={showPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  value={formData.password}
                  onChange={(val) => handleChange('password', val)}
                  onBlur={() => handleBlur('password')}
                  error={touched.password && errors.password}
                  isValid={touched.password && !errors.password}
                  required
                />
                
                {/* Forgot Password */}
                <div className="flex justify-end pt-1">
                  <button 
                    type="button" 
                    className="text-xs font-semibold text-[#22c55e] hover:text-[#1e4d35] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </motion.div>

            {/* API Error Display */}
            {apiError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 font-bold bg-red-50 border border-red-100 p-3 rounded-lg text-center"
              >
                {apiError}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button 
              type="submit" 
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-11 bg-[#1e4d35] hover:bg-[#1a3c2e] text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed text-sm mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">or continue with</span>
          </div>

          {/* Google Button */}
          <motion.button 
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full h-11 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2.5 shadow-sm transition-all duration-200 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </motion.button>

          {/* Footer Link */}
          <p className="mt-8 text-center text-sm font-semibold text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#22c55e] hover:text-[#1e4d35] font-bold transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <div className="text-center md:text-left text-xs text-gray-400 font-medium select-none">
          &copy; 2026 AgroSmart. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL: Visual Panel */}
      <AuthRightPanel />

    </div>
  );
};

export default Login;
