import React from 'react';

const PlotCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 animate-pulse space-y-4">
      {/* Name and Action Menu skeleton */}
      <div className="flex justify-between items-start">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-4" />
      </div>

      {/* Crop badge skeleton */}
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-24" />
        <div className="h-6 bg-gray-200 rounded-full w-16" />
      </div>

      {/* Size and Location details skeleton */}
      <div className="space-y-2 pt-2">
        <div className="h-3.5 bg-gray-200 rounded w-1/3" />
        <div className="h-3.5 bg-gray-200 rounded w-1/2" />
      </div>

      {/* Progress bar timeline skeleton */}
      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-2 bg-gray-200 rounded-full w-full" />
      </div>
    </div>
  );
};

export default PlotCardSkeleton;
