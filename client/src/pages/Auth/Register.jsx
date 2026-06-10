import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import FormInput from '../../components/common/FormInput';
import PasswordStrength, { getPasswordStrength } from '../../components/common/PasswordStrength';
import AuthRightPanel from '../../components/auth/AuthRightPanel';

const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Reusable Dropdown select matching design system
const FormSelect = ({ label, name, icon: Icon, value, onChange, onBlur, error, options, placeholder, required }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-gray-400 pointer-events-none transition-colors duration-200">
            <Icon size={16} />
          </div>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          className={`
            w-full pl-10 pr-10 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400
            transition-all duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer
            ${error 
              ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
              : value 
                ? 'border-green-400 focus:ring-green-100 focus:border-green-500' 
                : 'border-gray-200 focus:ring-green-500/10 focus:border-green-500'
            }
            shadow-sm
          `}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-red-500 mt-1 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const { addFarm } = useFarm();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    state: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Live Password Match state
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  // Validation helper
  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullName') {
      if (!value) {
        error = 'Full name is required';
      } else if (value.trim().length < 2) {
        error = 'Name must be at least 2 characters';
      }
    } else if (name === 'email') {
      if (!value) {
        error = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (name === 'phone') {
      if (!value) {
        error = 'Phone number is required';
      } else if (!/^\d{10}$/.test(value)) {
        error = 'Phone number must be exactly 10 digits';
      }
    } else if (name === 'state') {
      if (!value) {
        error = 'Please select your state';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      } else {
        const { score } = getPasswordStrength(value);
        if (score < 4) {
          error = 'Password must be at least 8 characters, contain 1 uppercase, 1 lowercase, 1 number, and 1 special character';
        }
      }
    } else if (name === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password';
      } else if (value !== formData.password) {
        error = 'Passwords do not match';
      }
    } else if (name === 'terms') {
      if (!value) {
        error = 'You must agree to the Terms & Conditions';
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
    
    // For live match checking on confirm password
    if (field === 'password' && touched.confirmPassword) {
      const error = value === formData.confirmPassword ? '' : 'Passwords do not match';
      setErrors(prev => ({ ...prev, confirmPassword: error }));
    }

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });

    setErrors(newErrors);
    
    // Set all fields to touched
    const touchedAll = {};
    Object.keys(formData).forEach((key) => {
      touchedAll[key] = true;
    });
    setTouched(touchedAll);

    // Check if any errors
    const hasError = Object.values(newErrors).some(err => err !== '');
    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      const userResult = await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: `+91${formData.phone}`
      });

      if (userResult) {
        // Create initial default farm plot in the DB
        try {
          await addFarm({
            farmName: `${formData.fullName.split(' ')[0]}'s Farm`,
            state: formData.state,
            cityVillage: formData.state, // fallback
            location: formData.state,
            acres: 0,
            experienceYears: 0
          });
        } catch (farmErr) {
          console.error("Failed to initialize farm record:", farmErr);
        }
      }

      navigate('/dashboard');
    } catch (err) {
      setApiError(err || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-green-100 selection:text-[#1a3c2e]">
      
      {/* LEFT PANEL: Form Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-between py-12 px-6 sm:px-12 lg:px-16 xl:px-24 min-h-screen overflow-y-auto">
        
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
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create your account 🌱</h2>
            <p className="text-sm text-gray-500">Join thousands of smart farmers on AgroSmart</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <FormInput
                label="Full Name"
                name="fullName"
                type="text"
                placeholder="Kartik Lamba"
                icon={User}
                value={formData.fullName}
                onChange={(val) => handleChange('fullName', val)}
                onBlur={() => handleBlur('fullName')}
                error={touched.fullName && errors.fullName}
                isValid={touched.fullName && !errors.fullName}
                required
              />
            </motion.div>

            {/* Email Address */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
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

            {/* Phone Number */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="98765 43210"
                icon={Phone}
                prefix="+91"
                value={formData.phone}
                onChange={(val) => handleChange('phone', val.replace(/\D/g, '').slice(0, 10))}
                onBlur={() => handleBlur('phone')}
                error={touched.phone && errors.phone}
                isValid={touched.phone && !errors.phone}
                required
              />
            </motion.div>

            {/* Indian State Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <FormSelect
                label="Your State"
                name="state"
                icon={MapPin}
                value={formData.state}
                placeholder="Select State / UT"
                options={INDIAN_STATES_AND_UTS}
                onChange={(val) => handleChange('state', val)}
                onBlur={() => handleBlur('state')}
                error={touched.state && errors.state}
                required
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="space-y-1.5"
            >
              <FormInput
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
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
              <PasswordStrength password={formData.password} />
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="space-y-1"
            >
              <div className="flex justify-between items-center">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                {formData.confirmPassword && (
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordsMatch ? (
                      <>
                        <Check size={12} className="stroke-[3]" /> Matches
                      </>
                    ) : (
                      <>
                        <X size={12} className="stroke-[3]" /> Doesn't match
                      </>
                    )}
                  </span>
                )}
              </div>
              <FormInput
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                icon={Lock}
                rightIcon={showConfirmPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                value={formData.confirmPassword}
                onChange={(val) => handleChange('confirmPassword', val)}
                onBlur={() => handleBlur('confirmPassword')}
                error={touched.confirmPassword && errors.confirmPassword}
                isValid={touched.confirmPassword && passwordsMatch}
                required
              />
            </motion.div>

            {/* Terms and Conditions Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="pt-2"
            >
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => handleChange('terms', e.target.checked)}
                  onBlur={() => handleBlur('terms')}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1e4d35] focus:ring-[#1e4d35]"
                />
                <span className="text-xs font-medium text-gray-600 leading-snug">
                  I agree to the{' '}
                  <button type="button" className="text-[#22c55e] font-bold hover:underline">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="text-[#22c55e] font-bold hover:underline">Privacy Policy</button>
                </span>
              </label>
              {touched.terms && errors.terms && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.terms}</p>
              )}
            </motion.div>

            {/* API Error Display */}
            {apiError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 font-bold bg-red-50 border border-red-100 p-3 rounded-lg text-center mt-2"
              >
                {apiError}
              </motion.div>
            )}

            {/* Create Account Button */}
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
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </motion.button>
          </form>

          {/* Switch Link */}
          <p className="mt-8 text-center text-sm font-semibold text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#22c55e] hover:text-[#1e4d35] font-bold transition-colors">
              Sign in
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

export default Signup;
