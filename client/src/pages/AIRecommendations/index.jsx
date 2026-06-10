import React from 'react';
import DashboardLayout from '../../components/layout/MainLayout';
import AIRecommendations from '../Dashboard/components/AIRecommendations';

const AIAdvisorPage = () => {
  return (
    <DashboardLayout title="AI Advisor" subtitle="Smart farming recommendations based on your data">
      <AIRecommendations />
    </DashboardLayout>
  );
};

export default AIAdvisorPage;
