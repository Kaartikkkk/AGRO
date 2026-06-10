import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import { ToastProvider } from './components/common/Toast';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <FarmProvider>
            <div className="min-h-screen">
              <AppRoutes />
            </div>
          </FarmProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
