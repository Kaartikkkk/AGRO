import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DiseaseDetection from '../components/dashboard/DiseaseDetection';

const DiseaseScannerPage = () => {
  return (
    <DashboardLayout title="Crop Scanner" subtitle="Upload crop photos for AI-powered disease detection">
      <div className="max-w-3xl">
        <DiseaseDetection />
      </div>
    </DashboardLayout>
  );
};

export default DiseaseScannerPage;
