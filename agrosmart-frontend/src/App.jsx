import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FarmProvider>
          <div className="min-h-screen">
            <AppRoutes />
          </div>
        </FarmProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
