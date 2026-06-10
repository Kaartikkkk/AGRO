import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  icon: Icon, 
  rightIcon: RightIcon, 
  onRightIconClick, 
  error, 
  value, 
  onChange, 
  onBlur,
  required = false,
  isValid = false,
  prefix
}) => {
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
        {prefix && (
          <span className={`absolute ${Icon ? 'left-9' : 'left-3.5'} text-sm font-semibold text-gray-500 pointer-events-none select-none`}>
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          className={`
            w-full ${Icon ? (prefix ? 'pl-20' : 'pl-10') : (prefix ? 'pl-14' : 'pl-4')} ${RightIcon ? 'pr-10' : 'pr-4'} py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400
            transition-all duration-200 focus:outline-none focus:ring-2
            ${error 
              ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
              : isValid 
                ? 'border-green-400 focus:ring-green-100 focus:border-green-500' 
                : 'border-gray-200 focus:ring-green-500/10 focus:border-green-500'
            }
            shadow-sm
          `}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RightIcon size={16} />
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormInput;
