import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <Loader2 className="animate-spin text-deep-green" size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-deep-green uppercase tracking-tighter">Agro</span>
          </div>
        </div>
        <p className="mt-4 text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Initializing Secure Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
