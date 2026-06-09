import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import MandiPrices from '../components/dashboard/MandiPrices';

const MandiPage = () => {
  return (
    <DashboardLayout title="Market Prices" subtitle="Live APMC market prices and trends">
      <MandiPrices />
    </DashboardLayout>
  );
};

export default MandiPage;
