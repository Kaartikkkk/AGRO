import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Register';
import Profile from '../pages/Profile';
import CompleteProfile from '../pages/CompleteProfile';
import FertilizerHub from '../pages/FertilizerHub';

// New Dynamic Pages
import WeatherPage from '../pages/WeatherForecast';
import MandiPage from '../pages/MandiPrices';
import RemindersPage from '../pages/Reminders';
import AIAdvisorPage from '../pages/AIRecommendations';
import DiseaseScannerPage from '../pages/DiseaseDetection';
import LandManagement from '../pages/LandManagement';
import PlotDetail from '../pages/LandManagement/PlotDetail';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />
      
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
            <LandManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/farms/:id" 
        element={
          <ProtectedRoute>
            <PlotDetail />
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
