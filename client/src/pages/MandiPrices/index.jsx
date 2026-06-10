import React from 'react';
import DashboardLayout from '../../components/layout/MainLayout';
import MandiPrices from '../Dashboard/components/MandiPrices';

const MandiPage = () => {
  return (
    <DashboardLayout title="Market Prices" subtitle="Live APMC market prices and trends">
      <MandiPrices />
    </DashboardLayout>
  );
};

export default MandiPage;
