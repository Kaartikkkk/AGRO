import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Profile from '../pages/Profile';
import CompleteProfile from '../pages/CompleteProfile';
import FertilizerHub from '../pages/FertilizerHub';

// New Dynamic Pages
import WeatherPage from '../pages/WeatherPage';
import MandiPage from '../pages/MandiPage';
import RemindersPage from '../pages/RemindersPage';
import AIAdvisorPage from '../pages/AIAdvisorPage';
import DiseaseScannerPage from '../pages/DiseaseScannerPage';
import FarmManagement from '../pages/FarmManagement';

import ProtectedRoute from '../components/auth/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/farms" 
        element={
          <ProtectedRoute>
            <FarmManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/complete-profile" 
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/add-plot" 
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/edit-plot/:id" 
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/fertilizer" 
        element={
          <ProtectedRoute>
            <FertilizerHub />
          </ProtectedRoute>
        } 
      />

      {/* Dynamic Strategic Pages */}
      <Route 
        path="/weather" 
        element={
          <ProtectedRoute>
            <WeatherPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mandi" 
        element={
          <ProtectedRoute>
            <MandiPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reminders" 
        element={
          <ProtectedRoute>
            <RemindersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai" 
        element={
          <ProtectedRoute>
            <AIAdvisorPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/disease" 
        element={
          <ProtectedRoute>
            <DiseaseScannerPage />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
