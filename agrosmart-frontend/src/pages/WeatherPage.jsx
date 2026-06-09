import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import WeatherCard from '../components/dashboard/WeatherCard';

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
