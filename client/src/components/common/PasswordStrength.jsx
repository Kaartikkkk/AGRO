import React from 'react';

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200' };
  
  let score = 0;
  
  // Criteria 1: length
  if (password.length >= 8) score += 1;
  else return { score: 1, label: 'Weak', color: 'bg-red-500' }; // Always weak if less than 8 chars
  
  // Criteria 2: contains uppercase & lowercase
  const hasMixed = /[a-z]/.test(password) && /[A-Z]/.test(password);
  if (hasMixed) score += 1;
  
  // Criteria 3: contains numbers
  const hasNumbers = /\d/.test(password);
  if (hasNumbers) score += 1;
  
  // Criteria 4: contains special characters
  const hasSpecials = /[!@#$%^&*(),.?\":{}|<>]/.test(password);
  if (hasSpecials) score += 1;
  
  if (score <= 1) {
    return { score: 1, label: 'Weak', color: 'bg-red-500' };
  } else if (score === 2) {
    return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  } else if (score === 3) {
    return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  } else {
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  }
};

const PasswordStrength = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);
  
  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500 font-medium">Password Strength:</span>
        <span className={`font-bold ${
          score === 1 ? 'text-red-500' :
          score === 2 ? 'text-orange-500' :
          score === 3 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {label}
        </span>
      </div>
      <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-300 rounded-full ${score >= 1 ? 'bg-red-500 w-1/4' : 'w-0'}`} />
        <div className={`h-full transition-all duration-300 rounded-full ${score >= 2 ? 'bg-orange-500 w-1/4' : 'w-0'}`} />
        <div className={`h-full transition-all duration-300 rounded-full ${score >= 3 ? 'bg-yellow-500 w-1/4' : 'w-0'}`} />
        <div className={`h-full transition-all duration-300 rounded-full ${score >= 4 ? 'bg-green-500 w-1/4' : 'w-0'}`} />
      </div>
    </div>
  );
};

export default PasswordStrength;
