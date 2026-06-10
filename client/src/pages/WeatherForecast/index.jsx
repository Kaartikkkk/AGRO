import React from 'react';
import DashboardLayout from '../../components/layout/MainLayout';
import WeatherCard from '../Dashboard/components/WeatherCard';

const WeatherPage = () => {
  return (
    <DashboardLayout title="Weather" subtitle="Real-time weather data and forecasts for your farm">
      <div className="max-w-3xl">
        <WeatherCard />
      </div>
    </DashboardLayout>
  );
};

export default WeatherPage;
