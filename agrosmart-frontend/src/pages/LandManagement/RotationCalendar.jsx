import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, HelpCircle, CheckCircle } from 'lucide-react';
import { CROP_DETAILS } from '../../utils/cropRotationRules';
import { formatIndianDate } from '../../utils/cropSeasonDates';

const RotationCalendar = ({ plot, history }) => {
  const isFallow = plot.currentCrop === 'Fallow/Empty';

  // Gather list of cycles to display in the horizontal timeline
  // We want to show up to 3 past cycles, the current cycle, and the next planned cycle.
  const timelineItems = [];

  // 1. Add Past Cycles (sorted oldest to newest for chronological flow: left to right)
  const pastCycles = history ? [...history].slice(0, 3).reverse() : [];
  pastCycles.forEach((past) => {
    const cropInfo = CROP_DETAILS[past.cropName] || { emoji: '🟫', reason: '' };
    timelineItems.push({
      id: `past-${past.id}`,
      type: 'past',
      season: past.season,
      cropName: past.cropName,
      emoji: cropInfo.emoji,
      dateRange: `${formatIndianDate(past.sowingDate)} - ${formatIndianDate(past.harvestDate)}`,
      badge: 'Harvested',
      yieldInfo: past.yieldAmount ? `${past.yieldAmount} ${past.yieldUnit || 'kg'}` : null
    });
  });

  // 2. Add Current Cycle
  if (!isFallow) {
    const cropInfo = CROP_DETAILS[plot.currentCrop] || { emoji: '🟫', reason: '' };
    timelineItems.push({
      id: 'current',
      type: 'current',
      season: 'Current Cycle',
      cropName: plot.currentCrop,
      emoji: cropInfo.emoji,
      dateRange: `${formatIndianDate(plot.sowingDate)} - ${formatIndianDate(plot.harvestDate)}`,
      badge: 'Growing'
    });
  } else {
    timelineItems.push({
      id: 'current-fallow',
      type: 'fallow',
      season: 'Current State',
      cropName: 'Fallow / Empty',
      emoji: '🟫',
      dateRange: 'Resting season',
      badge: 'Empty Land'
    });
  }

  // 3. Add Next Planned Cycle (Dashed green border block)
  timelineItems.push({
    id: 'next-planned',
    type: 'planned',
    season: 'Next Cycle (Planned)',
    cropName: 'Rotation Planned',
    emoji: '🌾',
    dateRange: 'Awaiting sowing',
    badge: 'Recommended'
  });

  return (
    <div className="relative overflow-x-auto py-6 px-1 scrollbar-thin">
      
      {/* Horizontal Line connecting items (desktop only) */}
      <div className="absolute top-[80px] left-10 right-10 h-0.5 bg-gray-150 -z-10 hidden md:block" />

      {/* Grid on mobile, flex row on desktop */}
      <div className="flex flex-col md:flex-row gap-6 justify-between min-w-max md:min-w-0">
        {timelineItems.map((item, index) => {
          let containerClass = '';
          let headerClass = '';
          let textClass = '';
          let badgeClass = '';

          if (item.type === 'past') {
            containerClass = 'bg-gray-50 border-gray-200 text-gray-650';
            headerClass = 'bg-gray-100/70 border-gray-200 text-gray-700';
            textClass = 'text-gray-500';
            badgeClass = 'bg-gray-150 text-gray-600';
          } else if (item.type === 'current') {
            containerClass = 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-100 ring-offset-1 text-emerald-900 shadow-sm';
            headerClass = 'bg-emerald-100/50 border-emerald-200 text-emerald-800 font-bold';
            textClass = 'text-emerald-700';
            badgeClass = 'bg-emerald-200/80 text-emerald-800';
          } else if (item.type === 'fallow') {
            containerClass = 'bg-amber-50/40 border-amber-300 border-dashed text-amber-900';
            headerClass = 'bg-amber-100/30 border-amber-250 text-amber-800 font-bold';
            textClass = 'text-amber-700';
            badgeClass = 'bg-amber-200/50 text-amber-800';
          } else if (item.type === 'planned') {
            containerClass = 'bg-white border-primary-200 border-2 border-dashed text-primary shadow-sm';
            headerClass = 'bg-emerald-50/30 border-primary-100 text-primary font-bold';
            textClass = 'text-gray-500';
            badgeClass = 'bg-primary-50 text-primary border border-primary-100';
          }

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`w-full md:w-60 border rounded-2xl flex flex-col overflow-hidden text-xs transition-transform hover:scale-[1.01] ${containerClass}`}
            >
              {/* Header Box */}
              <div className={`px-4 py-2 border-b text-[10px] uppercase font-bold tracking-wider flex items-center justify-between ${headerClass}`}>
                <span>{item.season}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold ${badgeClass}`}>
                  {item.badge}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label="crop-emoji">
                      {item.emoji}
                    </span>
                    <strong className="text-sm font-bold text-gray-900 block capitalize">
                      {item.cropName}
                    </strong>
                  </div>
                  <span className={`block text-[10px] font-medium ${textClass}`}>
                    {item.dateRange}
                  </span>
                </div>

                {/* Additional footer context per type */}
                {item.type === 'past' && (
                  <div className="border-t border-gray-150 pt-2 flex justify-between items-center text-[10px] text-gray-400">
                    <span>Yield achieved:</span>
                    <strong className="text-gray-700 font-bold">{item.yieldInfo || 'N/A'}</strong>
                  </div>
                )}

                {item.type === 'current' && (
                  <div className="border-t border-emerald-200 pt-2 flex items-center gap-1 text-[10px] text-emerald-800">
                    <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                    <span>In progress on land</span>
                  </div>
                )}

                {item.type === 'fallow' && (
                  <div className="border-t border-amber-250 pt-2 flex items-center gap-1 text-[10px] text-amber-800">
                    <HelpCircle size={12} className="text-amber-600 shrink-0" />
                    <span>Awaiting rotation plan</span>
                  </div>
                )}

                {item.type === 'planned' && (
                  <div className="border-t border-dashed border-emerald-200 pt-2 flex items-center gap-1 text-[10px] text-emerald-800">
                    <Sprout size={12} className="text-primary shrink-0" />
                    <span>Optimize soil nitrogen</span>
                  </div>
                )}

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RotationCalendar;
