import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AIRecommendations from '../components/dashboard/AIRecommendations';

const AIAdvisorPage = () => {
  return (
    <DashboardLayout title="AI Advisor" subtitle="Smart farming recommendations based on your data">
      <AIRecommendations />
    </DashboardLayout>
  );
};

export default AIAdvisorPage;
