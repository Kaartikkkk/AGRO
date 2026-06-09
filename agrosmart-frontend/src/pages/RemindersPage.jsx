import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import TaskPanel from '../components/dashboard/TaskPanel';

const RemindersPage = () => {
  return (
    <DashboardLayout title="Reminders" subtitle="Manage your farm tasks and schedule">
      <div className="max-w-3xl">
        <TaskPanel />
      </div>
    </DashboardLayout>
  );
};

export default RemindersPage;
